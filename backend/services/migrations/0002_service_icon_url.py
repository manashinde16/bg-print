# Generated by Django 5.1 on 2024-08-24 10:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='service',
            name='icon_url',
            field=models.URLField(blank=True, null=True),
        ),
    ]
