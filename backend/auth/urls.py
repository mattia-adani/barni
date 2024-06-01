from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login),
    path('change_password/', views.change_password),
    path('verify/<str:token>', views.verify),
    path('access_control/', views.access_control),
    path('access_control/insert/', views.access_control_insert),
    path('access_control/delete/', views.access_control_delete),
    path('access_control/update/', views.access_control_update),
    path('users/', views.users),
    path('users/list/', views.users_list),
    path('users/delete/', views.users_delete),
    path('users/insert/', views.users_insert),
    path('users/update/', views.users_update),
 #   path('users/update-password/', views.users_update_password),

]