from django.urls import path
from .views import ServiceCreateView, ServiceDetailView, ServiceListView, VendorsByServiceView

urlpatterns = [
    path('', ServiceListView.as_view(), name='service-list'),
    path('register/', ServiceCreateView.as_view(), name='service-register'),
    path('<int:pk>/', ServiceDetailView.as_view(), name='service-detail'),
    path('<int:service_id>/vendors/', VendorsByServiceView.as_view(), name='vendors-by-service'),
]