import { useRouter } from "next/navigation";

const useScrollToId = () => {
  const router = useRouter();
  const scrollToId = (id: string, path: string) => {
    router.push(path);
    setTimeout(() => {
      const targetSection = document.getElementById(id);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 500); // Delay in milliseconds, adjust as needed
  };
  return {
    scrollToId,
  };
};

export default useScrollToId;
