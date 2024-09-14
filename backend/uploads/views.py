from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .models import UploadedFile
import logging
from .serializers import UploadedFileSerializer

logger = logging.getLogger(__name__)

@api_view(['POST'])
def store_file_url(request):
    """Upload multiple files and store their URLs in the database."""
    logger.info(f'Using storage: {default_storage.__class__.__name__}')
    
    if 'files' not in request.FILES:
        return Response({"error": "No files provided"}, status=status.HTTP_400_BAD_REQUEST)

    files = request.FILES.getlist('files')
    vendor_id = request.data.get('vendor_id')
    service_ids = request.data.getlist('service_ids')  # Use getlist for multiple service IDs

    if not vendor_id or not service_ids:
        return Response({"error": "Vendor ID and Service IDs are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        service_ids = [int(sid) for sid in service_ids]
    except ValueError:
        return Response({"error": "Invalid service IDs format"}, status=status.HTTP_400_BAD_REQUEST)

    if len(files) > 5:
        return Response({"error": "Maximum 5 files allowed"}, status=status.HTTP_400_BAD_REQUEST)

    uploaded_files = []

    # Group files by their respective service IDs
    for service_id in service_ids:
        matching_files = [file for file in files if str(service_id) in file.name]
        if not matching_files:
            return Response({"error": f"No files for service ID {service_id}"}, status=status.HTTP_400_BAD_REQUEST)

        for file in matching_files:
            # Save file to S3 or appropriate storage
            file_name = default_storage.save(file.name, ContentFile(file.read()))
            file_url = default_storage.url(file_name)
            uploaded_files.append({
                "service_id": service_id,
                "file_url": file_url
            })

    return Response({"uploaded_files": uploaded_files}, status=status.HTTP_201_CREATED)
    """Upload multiple files and store their URLs in the database."""
    logger.info(f'Using storage: {default_storage.__class__.__name__}')
    
    if 'files' not in request.FILES:
        return Response({"error": "No files provided"}, status=status.HTTP_400_BAD_REQUEST)

    files = request.FILES.getlist('files')
    vendor_id = request.data.get('vendor_id')
    service_ids = request.data.get('service_ids')

    if not vendor_id or not service_ids:
        return Response({"error": "Vendor ID and Service IDs are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        service_ids = [int(sid) for sid in service_ids.split(',')]
    except ValueError:
        return Response({"error": "Invalid service IDs format"}, status=status.HTTP_400_BAD_REQUEST)

    if len(files) != len(service_ids):
        return Response({"error": "Number of files must match number of service IDs"}, status=status.HTTP_400_BAD_REQUEST)

    if len(files) > 5:
        return Response({"error": "Maximum 5 files allowed"}, status=status.HTTP_400_BAD_REQUEST)

    uploaded_files = []

    for file, service_id in zip(files, service_ids):
        # Save file to S3
        file_name = default_storage.save(file.name, ContentFile(file.read()))
        file_url = default_storage.url(file_name)

        # Save file metadata to the database
        uploaded_file = UploadedFile(vendor_id=vendor_id, service_id=service_id, file_url=file_url)
        uploaded_file.save()
        uploaded_files.append(uploaded_file)

    serializer = UploadedFileSerializer(uploaded_files, many=True)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def get_uploaded_files(request, vendor_id=None, service_id=None):
    """Retrieve all files, files for a specific vendor, or files for a specific vendor and service."""
    if vendor_id and service_id:
        files = UploadedFile.objects.filter(vendor_id=vendor_id, service_id=service_id)
    elif vendor_id:
        files = UploadedFile.objects.filter(vendor_id=vendor_id)
    else:
        files = UploadedFile.objects.all()

    serializer = UploadedFileSerializer(files, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
def update_file_url(request, file_id):
    """Update an existing file record."""
    try:
        uploaded_file = UploadedFile.objects.get(id=file_id)
    except UploadedFile.DoesNotExist:
        return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = UploadedFileSerializer(uploaded_file, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def delete_uploaded_file(request, file_id):
    """Delete a file record."""
    try:
        uploaded_file = UploadedFile.objects.get(id=file_id)
    except UploadedFile.DoesNotExist:
        return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)

    uploaded_file.delete()
    return Response({"message": "File deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
