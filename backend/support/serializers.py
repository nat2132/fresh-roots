from rest_framework import serializers
from .models import SupportTicket

class SupportTicketSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = SupportTicket
        fields = [
            'id', 'user', 'user_name', 'subject', 'message', 
            'status', 'priority', 'admin_notes', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'status', 'admin_notes', 'created_at', 'updated_at']
