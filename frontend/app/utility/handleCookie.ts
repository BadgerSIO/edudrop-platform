"use server";
import { cookies } from "next/headers";

export async function setCookie(name: string, value: string, maxAge: number) {
  const cookieStore = await cookies();
  cookieStore.set(name, value, {
    maxAge: maxAge,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function getCookie(name: string) {
  const cookieStore = await cookies();
  const data = cookieStore.get(name);
  return data?.value;
}

export async function deleteCookie(name: string) {
  const cookieStore = await cookies();
  cookieStore.delete(name);
  return;
}
