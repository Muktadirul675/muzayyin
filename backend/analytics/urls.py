from .views import SalesSummaryView, SalesReportView
from django.urls import path
from .views import OrderStatsView, OrderReportView
from .views import ProductPerformanceView, ProductSalesCountReportView, ProductOrderReport, OrderOriginSummaryView

urlpatterns = [
    path('products/performance/', ProductPerformanceView.as_view(), name='product-performance'),
    path('products/report/', ProductSalesCountReportView.as_view(), name='product-sales-report'),
    path('products/report/orders/', ProductOrderReport.as_view(), name='product-orders-report'),
]
urlpatterns += [
    path('orders', OrderStatsView.as_view()),
    path('orders/report', OrderReportView.as_view()),
    path('orders/origins', OrderOriginSummaryView.as_view()),
]
urlpatterns += [
    path('sales/', SalesSummaryView.as_view(), name='sales-summary'),
    path('sales/report/', SalesReportView.as_view(), name='sales-report'),
]