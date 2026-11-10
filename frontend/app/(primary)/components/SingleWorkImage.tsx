"use client";
import { IOurRecentWork } from "@/app/types/Homepage";
import Image from "next/image";
import React from "react";
import { ZoomIn } from "lucide-react";

interface SingleWorkImageProps {
  info: IOurRecentWork;
  handleLightBox: (index: number) => void;
  indexImage: number;
}

const SingleWorkImage: React.FC<SingleWorkImageProps> = ({
  info,
  handleLightBox,
  indexImage,
}) => {
  const { imageUrl, title, description } = info;
  const buildImageUrl = imageUrl || "/home/w1.webp";

  return (
    <div
      tabIndex={0}
      role="button"
      aria-label={`View enlarged photo for ${title || "delivery"}`}
      onClick={() => handleLightBox(indexImage)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleLightBox(indexImage);
        }
      }}
      className="group relative h-[260px] sm:h-[300px] lg:h-[340px] w-full overflow-hidden rounded-3xl bg-surface-bento shadow-bento hover:shadow-bento-hover transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
    >
      <Image
        src={buildImageUrl}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        alt={title || "EduDrop classroom supply delivery"}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity group-hover:opacity-90"
        aria-hidden="true"
      />

      {/* Bottom Information Card */}
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white flex flex-col justify-end">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-block rounded-full bg-brand-lime/20 border border-brand-lime/30 px-2.5 py-0.5 text-xs font-semibold text-brand-lime">
            Verified Delivery
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white opacity-0 transition-opacity group-hover:opacity-100">
            <ZoomIn className="h-4 w-4" />
          </span>
        </div>
        <h4 className="mt-2 text-base font-bold text-white line-clamp-1">
          {title}
        </h4>
        {description && (
          <p className="mt-1 text-xs text-white/80 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default SingleWorkImage;
