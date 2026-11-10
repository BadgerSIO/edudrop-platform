"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { SERVERURLAPI } from "@/lib/constants";
import { getCookie } from "@/app/utility/handleCookie";
import SchoolDetailHub from "@/app/(dashboard)/dashboard/(schools)/schools-list/[slug]/components/SchoolDetailHub";
import EduDropLoader from "@/app/sharedComponents/Loders/EduDropLoader";
import { AlertCircle } from "lucide-react";

export default function BursarSchoolProfilePage() {
  const [loading, setLoading] = useState(true);
  const [schoolInfo, setSchoolInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchMySchoolInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const jwt = await getCookie("jwt");
      if (!jwt) {
        setError("You are not authenticated.");
        return;
      }
      const res = await axios.get(`${SERVERURLAPI}/school-info`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (res.data?.data) {
        setSchoolInfo(res.data.data);
      } else {
        setError("No school profile found for this bursar account.");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to load your school profile. Please contact administrator."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySchoolInfo();
  }, []);

  if (loading) {
    return (
      <EduDropLoader
        size="md"
        label="Loading school profile..."
        sublabel="Fetching campus profile and active supply requests"
      />
    );
  }

  if (error || !schoolInfo) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
        <h2 className="text-base font-bold">Profile Unavailable</h2>
        <p className="mt-1 text-xs">{error || "School profile not found"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SchoolDetailHub
        school={schoolInfo?.school}
        schoolInfo={schoolInfo}
        rTag="schoolInfo"
        isBursarView={true}
      />
    </div>
  );
}
