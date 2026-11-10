import React from "react";
import AddSchoolForm from "./AddSchoolForm";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";

const AddNewSchool = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/schools-list"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-subtle bg-white text-text-muted hover:text-text-ink hover:bg-surface-bento/50 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-ink flex items-center gap-2">
              <Building2 className="h-6 w-6 text-surface-forest" />
              Add Partner School
            </h1>
            <p className="mt-1 text-xs text-text-muted">
              Enroll a new school campus and provision a bursar administrative account.
            </p>
          </div>
        </div>
      </div>
      <AddSchoolForm />
    </div>
  );
};

export default AddNewSchool;
