from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .models import Vendor
from services.models import Service
import json

class VendorViewsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.vendor_data = {
            "business_name": "Test Vendor",
            "contact_person": "John Doe",
            "contact_email": "john@example.com",
            "contact_phone_number": "1234567890",
            "address": "123 Test St, Test City",
            "location_latitude": "40.712776",
            "location_longitude": "-74.005974",
            "business_hours": "9AM-5PM",
            "accepted_file_formats": "PDF, JPEG",
            "pricing_information": "Standard rates apply",
            "payment_methods": "Credit Card, PayPal",
            "terms_and_conditions": "Standard terms apply"
        }
        self.vendor = Vendor.objects.create(**self.vendor_data)
        self.service = Service.objects.create(name="Test Service")

    def test_create_vendor(self):
        url = reverse('vendor-register')  # Changed from 'vendor-create' to 'vendor-register'
        data = {**self.vendor_data, 'services_offered': [self.service.id]}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Vendor.objects.count(), 2)
        self.assertEqual(Vendor.objects.last().business_name, 'Test Vendor')
        self.assertIn(self.service, Vendor.objects.last().services_offered.all())

    def test_list_vendors(self):
        url = reverse('vendor-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_vendor(self):
        url = reverse('vendor-detail', kwargs={'pk': self.vendor.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['business_name'], self.vendor.business_name)

    def test_update_vendor(self):
        url = reverse('vendor-edit', kwargs={'pk': self.vendor.pk})  # Changed from 'vendor-update' to 'vendor-edit'
        updated_data = {
            **self.vendor_data,
            'business_name': 'Updated Vendor',
            'services_offered': [self.service.id]
        }
        response = self.client.put(url, updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.vendor.refresh_from_db()
        self.assertEqual(self.vendor.business_name, 'Updated Vendor')
        self.assertIn(self.service, self.vendor.services_offered.all())

    def test_delete_vendor(self):
        url = reverse('vendor-delete', kwargs={'pk': self.vendor.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Vendor.objects.count(), 0)

    def test_vendor_service_search(self):
        url = reverse('vendor-service-search')
        response = self.client.get(url, {'q': 'Test'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)
        self.assertEqual(len(data['vendors']), 1)
        self.assertEqual(len(data['services']), 1)
        self.assertEqual(data['vendors'][0]['business_name'], 'Test Vendor')
        self.assertEqual(data['services'][0]['name'], 'Test Service')