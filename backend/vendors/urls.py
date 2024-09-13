from django.urls import path
from .views import VendorCreateView, VendorDetailView, VendorListView, VendorUpdateView, VendorDeleteView, VendorServiceSearchView, top_services_view

urlpatterns = [
    path('register/', VendorCreateView.as_view(), name='vendor-register'),
    path('<int:pk>/', VendorDetailView.as_view(), name='vendor-detail'),  # Retrieve a specific vendor by ID
    path('', VendorListView.as_view(), name='vendor-list'),  # List all vendors
    path('<int:pk>/edit/', VendorUpdateView.as_view(), name='vendor-edit'),
    path('<int:pk>/delete/', VendorDeleteView.as_view(), name='vendor-delete'),
    path('search/', VendorServiceSearchView.as_view(), name='vendor-service-search'),  # Search URL
    path('top-services/', top_services_view, name='top_services'),  # Top services URL
]
