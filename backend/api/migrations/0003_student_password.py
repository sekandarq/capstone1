# Generated by Django 5.2.1 on 2025-05-21 16:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_remove_student_groups_remove_student_is_active_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='student',
            name='password',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
    ]
