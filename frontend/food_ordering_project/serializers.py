import datetime
from decimal import Decimal
from django.db.models.query import QuerySet
from django.db.models import Model

def serialize_value(val):
    if isinstance(val, QuerySet):
        return [serialize_value(item) for item in val]
    elif isinstance(val, Model):
        d = {}
        for field in val._meta.fields:
            field_val = getattr(val, field.name)
            # Recursively serialize field value
            d[field.name] = serialize_value(field_val)
        return d
    elif isinstance(val, (datetime.datetime, datetime.date)):
        return val.isoformat()
    elif isinstance(val, Decimal):
        return float(val)
    elif isinstance(val, (list, tuple)):
        return [serialize_value(item) for item in val]
    elif isinstance(val, dict):
        return {k: serialize_value(v) for k, v in val.items()}
    elif hasattr(val, '__dict__'):
        # Fallback for complex class instances that are not Django Models
        try:
            return {k: serialize_value(v) for k, v in val.__dict__.items() if not k.startswith('_')}
        except Exception:
            return str(val)
    else:
        return val

def serialize_context(context, request=None):
    if not isinstance(context, dict):
        return serialize_value(context)
    
    serialized = {}
    for k, v in context.items():
        # Skip objects that we cannot serialize and are not needed by the frontend
        if k in ['request', 'view', 'form', 'perms', 'messages']:
            continue
        serialized[k] = serialize_value(v)
        
    # Inject basic request metadata automatically if available
    if request:
        if 'user' in request.session:
            request_user = request.session.get('user')
            serialized['user'] = request_user
            serialized['name'] = request.session.get('name', request_user)
            from customer.models import User
            usr = User.objects.filter(username=request_user).first()
            if usr:
                serialized['role'] = usr.user_role
            else:
                serialized['role'] = 0  # Default customer role
        elif 'user-admin' in request.session:
            admin_user = request.session.get('user-admin')
            serialized['user'] = admin_user
            serialized['name'] = admin_user
            serialized['role'] = 1  # Admin role
        elif 'restro-name' in request.session:
            restro_user = request.session.get('restro-name')
            serialized['user'] = restro_user
            serialized['name'] = restro_user
            serialized['role'] = 2  # Restro role
        elif 'delivery-boy' in request.session:
            delivery_user = request.session.get('delivery-boy')
            serialized['user'] = delivery_user
            serialized['name'] = delivery_user
            serialized['role'] = 3  # Delivery role
        else:
            serialized['user'] = None
            serialized['name'] = None
            serialized['role'] = None
    return serialized

