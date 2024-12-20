# Generated by Django 5.1.4 on 2024-12-19 17:41

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0005_remove_post_title'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='follow',
        ),
        migrations.AddField(
            model_name='user',
            name='followed',
            field=models.ManyToManyField(related_name='users_following', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='user',
            name='following',
            field=models.ManyToManyField(related_name='users_followed', to=settings.AUTH_USER_MODEL),
        ),
    ]
