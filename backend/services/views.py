from rest_framework import generics
from .models import Service
from .serializers import ServiceSerializer
from vendors.models import Vendor, VendorService
from vendors.serializers import VendorSerializer
import math
from django.db.models import F, FloatField
from django.db.models.functions import Sqrt, Power, Cast, Radians, Sin, Cos, ATan2
from rest_framework.response import Response

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

        user_lat_rad = math.radians(user_latitude)
        user_lon_rad = math.radians(user_longitude)

        vendors = Vendor.objects.annotate(
            distance=(
                6371 * 2 * ATan2(
                    Sqrt(
                        Sin(
                            (Radians(F('location_latitude')) - user_lat_rad) / 2,
                            output_field=FloatField()
                        ) ** 2 +
                        Cos(user_lat_rad) * Cos(Radians(F('location_latitude'))) *
                        Sin(
                            (Radians(F('location_longitude')) - user_lon_rad) / 2,
                            output_field=FloatField()
                        ) ** 2
                    ),
                    Sqrt(
                        1 - (
                            Sin(
                                (Radians(F('location_latitude')) - user_lat_rad) / 2,
                                output_field=FloatField()
                            ) ** 2 +
                            Cos(user_lat_rad) * Cos(Radians(F('location_latitude'))) *
                            Sin(
                                (Radians(F('location_longitude')) - user_lon_rad) / 2,
                                output_field=FloatField()
                            ) ** 2
                        ),
                        output_field=FloatField()
                    ),
                    output_field=FloatField()
                )
            )
        ).filter(distance__lte=radius_km, is_active=True)

        if service_id != 0:
            vendors = vendors.filter(
                vendor_services__service_id=service_id,
                vendor_services__is_active=True
            )

        vendors = vendors.order_by('distance', '-reviews_and_ratings')

        return vendors

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)