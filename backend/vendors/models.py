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
    business_hours = models.CharField(max_length=255)
    services_offered = services_offered = models.ManyToManyField(Service, related_name='vendors')
    accepted_file_formats = models.CharField(max_length=255)
    pricing_information = models.TextField()
    payment_methods = models.CharField(max_length=255)
    terms_and_conditions = models.TextField()
    printer_specifications = models.TextField(blank=True, null=True)
    vendor_logo_url = models.URLField(blank=True, null=True)
    reviews_and_ratings = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.business_name
