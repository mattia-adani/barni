from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.test),
    path('devices/', views.devices),    
    path('device/', views.device),    
    path('colors/', views.colors),    
    path('RGBcolor/', views.RGBcolor),    
    path('all_devices/', views.all_devices),    

]