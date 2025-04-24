from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.contrib.auth.models import User
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from .models import Participant
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from django.conf import settings
import json
import random
import string

def index(request):
    return render(request, 'index.html')

def login(request):
    return render(request, 'login.html')

def register(request):
    if request.method == 'POST':
        # Get form data
        email = request.POST.get('email')
        first_name = request.POST.get('firstName')
        last_name = request.POST.get('lastName')
        gender = request.POST.get('gender')
        mobile = request.POST.get('mobile')
        roll_no = request.POST.get('rollNo')
        year = request.POST.get('year')
        branch = request.POST.get('branch')
        github_url = request.POST.get('githubUrl')
        linkedin_url = request.POST.get('linkedinUrl')
        password = request.POST.get('password')
        
        # Check if OTP is verified
        otp_verified = request.session.get('otp_verified', False)
        registered_email = request.session.get('registration_email', '')
        
        if not otp_verified or email != registered_email:
            return JsonResponse({'status': 'error', 'message': 'Email not verified. Please verify your email first.'})
            
        # Check if email already exists
        if Participant.objects.filter(mail=email).exists():
            return JsonResponse({'status': 'error', 'message': 'Email already registered'})
        
        # Check if roll number already exists
        if Participant.objects.filter(roll_no=roll_no).exists():
            return JsonResponse({'status': 'error', 'message': 'Roll number already registered'})
        
        try:
            # Create new participant (participant_id will be auto-generated via signals)
            participant = Participant(
                first_name=first_name,
                last_name=last_name,
                roll_no=roll_no,
                year=int(year),
                branch=branch,
                gender=gender,
                mobile=mobile,
                mail=email,
                password=make_password(password),  # Hash the password
                linkedin_url=linkedin_url,
                github_url=github_url,
                role="Crew"  # Default role is Crew
            )
            participant.save()
            
            # Send welcome email with first name
            try:
                html_message = render_to_string('welcome_email.html', {
                    'first_name': first_name,
                })
                plain_message = strip_tags(html_message)
                send_mail(
                    'Welcome to CodeMania!',
                    plain_message,
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    html_message=html_message,
                    fail_silently=False,
                )
            except Exception as email_error:
                # Log the error but continue with registration
                print(f"Error sending welcome email: {str(email_error)}")
            
            # Clear registration session data
            for key in ['registration_otp', 'registration_email', 'otp_verified']:
                if key in request.session:
                    del request.session[key]
                
            return JsonResponse({'status': 'success', 'message': 'Registration successful'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    
    # If GET request, just render the form
    return render(request, 'register.html')

@require_POST
def check_email(request):
    """
    AJAX view to check if an email already exists in the database
    """
    email = request.POST.get('email', '')
    
    # Check if email exists in Participant model
    email_exists = Participant.objects.filter(mail=email).exists()
    
    # Return JSON response
    return JsonResponse({'exists': email_exists})

def generate_otp():
    """Generate a 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))

@require_POST
def send_otp(request):
    """
    Send OTP to user's email for verification
    """
    email = request.POST.get('email', '')
    
    # Check if OTP is already verified for this email
    if request.session.get('otp_verified', False) and request.session.get('registration_email', '') == email:
        return JsonResponse({
            'status': 'success', 
            'message': 'Email already verified. Proceed with registration.'
        })
    
    # Generate OTP
    otp = generate_otp()
    
    # Store OTP in session for verification later
    request.session['registration_otp'] = otp
    request.session['registration_email'] = email
    request.session['otp_verified'] = False
    
    # Get the site URL for static files in email template
    site_url = request.build_absolute_uri('/').rstrip('/')
    
    # Send OTP via email with HTML template
    try:
        # Render HTML message
        html_message = render_to_string('email_otp.html', {
            'otp': otp,
            'site_url': site_url,
        })
        
        # Create plain text version
        plain_message = strip_tags(html_message)
        
        # Send the email
        send_mail(
            'Your CodeMania Registration OTP',
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            html_message=html_message,
            fail_silently=False,
        )
        return JsonResponse({'status': 'success', 'message': 'OTP sent successfully'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)})

@require_POST
def verify_otp(request):
    """
    Verify the OTP entered by the user
    """
    # If already verified, no need to verify again
    if request.session.get('otp_verified', False):
        return JsonResponse({'status': 'success', 'message': 'OTP already verified'})
        
    entered_otp = request.POST.get('otp', '')
    stored_otp = request.session.get('registration_otp', '')
    
    if entered_otp == stored_otp:
        # Mark OTP as verified in session
        request.session['otp_verified'] = True
        return JsonResponse({'status': 'success', 'message': 'OTP verified successfully'})
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid OTP'})