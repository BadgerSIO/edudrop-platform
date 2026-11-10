"use client";
import Image from "next/image";
import React, { useRef } from "react";
import { ISchoolInfo } from "@/app/types/SchoolInfo";
import { handleBuildImage } from "@/app/utility/handleBuildImage";
import SectionEyebrow from "@/app/sharedComponents/ui/SectionEyebrow";
import BentoCard from "@/app/sharedComponents/ui/BentoCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const SchoolGallery = ({ data }: { data: ISchoolInfo }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = direction === "left" ? -350 : 350;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  const galleryItems = data?.gallery || [];

  if (galleryItems.length === 0) return null;

  return (
    <BentoCard
      variant="white"
      className="p-6 sm:p-8 lg:p-10 border-border-subtle/80"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <SectionEyebrow variant="light">
            Verified Campus Photos
          </SectionEyebrow>
          <h3 className="mt-3 font-display text-2xl font-bold text-text-ink sm:text-3xl">
            Campus Facilities & Deliveries
          </h3>
          <p className="mt-1 text-sm text-text-body">
            Classrooms, science labs, and hydration points supported by community donors.
          </p>
        </div>

        {galleryItems.length > 2 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Previous image"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-white text-text-ink transition-colors hover:bg-surface-forest hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Next image"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-white text-text-ink transition-colors hover:bg-surface-forest hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        tabIndex={0}
        aria-label="School photo gallery"
        className="mt-6 flex gap-4 overflow-x-auto pb-2 pt-2 no-scrollbar focus:outline-none focus:ring-2 focus:ring-brand-lime"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {galleryItems.map((item, index) => (
          <div
            key={index}
            style={{ scrollSnapAlign: "start" }}
            className="group relative h-[260px] w-[280px] flex-shrink-0 overflow-hidden rounded-2xl bg-surface-bento shadow-sm transition-all sm:h-[300px] sm:w-[340px]"
          >
            <Image
              src={handleBuildImage(
                item?.imageUrl,
                "/school-single/school-single-gallery.webp"
              )}
              alt={item?.title || "School gallery image"}
              fill
              sizes="(max-width: 640px) 280px, 340px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {item?.title && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 text-white">
                <p className="text-sm font-semibold">{item.title}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </BentoCard>
  );
};

export default SchoolGallery;
