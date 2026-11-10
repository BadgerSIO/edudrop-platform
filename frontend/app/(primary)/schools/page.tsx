import React from "react";
import { Metadata } from "next";
import Hero from "./components/Hero";
import SchoolList from "./components/SchoolList";
import SchoolNominationBanner from "./components/SchoolNominationBanner";
import { getSchoolInfo } from "../components/wrappers/SchoolSupportedWrapper";

export const metadata: Metadata = {
  title: "Partner Schools | EduDrop Foundation",
  description:
    "Browse verified partner schools and sponsor direct-to-bursar deliveries of pure spring water and classroom essentials.",
};

const Schools = async () => {
  const schools = await getSchoolInfo();
  const schoolList = schools?.data || [];

  return (
    <main className="min-h-screen">
      <Hero />
      <SchoolList schools={schoolList} />
      <SchoolNominationBanner />
    </main>
  );
};

export default Schools;
