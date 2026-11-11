import React from "react";
import AdminLogin from "./components/AdminLogin";
import AuthPillar from "@/app/sharedComponents/Auth/AuthPillar";
import Link from "next/link";
import { getServerDemoMode } from "@/app/utility/getDemoStatus";
import { Shield } from "lucide-react";

const EdudropAdminLogin = async () => {
  const initialDemoMode = await getServerDemoMode();

  return (
    <section className="bg-surface-canvas min-h-[calc(100vh-80px)] py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Hero / Brand Pillar */}
          <div className="order-2 lg:order-1 lg:col-span-5 flex flex-col">
            <AuthPillar
              eyebrow="Platform Console"
              title="EduDrop Administration"
              description="Restricted management console for authorized system operations."
              mode="admin"
            />
          </div>

          {/* Right Bento Form Card */}
          <div className="order-1 lg:order-2 lg:col-span-7 flex flex-col">
            <div className="rounded-3xl border border-border-subtle bg-white p-6 sm:p-10 shadow-bento flex flex-col justify-between flex-1">
              <div>
                {/* Header Badge */}
                <div className="mb-6 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-forest/10 text-surface-forest">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-text-ink">
                      Admin Sign In
                    </h1>
                    <p className="text-xs sm:text-sm text-text-body">
                      Enter your authorized administrator credentials.
                    </p>
                  </div>
                </div>

                {/* Form */}
                <AdminLogin initialDemoMode={initialDemoMode} />
              </div>

              {/* Cross-Link Footer */}
              <div className="mt-8 pt-6 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2 text-xs text-text-body/70">
                <span>Looking for donor or bursar portal?</span>
                <Link
                  href="/login"
                  className="font-bold text-surface-forest hover:underline transition-colors"
                >
                  Donor Sign In Portal →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EdudropAdminLogin;
