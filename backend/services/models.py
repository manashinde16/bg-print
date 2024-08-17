from django.db import models

class Service(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    pricing = models.CharField(max_length=255)
    duration = models.CharField(max_length=50)
    terms_and_conditions = models.TextField()

    def __str__(self):
        return self.name
