import math
from rest_framework import generics
from .models import Service
from .serializers import ServiceSerializer
from django.db.models import F, FloatField
from django.db.models.functions import Sqrt, Power, Cast
from rest_framework.response import Response
from vendors.models import Vendor
from vendors.serializers import VendorSerializer
from django.db.models import Q

class ServiceCreateView(generics.CreateAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

class ServiceListView(generics.ListAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

class VendorsByServiceView(generics.ListAPIView):
    serializer_class = VendorSerializer

    def get_queryset(self):
        service_id = self.kwargs.get('service_id')
        user_latitude = float(self.request.query_params.get('latitude', 0))
        user_longitude = float(self.request.query_params.get('longitude', 0))
        radius_km = 10  # Radius in kilometers

        print(f"Requested Service ID: {service_id}")
        print(f"User Latitude: {user_latitude}, Longitude: {user_longitude}")

        # Calculate the latitude and longitude bounds for a radius
        # Earth's radius in kilometers
        earth_radius_km = 6371
        lat_diff = radius_km / earth_radius_km
        lon_diff = radius_km / (earth_radius_km * abs(math.cos(math.radians(user_latitude))))

        lat_min = user_latitude - lat_diff
        lat_max = user_latitude + lat_diff
        lon_min = user_longitude - lon_diff
        lon_max = user_longitude + lon_diff

        if service_id == 0:
            # Find all vendors within the 10 km radius
            vendors = Vendor.objects.filter(
                location_latitude__gte=lat_min,
                location_latitude__lte=lat_max,
                location_longitude__gte=lon_min,
                location_longitude__lte=lon_max
            )
        else:
            # Filter vendors who offer the selected service and are within the 10 km radius
            vendors = Vendor.objects.filter(
                services_offered__id=service_id,
                location_latitude__gte=lat_min,
                location_latitude__lte=lat_max,
                location_longitude__gte=lon_min,
                location_longitude__lte=lon_max
            )

        # Annotate with distance
        vendors = vendors.annotate(
            distance=Sqrt(
                Power(
                    Cast(F('location_latitude'), FloatField()) - user_latitude,
                    2
                ) + Power(
                    Cast(F('location_longitude'), FloatField()) - user_longitude,
                    2
                )
            )
        )

        # Sort by distance and rating
        vendors = vendors.order_by('distance', '-reviews_and_ratings')

        return vendors

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
