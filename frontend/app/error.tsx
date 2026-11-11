"use client";

import { Ban } from "lucide-react";
import Link from "next/link";

const Error = ({ error }: { error: Error }) => {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-sky-50">
      <div className="space-y-5 rounded-xl bg-white px-5 py-10">
        <Ban className="h-10 w-10 text-red-500" />
        <h1 className="text-2xl font-bold">My bad. An error occured!</h1>
        <Link
          href="/"
          className="inline-block rounded-full bg-surface-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-surface-forest/90 transition-all"
        >
          Back to Home
        </Link>
        {/* <p>{error.message}</p> */}
      </div>
    </div>
  );
};

export default Error;
