import React from "react";
import { getSubmissionData } from "@/app/utility/getSubmissionData";
import InboxDirectory from "@/app/sharedComponents/inbox/InboxDirectory";

const FormSubmissions = async () => {
  const result = await getSubmissionData();
  const submissions = result?.data || [];
  const kpis = result?.additionalData;

  return (
    <div className="space-y-6">
      <InboxDirectory
        initialData={submissions}
        kpis={kpis}
        endpoint="submissions"
        basePath="/dashboard/form-submissions"
        title="Platform Inquiries & Submissions"
        description="Review general contact inquiries submitted by public visitors across the platform."
      />
    </div>
  );
};

export default FormSubmissions;
