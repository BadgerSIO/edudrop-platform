const CommonLoader = () => {
  let divstyle = `mx-auto  w-full animate-pulse rounded-xl bg-gray-200`;
  return (
    <div className="relative bg-white px-5 py-20 lg:pb-28 lg:pt-[140px]">
      <div className="mx-auto w-full max-w-[1210px]">
        <div className="space-y-5">
          <div className={`min-h-[60px] max-w-sm ${divstyle}`}></div>
          <div className={`min-h-[20px] max-w-lg ${divstyle}`}></div>
          <div className={`min-h-[20px]  max-w-md ${divstyle}`}></div>
        </div>
      </div>
    </div>
  );
};

export default CommonLoader;
