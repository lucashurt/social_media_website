import json
from django.core.paginator import Paginator
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import User,Post


def index(request):
    return render(request, "network/index.html")

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@csrf_exempt
def compose(request):
    if request.method != "POST":
        return JsonResponse({"Error": "POST request required."}, status=400)

    data = json.loads(request.body)
    body = data.get("body")

    if len(body) == 0 or body.isspace():
        return JsonResponse({"Error": "Empty body."}, status=400)

    post = Post(
        author=request.user,
        body=body,
    )
    post.save()
    return JsonResponse({"Message": "Post created"}, status=201)

def load_posts(request,inbox):
    if inbox=="All":
        posts = Post.objects.all()
    elif inbox=="Following":
        posts = Post.objects.filter(author__followers__username=request.user)
    else:
        return JsonResponse({"Error": "Invalid inbox."}, status=400)

    posts = posts.order_by("-timestamp").all()

    for post in posts:
        if post.author == request.user:
            post.edit = True

    page = int(request.GET.get("page",1))
    limit = request.GET.get("limit",10)
    paginator = Paginator(posts, limit)
    current_page = paginator.get_page(page)

    return JsonResponse({
        "posts": [post.serialize(request.user) for post in current_page],
        "has_next_page":current_page.has_next(),
        "has_previous_page":current_page.has_previous()}
        ,safe=False)


def load_profile_posts(request,username):

    user = User.objects.get(username=username)
    posts = Post.objects.filter(author=user).order_by("-timestamp").all()

    if user == request.user:
        for post in posts:
            post.edit = True

    page = int(request.GET.get("page",1))
    limit = request.GET.get("limit",10)
    paginator = Paginator(posts, limit)
    current_page = paginator.get_page(page)

    return JsonResponse({
        "posts":[post.serialize(request.user) for post in current_page],
        "has_next_page":current_page.has_next(),
        "has_previous_page":current_page.has_previous()},safe=False)

def load_profile(request,username):
    user = User.objects.get(username=username)
    is_following = request.user in user.followers.all()
    not_user = request.user != user
    return JsonResponse({
    'id': user.id,
    'username': user.username,
    'email': user.email,
    'following': user.following.count(),
    'followers': user.followers.count(),
    "is_following": is_following,
    "not_user":not_user,
    })

def follow(request,username):
    follower = request.user
    user = User.objects.get(username=username)
    follower.following.add(user)
    user.followers.add(follower)
    return JsonResponse({"Success": "Followed"}, safe=False)

def unfollow(request,username):
    follower = request.user
    user = User.objects.get(username=username)
    follower.following.remove(user)
    user.followers.remove(follower)
    return JsonResponse({"Success": "Unfollowed"}, safe=False)

@csrf_exempt
def edit_post(request,post_id):
    try:
        post = Post.objects.get(id=post_id)

        if post.author != request.user:
            return JsonResponse({"Error": "Invalid user."}, status=400)
        data = json.loads(request.body)
        post.body = data.get("body","")
        post.save()
        return JsonResponse({"Message": "Post updated"}, safe=False)

    except Exception as e:
        print(e)
        return JsonResponse({"Error": f"error while editing post: {e}"}, status=400)

@csrf_exempt
def like_post(request, post_id):
        user = User.objects.get(username=request.user)
        post = Post.objects.get(id=post_id)
        post.liked_by.add(user)
        post.save()
        return JsonResponse({"Message": "Post liked", "likes": post.liked_by.count()}, safe=False)

@csrf_exempt
def dislike_post(request, post_id):
        user = User.objects.get(username=request.user)
        post = Post.objects.get(id=post_id)
        post.liked_by.remove(user)
        post.save()
        return JsonResponse({"Message": "Post disliked", "likes": post.liked_by.count()}, safe=False)
