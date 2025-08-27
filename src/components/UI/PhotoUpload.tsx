import React, { useState, useRef, useCallback } from 'react';

interface PhotoUploadProps {
  onPhotoChange: (croppedImage: string | null) => void;
  currentPhoto?: string | null;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onPhotoChange,
  currentPhoto,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          // Calculate new dimensions (max 800x800, maintain aspect ratio)
          const maxSize = 800;
          let { width, height } = img;

          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height * maxSize) / width;
              width = maxSize;
            } else {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress to JPEG at 85% quality
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(compressedDataUrl);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        // 20MB limit
        alert('Please select an image smaller than 20MB.');
        return;
      }

      try {
        const processedImage = await processImage(file);
        onPhotoChange(processedImage);
      } catch (error) {
        console.error('Error processing image:', error);
        alert('Error processing image. Please try a different photo.');
      }
    },
    [processImage, onPhotoChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const removePicture = useCallback(() => {
    onPhotoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onPhotoChange]);

  if (currentPhoto) {
    return (
      <div className="space-y-2">
        <label className="block text-white font-semibold mb-2">
          Pet Photo (Optional)
        </label>
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 cursor-pointer hover:border-white/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <img
              src={currentPhoto}
              alt="Pet"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-700 border border-gray-500 rounded-lg px-4 py-2 text-white hover:bg-gray-600 transition-colors text-sm cursor-pointer"
            >
              Change Photo
            </button>
            <button
              type="button"
              onClick={removePicture}
              className="bg-red-800 border border-red-600 rounded-lg px-4 py-2 text-red-300 hover:bg-red-700 transition-colors text-sm cursor-pointer"
            >
              Remove
            </button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) =>
            e.target.files?.[0] && handleFileSelect(e.target.files[0])
          }
          className="hidden"
        />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <label className="block text-white font-semibold mb-2">
          Pet Photo (Optional)
        </label>
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragging
              ? 'border-blue-400 bg-blue-500/20'
              : 'border-white/30 bg-white/5 hover:bg-white/10'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="space-y-2">
            <div className="w-12 h-12 mx-auto bg-white/10 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="text-white/80">
              <p className="text-sm">Drop your pet's photo here, or</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-300 hover:text-blue-200 underline text-sm cursor-pointer"
              >
                browse to upload
              </button>
            </div>
            <p className="text-white/50 text-xs">PNG, JPG up to 20MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) =>
              e.target.files?.[0] && handleFileSelect(e.target.files[0])
            }
            className="hidden"
          />
        </div>
      </div>
    </>
  );
};
