import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

export interface FileUploadProps {
  accept?: string;
  maxSizeMB?: number;
  onFilesSelected?: (files: File[]) => void;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept = '.pdf,.png,.jpg,.dcm,.fhir',
  maxSizeMB = 10,
  onFilesSelected,
  className,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{ file: File; progress: number; error?: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    const newItems: { file: File; progress: number; error?: string }[] = [];

    Array.from(files).forEach((file) => {
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        newItems.push({ file, progress: 0, error: `File exceeds max size of ${maxSizeMB}MB` });
      } else {
        newItems.push({ file, progress: 100 });
      }
    });

    const updated = [...selectedFiles, ...newItems];
    setSelectedFiles(updated);
    if (onFilesSelected) {
      onFilesSelected(updated.filter((i) => !i.error).map((i) => i.file));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    if (onFilesSelected) {
      onFilesSelected(updated.filter((i) => !i.error).map((i) => i.file));
    }
  };

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Dropzone Box */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none',
          dragActive
            ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/30 scale-[0.99]'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 hover:border-primary-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/40'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />
        <div className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl shadow-card mb-3 text-primary-700 dark:text-primary-400">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Click to upload or drag & drop clinical files
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Supports PDF, PNG, DICOM (.dcm), FHIR JSON (Max {maxSizeMB}MB)
        </p>
      </div>

      {/* Selected File Previews */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 shadow-subtle text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <File className="w-4 h-4 text-primary-600 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{item.file.name}</p>
                  <p className="text-[10px] text-slate-400">{(item.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  {item.error && <p className="text-[10px] text-rose-500 font-semibold mt-0.5">{item.error}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!item.error ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                )}
                <Button variant="ghost" size="icon" onClick={() => removeFile(idx)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
