import { ITestimonials } from "@/app/types/Homepage";
import Image from "next/image";
import React from "react";
import BentoCard from "@/app/sharedComponents/ui/BentoCard";
import { Quote } from "lucide-react";

const ReviewCard = ({ review }: { review: ITestimonials }) => {
  const { imageUrl, companyName, authorName, reviewText } = review;
  const buildImageUrl = imageUrl || "/home/user1.webp";

  return (
    <BentoCard
      variant="bento"
      className="flex flex-col justify-between p-6 sm:p-8 hover:shadow-bento-hover transition-all duration-300"
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-lime/25 text-surface-forest">
            <Quote className="h-5 w-5" />
          </span>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-surface-forest shadow-sm border border-border-subtle/70">
            Verified Partner
          </span>
        </div>

        <p className="mt-5 text-sm sm:text-base leading-relaxed text-text-ink font-medium">
          &ldquo;{reviewText}&rdquo;
        </p>
      </div>

      <div className="mt-6 flex items-center gap-3.5 border-t border-border-subtle/60 pt-5">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border-subtle bg-white">
          <Image
            src={buildImageUrl}
            alt={authorName}
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
        <div>
          <h4 className="text-sm font-bold text-text-ink">{authorName}</h4>
          <p className="text-xs text-text-body">{companyName}</p>
        </div>
      </div>
    </BentoCard>
  );
};

export default ReviewCard;
