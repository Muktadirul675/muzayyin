from datetime import date, timedelta 
from django.db.models import Sum, Count, Q 
from django.db.models.functions import TruncDate 
from rest_framework.views import APIView 
from rest_framework.response import Response 
from sales.models import Sale
from datetime import date, timedelta
from django.db.models.functions import TruncDate
from django.db.models import Sum, Count, Q
from django.utils.dateparse import parse_date
from datetime import date, timedelta
from orders.models import Order
from rest_framework.views import APIView 
from rest_framework.response import Response 
from orders.models import OrderItem 
from sales.models import Sale 
from django.utils.dateparse import parse_datetime
from collections import defaultdict 
from products.models import Product
from products.serializers import ProductOrderReportSerializer
from django.db.models import OuterRef, Subquery, Count, IntegerField
from django.db.models.functions import Coalesce

class ProductOrderReport(APIView):
    def get(self, request):
        start_date = request.query_params.get("start")
        end_date = request.query_params.get("end")

        orderitem_filter = Q(product=OuterRef('pk'))

        if start_date:
            orderitem_filter &= Q(order__created_at__date__gte=parse_date(start_date))
        if end_date:
            orderitem_filter &= Q(order__created_at__date__lte=parse_date(end_date))

        filtered_orderitems = (
            OrderItem.objects
            .filter(orderitem_filter,order__status='confirmed')
            .values('product')
            .annotate(count=Count('id'))
            .values('count')
        )

        products = Product.objects.annotate(
            order_count=Coalesce(Subquery(filtered_orderitems, output_field=IntegerField()), 0)
        ).order_by('-order_count')

        serializer = ProductOrderReportSerializer(products, many=True)
        return Response(serializer.data)

class ProductPerformanceView(APIView):
    def get(self, request):
        start_raw = request.query_params.get('start')
        end_raw = request.query_params.get('end')
        start = parse_date(start_raw) if start_raw else None
        end = parse_date(end_raw) if end_raw else None

        sales = Sale.objects.filter(refunded=False)

        if start:
            sales = sales.filter(created_at_date__gte=start)
        if end:
            sales = sales.filter(created_at_date__lte=end)

        total_sales_amount = float(sales.aggregate(total=Sum('ordered_price'))['total'] or 0)
        order_ids = sales.values_list('order_id', flat=True)
        items = OrderItem.objects.filter(order_id__in=order_ids)

        product_amount_map = defaultdict(lambda: {'amount': 0, 'sku': '', 'name': ''})

        for item in items:
            if not item.product:
                continue
            key = item.product.id
            product_amount_map[key]['amount'] += float(item.price_at_purchase) * item.quantity
            product_amount_map[key]['sku'] = item.product.sku
            product_amount_map[key]['name'] = item.product.name

        result = []
        for data in product_amount_map.values():
            percentage = (data['amount'] / total_sales_amount) * 100 if total_sales_amount > 0 else 0
            result.append({
                'product': data['name'],
                'sku': data['sku'],
                'amount': round(data['amount'], 2),
                'percentage': round(percentage, 2)
            })

        result.sort(key=lambda x: x['amount'], reverse=True)
        return Response(result)

class ProductSalesCountReportView(APIView): 
    def get(self, request): 
        start = request.query_params.get('start') 
        end = request.query_params.get('end')

        if not start or not end:
            end_date = date.today()
            start_date = end_date - timedelta(days=30)
        else:
            start_date = parse_date(start)
            end_date = parse_date(end)

        order_ids = Sale.objects.filter(
            refunded=False,
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        ).values_list('order_id', flat=True)

        items = OrderItem.objects.filter(order_id__in=order_ids)

        product_counts = defaultdict(lambda: {'count': 0, 'sku': '', 'name': '','image':''})
        for item in items:
            if not item.product:
                continue
            pid = item.product.id
            product_counts[pid]['count'] += item.quantity
            product_counts[pid]['sku'] = item.product.sku
            product_counts[pid]['name'] = item.product.name
            product_counts[pid]['image'] = item.product.images.all()[0].image.url

        result = [
            {
                'product': data['name'],
                'image':data['image'],
                'sku': data['sku'],
                'count': data['count']
            }
            for data in product_counts.values()
        ]

        result.sort(key=lambda x: x['count'], reverse=True)
        return Response(result)



ORDER_STATUSES = [
    'pending', 'confirmed', 'processing', 'hold',
    'shipped', 'delivered', 'cancelled', 'returned', 'failed'
]

class OrderStatsView(APIView):
    def get(self, request):
        start_date = request.query_params.get("start")
        end_date = request.query_params.get("end")

        # Parse dates from query parameters
        filters = {}
        if start_date:
            filters["created_at__date__gte"] = parse_date(start_date)
        if end_date:
            filters["created_at__date__lte"] = parse_date(end_date)

        stats = {}
        filtered_orders = Order.objects.filter(**filters)

        stats["total"] = filtered_orders.count()
        for status in ORDER_STATUSES:
            stats[status] = filtered_orders.filter(status=status).count()

        return Response(stats)

class OrderOriginSummaryView(APIView):
    def get(self, request):
        start_date = request.query_params.get("start")
        end_date = request.query_params.get("end")

        # Apply optional date filters
        filters = {}
        if start_date:
            filters["created_at__date__gte"] = parse_date(start_date)
        if end_date:
            filters["created_at__date__lte"] = parse_date(end_date)

        queryset = Order.objects.filter(**filters)

        # Group by origin and count
        origin_counts = queryset.values("source").annotate(count=Count("id"))

        result = {}  # total orders
        for entry in origin_counts:
            origin = entry["source"] or "unknown"
            result[origin] = entry["count"]

        return Response(result)


class OrderReportView(APIView):
    def get(self, request):
        start = request.query_params.get('start')
        end = request.query_params.get('end')

        if not start or not end:
            end_date = date.today()
            start_date = end_date - timedelta(days=30)
        else:
            start_date = parse_date(start)
            end_date = parse_date(end)

        qs = Order.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        )

        daily = qs.annotate(day=TruncDate('created_at')) \
            .values('day') \
            .annotate(
                count=Count('id'),
                cancellations=Count('id', filter=Q(status__in=['cancelled']))
            ).order_by('day')

        data_map = {d['day']: d for d in daily}
        full_data = []
        current = start_date
        while current <= end_date:
            record = data_map.get(current, {
                'day': current,
                'count': 0,
                'cancellations': 0
            })
            full_data.append({
                'day': record['day'],
                'orders': record['count'],
                'cancellations': record['cancellations']
            })
            current += timedelta(days=1)

        return Response(full_data)
        
class SalesReportView(APIView):
    def get(self, request):
        start = request.query_params.get('start')
        end = request.query_params.get('end')

        if not start or not end:
            end_date = date.today()
            start_date = end_date - timedelta(days=30)
        else:
            start_date = parse_date(start)
            end_date = parse_date(end)

        # â Ensure inclusive filtering of end_date
        qs = Sale.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lt=end_date + timedelta(days=1)
        )

        daily = qs.annotate(day=TruncDate('created_at')) \
            .values('day') \
            .annotate(
                sales=Sum('ordered_price', filter=Q(refunded=False)),
                profit=Sum('profit', filter=Q(refunded=False)),
                refunds=Count('id', filter=Q(refunded=True))
            ).order_by('day')

        data_map = {d['day']: d for d in daily}
        full_data = []
        current = start_date
        while current <= end_date:
            record = data_map.get(current, {
                'day': current,
                'sales': 0,
                'profit': 0,
                'refunds': 0,
            })
            full_data.append({
                'day': record['day'],
                'sales': float(record['sales'] or 0),
                'profit': float(record['profit'] or 0),
                'refunds': record['refunds'],
            })
            current += timedelta(days=1)

        return Response(full_data)
    
class SalesSummaryView(APIView):
    def get(self, request):
        start = request.query_params.get('start')
        end = request.query_params.get('end')

        sales_qs = Sale.objects.all()
        if start:
            sales_qs = sales_qs.filter(created_at__date__gte=parse_date(start))
        if end:
            sales_qs = sales_qs.filter(created_at__date__lte=parse_date(end))

        total_sales_count = sales_qs.filter(refunded=False).count()
        total_sales_amount = sales_qs.filter(refunded=False).aggregate(total=Sum('ordered_price'))['total'] or 0
        total_profit = sales_qs.filter(refunded=False).aggregate(total=Sum('profit'))['total'] or 0
        total_refunds = sales_qs.filter(refunded=True).count()

        return Response({
            "sales_count": total_sales_count,
            "sales_amount": float(total_sales_amount),
            "total_profit": float(total_profit),
            "refunds": total_refunds
        })
