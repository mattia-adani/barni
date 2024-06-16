from django.urls import path
from . import views

urlpatterns = [
    path('list/', views.devices_list),
    path('detail/', views.device_detail),
    path('insert/', views.device_insert),
    path('delete/', views.device_delete),
    path('update/', views.device_update),
    path('property/insert/', views.device_property_insert),
    path('property/delete/', views.device_property_delete),
    path('property/update/', views.device_property_update),
]