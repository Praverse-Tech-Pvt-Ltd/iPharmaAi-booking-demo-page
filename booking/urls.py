from django.urls import path

from . import views

urlpatterns = [
    path('', views.page, name='booking-page'),
    path('api/book', views.book_api, name='book-api'),
    path('api/availability', views.availability_api, name='availability-api'),
]
