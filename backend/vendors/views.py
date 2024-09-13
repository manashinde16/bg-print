from rest_framework import generics, status
from rest_framework.response import Response
from .models import Vendor
from .serializers import VendorSerializer
from services.models import Service
from services.serializers import ServiceSerializer
from django.http import JsonResponse
from django.db.models import Count
from vendors.models import VendorService
from django.core.cache import cache
from django.views.decorators.cache import cache_page

@cache_page(900)  # Cache for 15 minutes
def top_services_view(request):
    top_services = VendorService.objects.filter(is_active=True)\
        .values('service__id', 'service__name')\
        .annotate(service_count=Count('service'))\
        .order_by('-service_count')[:2]
    return JsonResponse(list(top_services), safe=False)

class VendorCreateView(generics.CreateAPIView):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer

class VendorListView(generics.ListAPIView):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer

class VendorDetailView(generics.RetrieveAPIView):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer

class VendorUpdateView(generics.UpdateAPIView):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer

class VendorDeleteView(generics.DestroyAPIView):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer

class VendorServiceSearchView(generics.ListAPIView):
    vendor_serializer_class = VendorSerializer
    service_serializer_class = ServiceSerializer

    def get_queryset(self):
        query = self.request.query_params.get('q', None)
        vendors = Vendor.objects.filter(business_name__icontains=query) if query else Vendor.objects.all()
        services = Service.objects.filter(name__icontains=query) if query else Service.objects.all()
        return vendors, services

    def list(self, request, *args, **kwargs):
        vendors, services = self.get_queryset()
        vendor_data = self.vendor_serializer_class(vendors, many=True).data
        service_data = self.service_serializer_class(services, many=True).data
        return Response({
            'vendors': vendor_data,
            'services': service_data
        })