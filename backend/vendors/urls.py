from django.urls import path
from .views import VendorCreateView, VendorDetailView, VendorListView

urlpatterns = [
    path('register/', VendorCreateView.as_view(), name='vendor-register'),
    path('<int:pk>/', VendorDetailView.as_view(), name='vendor-detail'),  # Retrieve a specific vendor by ID
    path('', VendorListView.as_view(), name='vendor-list'),  # List all vendors
]
