from django.db import models

# Create your models here.
'''
class Device(models.Model):
    
    device = models.CharField(max_length=48)
    property = models.CharField(max_length=128)
    value = models.CharField(max_length=128)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['device', 'property'], name='unique_device_property')
        ]
'''