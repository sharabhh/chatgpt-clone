"use client";

import { FileIcon, ImageIcon, ExternalLinkIcon } from "@/assets/icons";

const FileAttachment = ({ attachment, className = "" }) => {
  const { filename, originalName, size, type, url } = attachment;

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Check if file is an image
  const isImage = type.startsWith('image/');

  // Get file extension from originalName
  const getFileExtension = (filename) => {
    return filename.split('.').pop()?.toUpperCase() || 'FILE';
  };

  const handleClick = () => {
    // Open file in new window/tab
    window.open(url, '_blank');
  };

  if (isImage) {
    return (
      <div className={`inline-block max-w-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${className}`}>
        <div className="relative">
          <img
            src={url}
            alt={originalName}
            className="w-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={handleClick}
          />
          <div className="absolute top-2 right-2">
            <button
              onClick={handleClick}
              className="p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              title="Open in new tab"
            >
              <ExternalLinkIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="p-2">
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate" title={originalName}>
            {originalName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {formatFileSize(size)}
          </p>
        </div>
      </div>
    );
  }

  // Non-image file - format to match the image provided
  return (
    <div className={`inline-block ${className}`}>
      <div
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 cursor-pointer transition-colors"
        onClick={handleClick}
      >
        <div className="flex-shrink-0">
          <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
            <FileIcon className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={originalName}>
            {originalName}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">
            {getFileExtension(originalName)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileAttachment;
