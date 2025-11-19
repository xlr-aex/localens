
import React, { useState, useCallback } from 'react';
import { FileUpIcon } from './icons/FileUpIcon';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  disabled: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelect(e.dataTransfer.files[0]);
    }
  }, [onImageSelect, disabled]);

  const baseClasses = "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300";
  const inactiveClasses = "border-gray-600 bg-gray-800 hover:bg-gray-700";
  const draggingClasses = "border-blue-500 bg-blue-900/20";
  const disabledClasses = "border-gray-700 bg-gray-800/50 cursor-not-allowed";

  const getDynamicClasses = () => {
      if (disabled) return disabledClasses;
      if (isDragging) return draggingClasses;
      return inactiveClasses;
  }

  return (
    <div className="w-full">
      <label
        htmlFor="dropzone-file"
        className={`${baseClasses} ${getDynamicClasses()}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
          <FileUpIcon className={`w-10 h-10 mb-4 ${disabled ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`mb-2 text-sm ${disabled ? 'text-gray-600' : 'text-gray-400'}`}>
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className={`text-xs ${disabled ? 'text-gray-700' : 'text-gray-500'}`}>PNG, JPG, or WEBP</p>
        </div>
        <input 
          id="dropzone-file" 
          type="file" 
          className="hidden" 
          onChange={handleFileChange} 
          accept="image/png, image/jpeg, image/webp"
          disabled={disabled} 
        />
      </label>
    </div>
  );
};

export default ImageUploader;
