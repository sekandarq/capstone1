from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Extends DRF’s SessionAuthentication but skips CSRF enforcement.
    """
    def enforce_csrf(self, request):
        return  # simply skip CSRF checks
