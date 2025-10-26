from django.urls import path
from .views import VisitView, ActiveUsersView, TodaysVisitStatsView, VisitOriginsView

urlpatterns = [
    path('', VisitView.as_view()),
    path('active/', ActiveUsersView.as_view()),
    path('today/', TodaysVisitStatsView.as_view()),  # ð new
    path("sources/", VisitOriginsView.as_view())
]