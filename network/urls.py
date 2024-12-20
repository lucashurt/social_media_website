
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    path("posts",views.compose,name="compose"),
    path("posts/<str:inbox>",views.load_posts,name="posts"),
    path("edit/<int:post_id>",views.edit_post,name="post"),
    path("profileposts/<str:username>", views.load_profile_posts, name="username"),
    path("profile/<str:username>",views.load_profile,name="username"),
    path("follow/<str:username>",views.follow,name="follow"),
    path("unfollow/<str:username>",views.unfollow,name="unfollow"),
]
