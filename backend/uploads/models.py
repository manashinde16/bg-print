from django.db import models

class UploadedFile(models.Model):
    vendor_id = models.IntegerField()
    service_ids = models.JSONField()  # Store multiple service IDs as a JSON array
    file_url = models.URLField(max_length=500)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"File {self.file_url} for vendor {self.vendor_id} and services {self.service_ids}"