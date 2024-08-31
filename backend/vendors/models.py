from django.db import models
from services.models import Service

class Vendor(models.Model):
    business_name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255)
    contact_email = models.EmailField(unique=True)
    contact_phone_number = models.CharField(max_length=15)
    address = models.CharField(max_length=255)
    location_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    location_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    is_active = models.BooleanField(default=True)
    accepted_file_formats = models.CharField(max_length=255)
    pricing_information = models.TextField()
    payment_methods = models.CharField(max_length=255)
    terms_and_conditions = models.TextField()
    printer_specifications = models.TextField(blank=True, null=True)
    vendor_logo_url = models.URLField(blank=True, null=True)
    reviews_and_ratings = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.business_name

class VendorService(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='vendor_services')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='vendor_services')
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('vendor', 'service')

class BusinessHour(models.Model):
    DAYS_OF_WEEK = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]

    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='business_hours')
    day = models.IntegerField(choices=DAYS_OF_WEEK)
    open_time = models.TimeField()
    close_time = models.TimeField()

    class Meta:
        unique_together = ('vendor', 'day')