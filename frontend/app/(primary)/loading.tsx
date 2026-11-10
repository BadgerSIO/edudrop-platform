import EduDropLoader from "../sharedComponents/Loders/EduDropLoader";
import CommonLoader from "../sharedComponents/Loders/CommonLoader";

const Loading = () => {
  return (
    <div className="min-h-screen bg-surface-canvas">
      {/* Forest Emerald Header Band preserving visual continuity below Navbar */}
      <div className="bg-surface-forest py-12 sm:py-16">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <EduDropLoader
            size="md"
            tone="lime"
            compact
            label="Preparing classroom sponsorship data..."
            sublabel="Connecting to EduDrop verified campus records"
            className="py-4"
          />
        </div>
      </div>

      {/* Layout-preserving Bento Skeleton */}
      <CommonLoader />
    </div>
  );
};

export default Loading;
