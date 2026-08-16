"use client";

import React, { useState, useRef } from "react";
import { 
  UploadCloud, File, FileText, Image as ImageIcon, X, 
  Download, Eye, Trash2, CheckCircle2, AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export interface ManagedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  url?: string;
}

interface FileManagementProps {
  files: ManagedFile[];
  onUpload: (newFiles: File[]) => void;
  onDelete: (id: string) => void;
  onPreview?: (file: ManagedFile) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
}

export function FileManagement({
  files,
  onUpload,
  onDelete,
  onPreview,
  accept = "*",
  multiple = true,
  maxSizeMb = 10,
}: FileManagementProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFiles = (fileList: FileList): File[] => {
    const valid: File[] = [];
    const maxBytes = maxSizeMb * 1024 * 1024;
    
    Array.from(fileList).forEach(file => {
      if (file.size > maxBytes) {
        toast.error(`File "${file.name}" exceeds the ${maxSizeMb}MB limit.`);
      } else {
        valid.push(file);
      }
    });
    return valid;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const valid = validateFiles(e.dataTransfer.files);
      if (valid.length > 0) {
        onUpload(multiple ? valid : [valid[0]]);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const valid = validateFiles(e.target.files);
      if (valid.length > 0) {
        onUpload(multiple ? valid : [valid[0]]);
      }
    }
  };

  const triggerInputClick = () => {
    fileInputRef.current?.click();
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-indigo-500" />;
    if (type.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />;
    return <File className="h-5 w-5 text-teal-600" />;
  };

  return (
    <div className="space-y-4">
      {/* Upload Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerInputClick}
        className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px] ${
          dragActive 
            ? "border-teal-500 bg-teal-500/5" 
            : "border-border/60 hover:border-teal-500/40 bg-card hover:bg-muted/10"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
        />
        <div className="p-3 bg-teal-500/10 rounded-2xl text-teal-600 mb-3">
          <UploadCloud className="h-6 w-6" />
        </div>
        <p className="text-xs font-semibold">
          Drag & drop files here or <span className="text-teal-600 underline">browse</span>
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          Supports PDFs, images, and documents up to {maxSizeMb}MB.
        </p>
      </div>

      {/* Uploaded / Queued Files */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-1">Upload Queue ({files.length})</h4>
          <div className="grid gap-2">
            <AnimatePresence initial={false}>
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-3 border border-border/60 bg-card rounded-2xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 bg-muted rounded-xl shrink-0">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-bold truncate pr-2">{file.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{formatSize(file.size)}</span>
                        {file.status === "uploading" && (
                          <span className="text-teal-600 font-semibold animate-pulse">Uploading {file.progress}%</span>
                        )}
                        {file.status === "completed" && (
                          <span className="text-emerald-500 flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="h-3 w-3" /> Complete
                          </span>
                        )}
                        {file.status === "error" && (
                          <span className="text-red-500 flex items-center gap-1 font-semibold">
                            <AlertCircle className="h-3 w-3" /> Failed
                          </span>
                        )}
                      </div>
                      
                      {/* Upload Progress Bar */}
                      {file.status === "uploading" && (
                        <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                          <div className="bg-teal-600 h-full transition-all" style={{ width: `${file.progress}%` }} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {file.status === "completed" && onPreview && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
                        onClick={() => onPreview(file)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {file.url && (
                      <a href={file.url} download={file.name}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                      onClick={() => onDelete(file.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
