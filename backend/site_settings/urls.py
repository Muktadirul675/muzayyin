from django.urls import path
from .views import UpdateSiteSettingView
from django.urls import path
from .views import SiteSettingsListView

urlpatterns = [
    path('', SiteSettingsListView.as_view(), name='site-settings-list'),
    path('update/', UpdateSiteSettingView.as_view(), name='update-site-settings'),
]