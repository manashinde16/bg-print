from rest_framework import serializers
from .models import Vendor, VendorService, BusinessHour, Service
from services.serializers import ServiceSerializer

class VendorServiceSerializer(serializers.ModelSerializer):
    service = ServiceSerializer(read_only=True)
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.all(),
        source='service',
        write_only=True
    )

    class Meta:
        model = VendorService
        fields = ['id', 'service', 'service_id', 'is_active']

class BusinessHourSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessHour
        fields = ['id', 'day', 'open_time', 'close_time']

class VendorSerializer(serializers.ModelSerializer):
    vendor_services = VendorServiceSerializer(many=True, read_only=True)
    business_hours = BusinessHourSerializer(many=True, read_only=True)

    class Meta:
        model = Vendor
        fields = '__all__'

    def create(self, validated_data):
        vendor_services_data = self.context['request'].data.get('vendor_services', [])
        business_hours_data = self.context['request'].data.get('business_hours', [])

        vendor = Vendor.objects.create(**validated_data)

        for vendor_service_data in vendor_services_data:
            VendorService.objects.create(vendor=vendor, **vendor_service_data)

        for business_hour_data in business_hours_data:
            BusinessHour.objects.create(vendor=vendor, **business_hour_data)

        return vendor

    def update(self, instance, validated_data):
        vendor_services_data = self.context['request'].data.get('vendor_services', [])
        business_hours_data = self.context['request'].data.get('business_hours', [])

        instance = super().update(instance, validated_data)

        # Update vendor services
        instance.vendor_services.all().delete()
        for vendor_service_data in vendor_services_data:
            VendorService.objects.create(vendor=instance, **vendor_service_data)

        # Update business hours
        instance.business_hours.all().delete()
        for business_hour_data in business_hours_data:
            BusinessHour.objects.create(vendor=instance, **business_hour_data)

        return instance