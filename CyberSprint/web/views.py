from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.contrib.auth.models import User
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from .models import Participant, Team
from django.contrib.auth.hashers import make_password, check_password
from django.core.mail import send_mail
from django.conf import settings
import json
import random
import string
import uuid

def index(request):
    return render(request, 'index.html')

def login(request):
    if request.method == 'POST':
        # Check which login method was chosen
        login_method = request.POST.get('login_method', 'credentials')
        
        if login_method == 'credentials':
            # Login with credentials (email/roll_no + password)
            return credentials_login(request)
        else:
            # Login with OTP
            action = request.POST.get('action', '')
            
            if action == 'send_otp':
                # Send OTP to user's email
                return send_login_otp_request(request)
            elif action == 'verify_otp':
                # Verify OTP and login
                return verify_login_otp(request)
            elif action == 'resend_otp':
                # Resend OTP
                return resend_login_otp(request)
    
    # If GET request, just render the login form
    return render(request, 'login.html')

def credentials_login(request):
    """Login using credentials (email/roll_no + password)"""
    # Get form data
    identifier = request.POST.get('identifier', '')  # Could be email or roll_no
    password = request.POST.get('password', '')
    
    try:
        # Check if identifier is an email or roll_no
        if '@' in identifier:
            # Login with email
            participant = Participant.objects.get(mail=identifier)
        else:
            # Login with roll_no
            participant = Participant.objects.get(roll_no=identifier)
        
        # Check password
        if check_password(password, participant.password):
            # Login successful, create session
            create_user_session(request, participant)
            
            return JsonResponse({
                'status': 'success',
                'message': 'Login successful',
                'redirect': '/'  # Redirect to homepage
            })
        else:
            # Invalid password
            return JsonResponse({
                'status': 'error',
                'message': 'Invalid credentials. Please try again.'
            })
    
    except Participant.DoesNotExist:
        # User not found
        return JsonResponse({
            'status': 'error',
            'message': 'Invalid credentials. Please try again.'
        })

def send_login_otp_request(request):
    """Send OTP for login"""
    # Get email
    email = request.POST.get('email', '')
    
    # Validate email existence
    try:
        participant = Participant.objects.get(mail=email)
        
        # Generate OTP
        otp = generate_otp()
        
        # Store OTP and user info in session
        request.session['login_otp'] = otp
        request.session['login_email'] = email
        
        # Send OTP via email
        send_login_otp(request, email, otp)
        
        return JsonResponse({
            'status': 'success',
            'message': 'OTP sent to your email'
        })
    
    except Participant.DoesNotExist:
        return JsonResponse({
            'status': 'error',
            'message': 'Email not registered. Please check your email or register.'
        })

def send_login_otp(request, email, otp):
    """Send login OTP email"""
    # Get the site URL for static files in email template
    site_url = request.build_absolute_uri('/').rstrip('/')
    
    # Render HTML message
    html_message = render_to_string('login_otp_email.html', {
        'otp': otp,
        'site_url': site_url,
    })
    
    # Create plain text version
    plain_message = strip_tags(html_message)
    
    # Send the email
    send_mail(
        'Your CodeMania Login Verification Code',
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        html_message=html_message,
        fail_silently=False,
    )

def verify_login_otp(request):
    """Verify login OTP"""
    entered_otp = request.POST.get('otp', '')
    stored_otp = request.session.get('login_otp', '')
    email = request.session.get('login_email', '')
    
    if not stored_otp or not email:
        return JsonResponse({
            'status': 'error',
            'message': 'Session expired. Please request a new OTP.'
        })
    
    if entered_otp == stored_otp:
        try:
            # Get the user
            participant = Participant.objects.get(mail=email)
            
            # Create user session
            create_user_session(request, participant)
            
            # Clean up OTP session data
            for key in ['login_otp', 'login_email']:
                if key in request.session:
                    del request.session[key]
            
            # Return success
            return JsonResponse({
                'status': 'success',
                'message': 'Login successful',
                'redirect': '/'  # Redirect to homepage
            })
        
        except Participant.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'User not found. Please try again.'
            })
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'Invalid OTP. Please try again.'
        })

def create_user_session(request, participant):
    """Create session for logged in user"""
    request.session['user_id'] = participant.participant_id
    request.session['user_name'] = f"{participant.first_name} {participant.last_name}"
    request.session['user_email'] = participant.mail
    request.session['user_role'] = participant.role
    request.session['is_authenticated'] = True
    
    # Add team information to session if user has a team
    if participant.team:
        request.session['team_id'] = participant.team.team_id
        request.session['team_name'] = participant.team.team_name
        request.session['team_code'] = participant.team.team_code

def resend_login_otp(request):
    """Resend login OTP if needed"""
    if request.method == 'POST':
        email = request.session.get('login_email', '')
        
        if not email:
            return JsonResponse({
                'status': 'error',
                'message': 'Session expired. Please try again.'
            })
        
        # Generate new OTP
        otp = generate_otp()
        request.session['login_otp'] = otp
        
        # Send OTP via email
        send_login_otp(request, email, otp)
        
        return JsonResponse({
            'status': 'success',
            'message': 'OTP resent to your email'
        })
    
    return JsonResponse({
        'status': 'error',
        'message': 'Invalid request'
    })

def logout(request):
    """Log out user by clearing session data"""
    for key in ['user_id', 'user_name', 'user_email', 'user_role', 'is_authenticated']:
        if key in request.session:
            del request.session[key]
    
    return redirect('login')

def generate_otp(length=6):
    """Generate a random numeric OTP of specified length"""
    # Generate a random 6-digit OTP
    digits = string.digits
    return ''.join(random.choice(digits) for _ in range(length))

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
                github_url=github_url
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

def create_team(request):
    """Create a new team and set the creator as the team leader"""
    if request.method == 'POST':
        try:
            # Get data from request
            data = json.loads(request.body) if request.body else request.POST
            team_name = data.get('team_name', '').strip()
            
            # Validate team name
            if not team_name:
                return JsonResponse({'success': False, 'error': 'Team name is required'})
            
            # Check if user is logged in via session
            if not request.session.get('user_id'):
                return JsonResponse({'success': False, 'error': 'You must be logged in to create a team'})
            
            # Check if team name already exists
            if Team.objects.filter(team_name__iexact=team_name).exists():
                return JsonResponse({'success': False, 'error': 'Team name already exists'})
            
            # Get the participant
            try:
                participant = Participant.objects.get(participant_id=request.session.get('user_id'))
            except Participant.DoesNotExist:
                return JsonResponse({'success': False, 'error': 'User account not found'})
            
            # Check if participant already has a team
            if participant.team:
                return JsonResponse({'success': False, 'error': 'You are already a member of a team'})
            
            # Create the team
            team = Team.objects.create(
                team_name=team_name,
                team_leader=participant
            )
            
            # Update participant's team and role
            participant.team = team
            participant.role = 'Leader'
            participant.save()
            
            # Update session data
            request.session['user_role'] = 'Leader'
            request.session['team_id'] = team.team_id
            request.session['team_name'] = team.team_name
            request.session['team_code'] = team.team_code
            
            return JsonResponse({
                'success': True, 
                'message': 'Team created successfully',
                'team_name': team.team_name,
                'team_code': team.team_code
            })
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    # If not a POST request
    return JsonResponse({'success': False, 'error': 'Invalid request method'})

def join_team(request):
    """Join an existing team using a team code"""
    if request.method == 'POST':
        try:
            # Get data from request
            data = json.loads(request.body) if request.body else request.POST
            team_code = data.get('team_code', '').strip()
            
            # Validate team code
            if not team_code:
                return JsonResponse({'success': False, 'error': 'Team code is required'})
            
            # Check if user is logged in via session
            if not request.session.get('user_id'):
                return JsonResponse({'success': False, 'error': 'You must be logged in to join a team'})
            
            # Find the team by code
            try:
                team = Team.objects.get(team_code=team_code)
            except Team.DoesNotExist:
                return JsonResponse({'success': False, 'error': 'Invalid team code'})
            
            # Check if team is already full (max 4 members)
            if team.team_size >= 4:
                return JsonResponse({'success': False, 'error': 'This team is already full (maximum 4 members)'})
            
            # Get the participant
            try:
                participant = Participant.objects.get(participant_id=request.session.get('user_id'))
            except Participant.DoesNotExist:
                return JsonResponse({'success': False, 'error': 'User account not found'})
            
            # Check if participant already has a team
            if participant.team:
                return JsonResponse({'success': False, 'error': 'You are already a member of a team'})
            
            # Update participant's team and role
            participant.team = team
            participant.role = 'Crew'
            participant.save()
            
            # Increment team size
            team.team_size += 1
            team.save()
            
            # Update session data
            request.session['user_role'] = 'Crew'
            request.session['team_id'] = team.team_id
            request.session['team_name'] = team.team_name
            request.session['team_code'] = team.team_code
            
            return JsonResponse({
                'success': True, 
                'message': 'Successfully joined team',
                'team_name': team.team_name
            })
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    # If not a POST request
    return JsonResponse({'success': False, 'error': 'Invalid request method'})