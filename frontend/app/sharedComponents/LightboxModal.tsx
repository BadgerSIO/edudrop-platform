import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import React from "react";
import { IOurRecentWork } from "../types/Homepage";
interface LightboxModalProps {
  imageIndex: number;
  images: IOurRecentWork[];
  setLightBoxOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setImageIndex: React.Dispatch<React.SetStateAction<number>>;
}
const LightboxModal = ({
  imageIndex,
  images,
  setLightBoxOpen,
  setImageIndex,
}: LightboxModalProps) => {
  const handleNavigationFroward = () => {
    if (imageIndex < images.length - 1) {
      setImageIndex(imageIndex + 1);
    } else {
      setImageIndex(0);
    }
  };
  const handleNavigationBackward = () => {
    if (imageIndex > 0) {
      setImageIndex(imageIndex - 1);
    } else {
      setImageIndex(images.length - 1);
    }
  };
  return (
    <div className="fixed left-0 top-0 z-[999] flex min-h-[100vh] w-full items-center justify-center bg-black/90">
      <div className="w-full">
        <Image
          src={images[imageIndex]?.imageUrl || ""}
          width={1920}
          height={1024}
          alt={images[imageIndex].title}
          className="lightboxImage mx-auto max-h-[70vh] select-none object-contain  "
        />
        <h3 className="mt-2 text-center text-white lg:text-xl">
          {images[imageIndex].title}
        </h3>
      </div>
      <svg
        onClick={() => setLightBoxOpen(false)}
        viewBox="0 0 136 136"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute right-5 top-5 h-10 w-10 cursor-pointer"
      >
        <line
          x1="32.2125"
          y1="99.9831"
          x2="99.7143"
          y2="32.4812"
          stroke="white"
          strokeWidth="5"
        />
        <line
          x1="99.7142"
          y1="103.519"
          x2="32.2123"
          y2="36.0168"
          stroke="white"
          strokeWidth="5"
        />
      </svg>
      <ArrowRight
        onClick={handleNavigationFroward}
        className="absolute right-0 top-2/4 -translate-y-2/4 cursor-pointer rounded-full bg-white/80 p-2 text-surface-forest hover:bg-surface-forest hover:text-white"
      />
      <ArrowLeft
        onClick={handleNavigationBackward}
        className="absolute left-0 top-2/4 -translate-y-2/4 cursor-pointer rounded-full bg-white/80 p-2 text-surface-forest hover:bg-surface-forest hover:text-white"
      />
    </div>
  );
};

export default LightboxModal;
