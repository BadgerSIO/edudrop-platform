"use client";
import { ITestimonials } from "@/app/types/Homepage";
import React from "react";
import ReviewCard from "./ReviewCard";
import SectionHeader from "@/app/sharedComponents/ui/SectionHeader";
import Reveal from "@/app/sharedComponents/ui/Reveal";

type OurClientsSaysProps = {
  data: ITestimonials[];
};

const OurClientsSays = ({ data }: OurClientsSaysProps) => {
  return (
    <section className="bg-surface-canvas py-16 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <Reveal>
          <SectionHeader
            align="center"
            eyebrow="Community Trust"
            title="Why Donors & Principals Trust EduDrop"
            subtitle="Real stories from alumni associations, parent councils, and school bursars whose classrooms receive direct deliveries."
          />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {data.map((review, index) => (
            <Reveal
              key={review?._id || index}
              delayMs={(index % 3) * 70}
              className="h-full"
            >
              <ReviewCard review={review as ITestimonials} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurClientsSays;
