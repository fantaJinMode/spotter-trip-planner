from rest_framework import mixins, viewsets

from .models import Trip
from .serializers import TripCreateSerializer, TripListSerializer, TripResponseSerializer
from .services.planner import build_plan


class TripViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Trip.objects.all().order_by("-created_at")

    def get_serializer_class(self):
        if self.action == "create":
            return TripCreateSerializer
        if self.action == "list":
            return TripListSerializer
        return TripResponseSerializer

    def perform_create(self, serializer):
        plan = build_plan(serializer.validated_data)
        serializer.instance = Trip.objects.create(**serializer.validated_data, plan=plan)

    def create(self, request, *args, **kwargs):
        resp = super().create(request, *args, **kwargs)
        resp.data = TripResponseSerializer(self.get_queryset().get(id=resp.data["id"])).data
        return resp
