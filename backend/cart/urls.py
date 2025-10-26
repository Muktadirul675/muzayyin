from django.urls import path
from .views import CartViewSet

cart_list = CartViewSet.as_view({
    'get': 'list',
    'post': 'add_item',
})

cart_checkout = CartViewSet.as_view({
    'post': 'checkout'
})

cart_item_detail = CartViewSet.as_view({
    'patch': 'update_item',
    'delete': 'remove_item',
})

urlpatterns = [
    path('', cart_list, name='cart-list'),
    path('checkout/', cart_checkout, name='cart-checkout'),  # â Explicit checkout path
    path('items/<int:pk>/', cart_item_detail, name='cart-item-detail'),
]