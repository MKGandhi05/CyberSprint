from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login, name='login'),
    path('register/', views.register, name='register'),
    path('check-email/', views.check_email, name='check_email'),
    path('logout/', views.logout, name='logout'),
    path('create-team/', views.create_team, name='create_team'),
    path('join-team/', views.join_team, name='join_team'),
    path('get-dashboard-data/', views.get_dashboard_data, name='get_dashboard_data'),

]