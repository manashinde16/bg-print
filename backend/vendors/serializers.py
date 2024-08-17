from rest_framework import serializers
from .models import Vendor
from services.models import Service
from services.serializers import ServiceSerializer

class VendorSerializer(serializers.ModelSerializer):
    # Read-only field that shows full details of the services
    services_offered = ServiceSerializer(many=True, read_only=True)

    # Write-only field that accepts a list of service IDs
    services_offered_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        write_only=True, 
        queryset=Service.objects.all(),
        source='services_offered',  # Maps to the services_offered field in the model
        required=False
    )

    class Meta:
        model = Vendor
        fields = '__all__'
