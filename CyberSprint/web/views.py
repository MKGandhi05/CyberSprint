from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.contrib.auth.models import User
import json

def index(request):
    return render(request, 'index.html')

def login(request):
    return render(request, 'login.html')

def register(request):
    return render(request, 'register.html')

@require_POST
def check_email(request):
    """
    AJAX view to check if an email already exists in the database
    """
    email = request.POST.get('email', '')
    
    # Check if email exists in User model
    email_exists = User.objects.filter(email=email).exists()
    
    # Return JSON response
    return JsonResponse({'exists': email_exists})