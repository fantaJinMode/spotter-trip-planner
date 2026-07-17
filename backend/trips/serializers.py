from rest_framework import serializers

from .models import Trip


class TripCreateSerializer(serializers.ModelSerializer):
    current_location = serializers.CharField(
        help_text="Driver's current location (e.g. 'Chicago, IL').")
    pickup_location = serializers.CharField(
        help_text="Pickup location for the load.")
    dropoff_location = serializers.CharField(
        help_text="Dropoff location for the load.")
    current_cycle_used = serializers.FloatField(
        min_value=0, max_value=70,
        help_text="Hours already used in the driver's current 70-hour/8-day cycle.")

    class Meta:
        model = Trip
        fields = ["id", "current_location", "pickup_location", "dropoff_location", "current_cycle_used"]
        read_only_fields = ["id"]


class TripResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = ["id"]

    def to_representation(self, instance):
        return {"id": str(instance.id), **instance.plan}


class TripListSerializer(serializers.ModelSerializer):
    distance_mi = serializers.SerializerMethodField()
    duration_hrs = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = [
            "id", "current_location", "pickup_location", "dropoff_location",
            "current_cycle_used", "created_at", "distance_mi", "duration_hrs",
        ]

    def get_distance_mi(self, obj):
        return obj.plan["route"]["distance_mi"]

    def get_duration_hrs(self, obj):
        return obj.plan["route"]["duration_hrs"]
