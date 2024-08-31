# uploads/urls.py

from django.urls import path
from .views import store_file_url, get_uploaded_files, update_file_url, delete_uploaded_file

urlpatterns = [
    path('store-file-url/', store_file_url, name='store_file_url'),                # POST
    path('get-files/', get_uploaded_files, name='get_uploaded_files'),             # GET all
    path('get-files/<int:vendor_id>/', get_uploaded_files, name='get_vendor_files'), # GET by vendor_id
    path('update-file-url/<int:file_id>/', update_file_url, name='update_file_url'), # PUT
    path('delete-file/<int:file_id>/', delete_uploaded_file, name='delete_uploaded_file'), # DELETE
]
