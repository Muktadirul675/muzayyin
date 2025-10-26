from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .pathao_client import get_pathao_client
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from decimal import Decimal
from orders.models import Order
import json
from rest_framework.permissions import AllowAny

client = get_pathao_client()

WEBHOOK_SECRET = "f3992ecc-59da-4cbe-a049-a13da2018d51"

@method_decorator(csrf_exempt, name='dispatch')
class CourierWebhookView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        data = request.data
        print(f"COURIER PAYLOAD:\n{(data)}\n")
        # Extract required fields
        c_id = data.get('consignment_id')
        merchant_order_id = data.get('merchant_order_id')
        event = data.get('event')
        collected_amount = data.get('collected_amount')
        reason = data.get('reason')

        if event == "webhook_integration":
            return Response({"Sucess":True}, 
                            status=status.HTTP_202_ACCEPTED,
                            headers={"X-Pathao-Merchant-Webhook-Integration-Secret": "f3992ecc-59da-4cbe-a049-a13da2018d51"}
                    )

        # if not all([c_id, merchant_order_id, event]):
        #     return Response({'detail': 'Invalid payload'}, status=status.HTTP_400_BAD_REQUEST)

        # Map event to simplified status key
        event_key = event.replace('order.', '').strip()

        try:
            order = Order.objects.get(id=int(merchant_order_id))
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        # Update courier status always
        order.courier_status = event_key

        # Update collected amount if present
        if collected_amount is not None:
            try:
                order.collected_amount = Decimal(str(collected_amount))
            except Exception:
                pass  # Ignore malformed collected_amount

        # Status map based on your provided logic
        if event_key in ['delivered', 'partial-delivery']:
            order.status = 'delivered' if event_key == 'delivered' else 'partially_delivered'
        elif event_key == 'returned':
            order.status = 'returned'
        elif event_key == 'paid-return':
            order.status = 'paid_returned'
        elif event_key in ['delivery-failed', 'pickup-failed']:
            order.status = 'failed'
        elif event_key == 'partial-returned':
            order.status = 'partially_returned'
        elif event_key == 'picked':
            order.status = 'shipped'
        elif event_key == 'pickup-cancelled':
            order.status = 'cancelled'
        elif event_key == 'created':
            order.status = 'processing'

        if reason:
            order.courier_reason = reason
        order.save()

        return Response(
            {"detail": "Webhook received"},
            status=status.HTTP_202_ACCEPTED,
            headers={"X-Pathao-Merchant-Webhook-Integration-Secret": "f3992ecc-59da-4cbe-a049-a13da2018d51"}
        )

@api_view(['GET'])
def get_delivery_charge(request):
    city_id = request.query_params.get('city_id')
    zone_id = request.query_params.get('zone_id')

    if not city_id or not zone_id:
        return Response({"detail": "city_id and zone_id are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        response = client.get_delivery_charge(
            city_id=int(city_id),
            zone_id=int(zone_id)
        )
        return Response(response, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_stores(request):
    try:
        stores = client.get_stores()
        return Response(stores, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def create_dummy_order(request):
    try:

        result = client.create_order(
            store_id="1",
            order_id="dummy1234",
            sender_name="Your Business",
            sender_phone="018xxxxxxxx",
            recipient_name="John Doe",
            recipient_phone="017xxxxxxxx",
            address="Somewhere in Dhaka",
            city_id=1,  # e.g., Dhaka
            zone_id=14,
            area_id=242,
            special_instruction="Handle with care",
            item_quantity=1,
            item_weight=1,
            amount_to_collect=500,
            item_description="Test Product"
        )


        return Response(result, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CityListAPIView(APIView):
    def get(self, request):
        print("loading cities")
        pathao_courier_cache_key = 'courier:pathao:cities'
        timeout = 3600
        client = get_pathao_client()
        print("client loaded")
        try:
            print("loading cache")
            cached_cities = cache.get(pathao_courier_cache_key)
            print("loaded cache")
            if cached_cities:
                print("cache found")
                return Response(cached_cities, status=status.HTTP_200_OK)
            print("Cache not found\nLoading from pathao")
            cities = client.get_city_list()
            print("loaded from pathao")
            cache.set(pathao_courier_cache_key, cities, timeout=timeout)
            return Response(cities, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ZoneListAPIView(APIView):
    def get(self, request):
        city_id = request.query_params.get('city_id')
        if not city_id:
            return Response({'error': 'city_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        pathao_courier_cache_key = f'courier:pathao:{city_id}:zones'
        timeout = 3500
        try:
            cached_zones = cache.get(pathao_courier_cache_key)
            if cached_zones:
                return Response(cached_zones, status=status.HTTP_200_OK)
            zones = client.get_zone_list(city_id=int(city_id))
            cache.set(pathao_courier_cache_key, zones, timeout=timeout)
            return Response(zones, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AreaListAPIView(APIView):
    def get(self, request):
        zone_id = request.query_params.get('zone_id')
        if not zone_id:
            return Response({'error': 'zone_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        pathao_courier_cache_key = f'courier:pathao:{zone_id}:zones'
        timeout = 3400
        try:
            cached_areas = cache.get(pathao_courier_cache_key)
            if cached_areas:
                return Response(cached_areas, status=status.HTTP_200_OK)
            areas = client.get_area_list(zone_id=int(zone_id))
            cache.set(pathao_courier_cache_key, areas, timeout=timeout)
            return Response(areas, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
