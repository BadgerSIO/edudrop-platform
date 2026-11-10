"use client";
import React, { useMemo, useRef, useState } from "react";
import { ISchoolInfo } from "@/app/types/SchoolInfo";
import SchoolCard, { extractSchoolMeta } from "./SchoolCard";
import SchoolSearchFilter from "./SchoolSearchFilter";
import BentoCard from "@/app/sharedComponents/ui/BentoCard";
import SectionHeader from "@/app/sharedComponents/ui/SectionHeader";
import Reveal from "@/app/sharedComponents/ui/Reveal";
import { runViewTransition, toViewTransitionName } from "@/app/utility/viewTransition";
import { School, Droplets, PackageCheck, SearchX } from "lucide-react";

interface SchoolListProps {
  schools: ISchoolInfo[];
}

const steps = [
  {
    step: "01",
    icon: School,
    title: "Select an Active Campus",
    description:
      "Pick a verified partner school from the directory to review their bursar's monthly classroom hydration needs.",
  },
  {
    step: "02",
    icon: Droplets,
    title: "Sponsor Water & Essentials",
    description:
      "Choose pure spring water cases, classroom dispensers, or sanitization refills with a single-case or recurring gift.",
  },
  {
    step: "03",
    icon: PackageCheck,
    title: "Direct Gate Delivery",
    description:
      "EduDrop consolidates orders and delivers directly to the school bursar, publishing photo delivery receipts to the portal.",
  },
];

export const SchoolList: React.FC<SchoolListProps> = ({ schools }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelectCity = (city: string) => {
    runViewTransition(() => {
      setSelectedCity(city);
    });
  };

  const handleResetFromEmpty = () => {
    runViewTransition(
      () => {
        setSearchQuery("");
        setSelectedCity("all");
      },
      () => {
        containerRef.current?.focus();
      }
    );
  };

  // Extract unique cities reliably from schoolStats or shortDescription
  const cities = useMemo(() => {
    const citySet = new Set<string>();
    schools.forEach((s) => {
      const { location } = extractSchoolMeta(s);
      if (location) {
        citySet.add(location);
      }
    });
    return Array.from(citySet);
  }, [schools]);

  // Filtered schools
  const filteredSchools = useMemo(() => {
    return schools.filter((s) => {
      const { location } = extractSchoolMeta(s);
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        q === "" ||
        s.schoolName?.toLowerCase().includes(q) ||
        s.shortDescription?.toLowerCase().includes(q) ||
        location?.toLowerCase().includes(q) ||
        s.schoolStats?.some((stat) => stat.title.toLowerCase().includes(q));

      const matchesCity = selectedCity === "all" || location === selectedCity;

      return matchesSearch && matchesCity;
    });
  }, [schools, searchQuery, selectedCity]);

  return (
    <section className="bg-surface-canvas py-10 sm:py-14 lg:py-16">
      <div
        ref={containerRef}
        tabIndex={-1}
        className="mx-auto max-w-[1320px] px-5 sm:px-8 focus:outline-none"
      >
        {/* Unified Bento Search & Location Filter Toolbar */}
        <SchoolSearchFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCity={selectedCity}
          onSelectCity={handleSelectCity}
          cities={cities}
          totalCount={schools.length}
          filteredCount={filteredSchools.length}
        />

        {/* Schools Grid */}
        {filteredSchools.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSchools.map((school, idx) => (
              <SchoolCard
                key={school._id || school.slug}
                school={school}
                style={{
                  viewTransitionName: toViewTransitionName(
                    "school-card",
                    school._id || school.slug || String(idx)
                  ),
                }}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-border-subtle bg-white p-12 text-center shadow-sm">
            <SearchX className="mx-auto h-12 w-12 text-text-body" />
            <h3 className="mt-4 text-xl font-bold text-text-ink">
              No matching partner schools found
            </h3>
            <p className="mt-2 text-sm text-text-body">
              Try adjusting your search keywords or clearing your location filter
              to view all campuses.
            </p>
            <button
              type="button"
              onClick={handleResetFromEmpty}
              className="mt-6 inline-flex rounded-full bg-surface-forest px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-surface-forest-light"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* How It Works Reassurance Bar */}
        <div className="mt-20 border-t border-border-subtle pt-16 sm:mt-24 sm:pt-20">
          <Reveal>
            <SectionHeader
              eyebrow="Direct Distribution"
              title="How Campus Sponsorship Works"
              subtitle="A transparent, 3-step pipeline ensuring zero donation diversion."
              align="center"
            />
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {steps.map((st, idx) => {
              const Icon = st.icon;
              return (
                <Reveal key={idx} delayMs={idx * 70} className="h-full">
                  <BentoCard
                    variant="bento"
                    className="flex h-full flex-col justify-between p-7 sm:p-8"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-surface-forest shadow-sm border border-border-subtle">
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className="font-mono text-sm font-bold text-text-body/60">
                          {st.step}
                        </span>
                      </div>
                      <h4 className="mt-6 text-lg font-bold text-text-ink">
                        {st.title}
                      </h4>
                      <p className="mt-2.5 text-sm leading-relaxed text-text-body">
                        {st.description}
                      </p>
                    </div>
                  </BentoCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SchoolList;
