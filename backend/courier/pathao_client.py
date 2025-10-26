from pathao_api import PathaoAPI
from django.conf import settings

def get_pathao_client():
    return PathaoAPI(
        client_id=settings.PATHAO_CLIENT_ID,
        client_secret=settings.PATHAO_CLIENT_SECRET,
        username=settings.PATHAO_USERNAME,
        password=settings.PATHAO_PASSWORD,
        base_url=settings.PATHAO_BASE_URL,
        store_id=settings.PATHAO_STORE_ID
    )