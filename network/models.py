from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField('self', related_name='users_followed', symmetrical=False,blank=True,null=True)
    followers = models.ManyToManyField('self', related_name='users_following', symmetrical=False,blank=True,null=True)


class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted')
    body = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    liked_by = models.ManyToManyField(User, related_name='liked_posts',blank=True,null=True)
    edit = models.BooleanField(default=False)


    def serialize(self,current_user):
        return {
            'id': self.id,
            'author': self.author.username,
            'body': self.body,
            'timestamp': self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            'likes': self.liked_by.count(),
            'liked': current_user in self.liked_by.all(),
            "edit": self.author == current_user,

        }