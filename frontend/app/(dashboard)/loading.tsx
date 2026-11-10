const Loading = () => {
  return (
    <div className="fixed left-0 top-0 z-[100000] flex h-screen w-full items-center justify-center bg-white">
      <p>
        Loading <span>.</span>
        <span>.</span>
        <span>.</span>
      </p>
    </div>
  );
};

export default Loading;
