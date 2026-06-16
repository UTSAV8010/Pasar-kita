from django.apps import AppConfig


class CustomerConfig(AppConfig):
    name = 'customer'

    def ready(self):
        import django.shortcuts
        from django.http import JsonResponse
        from food_ordering_project.serializers import serialize_context

        original_render = django.shortcuts.render

        def custom_render(request, template_name, context=None, content_type=None, status=None, using=None):
            accept_header = request.headers.get('Accept', '')
            wants_json = 'application/json' in accept_header or request.GET.get('format') == 'json' or request.headers.get('X-React-App') == 'true'
            if wants_json:
                if context is None:
                    context = {}
                serialized = serialize_context(context, request)
                return JsonResponse(serialized, safe=False)
            return original_render(request, template_name, context, content_type, status, using)

        django.shortcuts.render = custom_render

