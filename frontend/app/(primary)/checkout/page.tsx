import React, { Suspense } from "react";
import { Metadata } from "next";
import Hero from "./components/Hero";
import CheckoutFormWrapper from "./components/CheckoutFormWrapper";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Sponsorship Checkout | EduDrop Foundation",
  description:
    "Direct gate delivery with zero overhead diversion. Your contribution directly provisions physical classroom supplies for verified partner schools.",
};

const Checkout = () => {
  return (
    <main className="min-h-screen bg-surface-canvas">
      <Hero />
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="flex flex-col items-center gap-2.5 text-surface-forest">
              <Loader2 className="h-7 w-7 animate-spin" />
              <p className="text-sm font-semibold">Loading checkout options...</p>
            </div>
          </div>
        }
      >
        <CheckoutFormWrapper />
      </Suspense>
    </main>
  );
};

export default Checkout;
