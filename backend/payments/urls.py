# urls.py

from django.urls import path
from .views import initiate_payment, verify_payment, get_csrf_token

urlpatterns = [
    path('initiate-payment/', initiate_payment, name='initiate_payment'),
    path('verify-payment/', verify_payment, name='verify_payment'),
    path('get-csrf-token/', get_csrf_token, name='get_csrf_token'),
]
