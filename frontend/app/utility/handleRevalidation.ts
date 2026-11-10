"use server";

import { revalidateTag } from "next/cache";

export const handleRevalidation = async (tag: string) => {
  revalidateTag(tag, "default");
};
