"use client";

import { useState, useRef } from "react";
import { AttachmentIcon, FileIcon, ImageIcon } from "@/assets/icons";
import axios from "axios";

const FileUpload = ({ onFileUploaded, disabled = false }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  // File type configurations
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset previous errors
    setUploadError(null);

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return;
    }

    // Validate file type
    const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('File type not allowed. Supported types: images (JPEG, PNG, GIF, WebP) and documents (PDF, TXT, DOC, DOCX, XLS, XLSX)');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        onFileUploaded(response.data.file);
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setUploadError(response.data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileType) => {
    if (ALLOWED_IMAGE_TYPES.includes(fileType)) {
      return <ImageIcon className="w-4 h-4" />;
    }
    return <FileIcon className="w-4 h-4" />;
  };

  return (
    <div className="relative">
      <button
        onClick={handleFileSelect}
        disabled={disabled || uploading}
        className="p-1 rounded-lg hover:bg-black/[.05] dark:hover:bg-white/[.1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={uploading ? "Uploading..." : "Attach file"}
      >
        {uploading ? (
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <AttachmentIcon className="text-black/60 dark:text-white/60" />
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept={[...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES].join(',')}
        className="hidden"
      />

      {uploadError && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-300 min-w-64 z-10">
          <p>{uploadError}</p>
          <button
            onClick={() => setUploadError(null)}
            className="mt-1 text-xs underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
