"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { Upload, Trash2, User } from "lucide-react";
import { handleBuildImage } from "../utility/handleBuildImage";
import {
  IMAGE_ACCEPT_ATTR,
  validateImageFile,
} from "../utility/validateImageFile";

interface SingleImageUploadProps {
  imageUrl?: string;
  fallbackInitials?: string;
  selectedFile: File | null;
  isMarkedForRemoval: boolean;
  onSelectFile: (file: File | null) => void;
  onRemoveImage: () => void;
  label?: string;
}

const SingleImageUpload: React.FC<SingleImageUploadProps> = ({
  imageUrl,
  fallbackInitials,
  selectedFile,
  isMarkedForRemoval,
  onSelectFile,
  onRemoveImage,
  label = "Profile Photo",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [objectPreview, setObjectPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setObjectPreview(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setObjectPreview(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  const savedPreview =
    !isMarkedForRemoval && imageUrl ? handleBuildImage(imageUrl, "") : "";
  const activePreview = objectPreview || savedPreview;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setErrorMessage("");

    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    onSelectFile(file);
  };

  const handleClear = () => {
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemoveImage();
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold uppercase tracking-wider text-text-ink">
        {label}
      </label>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border-subtle bg-surface-bento/80 shadow-sm">
          {activePreview ? (
            <Image
              src={activePreview}
              alt={label}
              fill
              sizes="96px"
              className="object-cover"
              unoptimized={Boolean(objectPreview)}
            />
          ) : fallbackInitials ? (
            <span className="font-display text-2xl font-bold text-surface-forest">
              {fallbackInitials}
            </span>
          ) : (
            <User className="h-9 w-9 text-text-body/60" />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept={IMAGE_ACCEPT_ATTR}
              onChange={handleFileChange}
              className="sr-only"
              id="profile-avatar-input"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white px-4 py-2 text-xs font-semibold text-text-ink shadow-sm transition-all hover:bg-surface-bento hover:border-surface-forest/30 cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5 text-surface-forest" />
              <span>{activePreview ? "Change Photo" : "Upload Photo"}</span>
            </button>

            {activePreview && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50/70 px-3.5 py-2 text-xs font-semibold text-red-700 transition-all hover:bg-red-100 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>

          <p className="text-xs text-text-body">
            PNG, JPG, WebP, or AVIF up to 5MB.
            {isMarkedForRemoval && (
              <span className="ml-1.5 font-medium text-amber-700">
                (Photo will be removed when you save)
              </span>
            )}
          </p>

          {errorMessage && (
            <p className="text-xs font-medium text-red-600">{errorMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleImageUpload;
