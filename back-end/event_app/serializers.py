from rest_framework import serializers
from .models import Event
from interest_app.serializers import InterestCategorySerializer
from profile_app.serializers import DisplayNameSerializer

class EventSerializer(serializers.ModelSerializer):
    users_attending = serializers.SerializerMethodField()
    collaborators = DisplayNameSerializer(many=True)
    category = InterestCategorySerializer()

    class Meta: 
        model = Event
        fields = ['id', 'title', 'event_start', 'event_end', 'time_zone', 'event_type', 'virtual_event_link', 'event_venue', 'event_venue_address', 'description', 'event_photo', 'category', 'users_attending', 'collaborators']

    def get_users_attending(self, obj):
        return obj.users_attending.count()
    
class ICalSerializer(serializers.ModelSerializer):
    startTime = serializers.SerializerMethodField()
    startDate = serializers.SerializerMethodField()
    endTime = serializers.SerializerMethodField()
    endDate = serializers.SerializerMethodField()

    class Meta: 
        model = Event
        fields = ['id', 'title', 'startTime', 'startDate', 'endTime', 'endDate', 'time_zone']

    def get_startDate(self, obj):
        return obj.event_start.date()

    def get_endDate(self, obj):
        return obj.event_end.date()

    def get_startTime(self, obj):
        return obj.event_start.strftime('%H:%M')

    def get_endTime(self, obj):
        return obj.event_end.strftime('%H:%M')