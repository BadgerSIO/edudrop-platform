import React, { Suspense } from "react";
import { Metadata } from "next";
import Hero from "./components/Hero";
import ProductsTab from "./components/ProductsTab";
import SupplyImpactReassurance from "./components/SupplyImpactReassurance";
import BulkSponsorshipBanner from "./components/BulkSponsorshipBanner";
import CommonLoader from "@/app/sharedComponents/Loders/CommonLoader";

export const metadata: Metadata = {
  title: "Classroom Supplies & Spring Water | EduDrop Foundation",
  description:
    "Sponsor pure bottled spring water cases, dispensers, and essential hygiene supplies delivered directly to verified partner schools.",
};

const Products = async () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <Suspense fallback={<CommonLoader />}>
        <ProductsTab />
      </Suspense>
      <SupplyImpactReassurance />
      <BulkSponsorshipBanner />
    </main>
  );
};

export default Products;
