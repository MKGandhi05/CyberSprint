from django.db import models
from django.core.validators import RegexValidator, URLValidator
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.contrib.auth.hashers import make_password

# Validator for roll number format (e.g., 22d41a6256)
roll_validator = RegexValidator(regex=r'^\d{2}d41a\d{4}$', message="Roll number must follow format: 22d41a6256")

class Topic(models.Model):
    topic_id = models.CharField(max_length=5, primary_key=True, editable=False)
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    description = models.TextField()
    no_of_teams = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.topic_id} - {self.name}"


class Team(models.Model):
    team_id = models.CharField(max_length=10, primary_key=True, editable=False)
    team_code = models.CharField(max_length=10, null=True, blank=True)
    team_name = models.CharField(max_length=100, unique=True)
    team_leader = models.ForeignKey('Participant', on_delete=models.SET_NULL, null=True, related_name='leading_team')
    topic = models.ForeignKey(Topic, on_delete=models.SET_NULL, null=True, blank=True)
    submission_url = models.URLField(null=True, blank=True, validators=[URLValidator()])
    team_size = models.PositiveSmallIntegerField(default=1)

    def __str__(self):
        return f"{self.team_id} - {self.team_name}"


class Participant(models.Model):
    participant_id = models.CharField(max_length=10, primary_key=True, editable=False)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    roll_no = models.CharField(max_length=10, validators=[roll_validator], unique=True)
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True)
    year = models.PositiveSmallIntegerField()
    branch = models.CharField(max_length=50)
    gender = models.CharField(max_length=10)
    mobile = models.CharField(max_length=15)
    mail = models.EmailField(unique=True)
    password = models.CharField(max_length=128)  # You may use Django's `make_password` to hash
    linkedin_url = models.URLField(null=True, blank=True)
    github_url = models.URLField(null=True, blank=True)
    role = models.CharField(null=True, max_length=20, choices=[("Leader", "Leader"), ("Crew", "Crew")])

    def __str__(self):
        return f"{self.participant_id} - {self.first_name} {self.last_name}"


# Signal handlers for auto-generating custom IDs

def generate_custom_id(prefix, model, field_name):
    last = model.objects.order_by('-' + field_name).first()
    if last:
        last_id = int(last.pk.replace(prefix, ''))
    else:
        last_id = 0
    return f"{prefix}{str(last_id + 1).zfill(3)}"

@receiver(pre_save, sender=Participant)
def set_participant_id(sender, instance, **kwargs):
    if not instance.participant_id:
        instance.participant_id = generate_custom_id('CCCM', Participant, 'participant_id')

@receiver(pre_save, sender=Participant)
def hash_password(sender, instance, **kwargs):
    # Only hash the password if it's not already hashed
    # Django's make_password is smart enough to check if the password is already hashed
    if instance.password and not instance.password.startswith(('pbkdf2_sha256$', 'bcrypt$', 'argon2')):
        instance.password = make_password(instance.password)

@receiver(pre_save, sender=Team)
def set_team_id_and_code(sender, instance, **kwargs):
    if not instance.team_id:
        instance.team_id = generate_custom_id('CCCMT', Team, 'team_id')
    if not instance.team_code and instance.team_leader:
        leader = instance.team_leader
        leader_prefix = leader.first_name[:3].upper()
        team_prefix = instance.team_name[:3].upper()
        team_number = str(Team.objects.count() + 1).zfill(2)
        instance.team_code = f"{leader_prefix}{team_prefix}{team_number}"

@receiver(pre_save, sender=Topic)
def set_topic_id(sender, instance, **kwargs):
    if not instance.topic_id:
        last = Topic.objects.order_by('-topic_id').first()
        if last:
            try:
                last_id = int(last.topic_id)
            except ValueError:
                last_id = 0
        else:
            last_id = 0
        instance.topic_id = str(last_id + 1).zfill(2)
