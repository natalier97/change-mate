# Generated by Django 5.0.4 on 2024-05-03 16:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('profile_app', '0011_userprofile_coordinates'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='location',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]