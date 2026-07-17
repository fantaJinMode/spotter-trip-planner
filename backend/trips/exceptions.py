from rest_framework.views import exception_handler
from rest_framework.response import Response


class GeocodeError(Exception):
    def __init__(self, field, query): self.field, self.query = field, query


class RoutingError(Exception): pass


def handler(exc, context):
    if isinstance(exc, GeocodeError):
        return Response({exc.field: [f"Could not find location: {exc.query}"]}, status=400)
    if isinstance(exc, RoutingError):
        return Response({"detail": "Routing service unavailable. Try again shortly."}, status=502)
    return exception_handler(exc, context)
