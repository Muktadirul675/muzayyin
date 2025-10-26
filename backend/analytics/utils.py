from datetime import datetime
from django.utils.timezone import make_aware


def parse_date(date_str, default=None):
    """
    Parse a date string (YYYY-MM-DD) and return an aware datetime object.
    If invalid or empty, return default (e.g., now or None).
    """
    if not date_str:
        return default

    try:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        return make_aware(dt)
    except ValueError:
        return default