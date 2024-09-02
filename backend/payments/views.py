# views.py

import json
from django.conf import settings
from django.http import JsonResponse, HttpResponseBadRequest
import razorpay
from .models import Transaction
from django.middleware.csrf import get_token

# Initialize Razorpay client with API keys
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

def get_csrf_token(request):
    csrf_token = get_token(request)
    return JsonResponse({'csrfToken': csrf_token})

def initiate_payment(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        amount = data.get('amount')

        if not amount:
            return HttpResponseBadRequest('Amount is required')

        # Create a Razorpay order
        order_currency = 'INR'
        order_receipt = 'order_rcptid_11'
        notes = {'Shipping address': '1234 Main St'}

        order = razorpay_client.order.create({
            'amount': int(amount) * 100,  # Razorpay expects amount in paise
            'currency': order_currency,
            'receipt': order_receipt,
            'notes': notes,
        })

        # Save the order details in the database
        transaction = Transaction.objects.create(
            razorpay_order_id=order['id'],
            amount=amount,
            currency=order_currency,
            status='created',
        )

        return JsonResponse(order)

    return HttpResponseBadRequest('Invalid request method')

def verify_payment(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        razorpay_payment_id = data.get('razorpay_payment_id')
        razorpay_order_id = data.get('razorpay_order_id')
        razorpay_signature = data.get('razorpay_signature')

        try:
            # Verify payment signature
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            razorpay_client.utility.verify_payment_signature(params_dict)

            # Update transaction status in the database
            transaction = Transaction.objects.get(razorpay_order_id=razorpay_order_id)
            transaction.status = 'success'
            transaction.razorpay_payment_id = razorpay_payment_id
            transaction.razorpay_signature = razorpay_signature
            transaction.save()

            return JsonResponse({'status': 'success'})

        except razorpay.errors.SignatureVerificationError:
            return JsonResponse({'status': 'failure'}, status=400)

    return HttpResponseBadRequest('Invalid request method')
