# visits/models.py

from django.db import models

class Visit(models.Model):
    ip_address = models.GenericIPAddressField()
    path = models.CharField(max_length=255)
    source = models.CharField(max_length=64, default='organic')
    visited_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.ip_address} visited {self.path} on {self.visited_at}"