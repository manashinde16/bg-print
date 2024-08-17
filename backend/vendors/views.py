from rest_framework import generics, status
from rest_framework.response import Response
from .models import Vendor
from .serializers import VendorSerializer
from services.models import Service
from services.serializers import ServiceSerializer

class VendorCreateView(generics.CreateAPIView):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        vendor = serializer.save()

        services_offered_ids = request.data.get('services_offered_ids')
        if services_offered_ids:
            vendor.services_offered.set(Service.objects.filter(id__in=services_offered_ids))

        return Response(serializer.data, status=status.HTTP_201_CREATED)

class VendorListView(generics.ListAPIView):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer

class VendorDetailView(generics.RetrieveAPIView):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer

class VendorUpdateView(generics.UpdateAPIView):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        services_offered_ids = request.data.get('services_offered_ids')
        if services_offered_ids is not None:
            instance.services_offered.set(Service.objects.filter(id__in=services_offered_ids))
        
        self.perform_update(serializer)
        return Response(serializer.data)

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