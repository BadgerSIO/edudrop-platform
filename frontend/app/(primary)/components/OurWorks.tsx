"use client";
import React, { useEffect, useState } from "react";
import LightboxModal from "../../sharedComponents/LightboxModal";
import { IOurRecentWork } from "@/app/types/Homepage";
import SingleWorkImage from "./SingleWorkImage";
import SectionHeader from "@/app/sharedComponents/ui/SectionHeader";
import Reveal from "@/app/sharedComponents/ui/Reveal";

const OurWorks = ({ data }: { data: IOurRecentWork[] }) => {
  const [lightBoxOpen, setLightBoxOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    if (lightBoxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }
  }, [lightBoxOpen]);

  const handleLightBox = (indexImage: number) => {
    setImageIndex(indexImage);
    setLightBoxOpen(true);
  };

  const displayWorks = data?.slice(0, 6) || [];

  return (
    <>
      <section className="bg-surface-canvas py-16 sm:py-24 lg:py-28 border-t border-border-subtle/50">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <Reveal>
            <SectionHeader
              align="center"
              eyebrow="Proven Impact"
              title="Recent Campus Deliveries"
              subtitle="Every month, sponsored spring water cases, dispensers, and learning supplies are delivered directly into student and teacher hands."
            />
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayWorks.map((item, indexImage) => (
              <Reveal
                key={item?._id || indexImage}
                delayMs={(indexImage % 3) * 70}
              >
                <SingleWorkImage
                  info={item}
                  handleLightBox={handleLightBox}
                  indexImage={indexImage}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {lightBoxOpen && (
        <LightboxModal
          imageIndex={imageIndex}
          images={data}
          setLightBoxOpen={setLightBoxOpen}
          setImageIndex={setImageIndex}
        />
      )}
    </>
  );
};

export default OurWorks;
