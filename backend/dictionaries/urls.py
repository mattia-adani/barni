from django.urls import path
from . import views

urlpatterns = [
    path('', views.dictionaries),
    path('insert/', views.insert),
    path('delete/', views.delete),
    path('update/', views.update),
    path('dictionary/', views.dictionary),
    path('dictionary/tag/insert/', views.tag_insert),
    path('dictionary/tag/update/', views.tag_update),
    path('dictionary/tag/delete/', views.tag_delete),
]