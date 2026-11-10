import Link from "next/link";
import React from "react";
import RegisterForm from "./components/RegisterForm";
import AuthPillar from "@/app/sharedComponents/Auth/AuthPillar";

const Register = () => {
  return (
    <section className="bg-surface-canvas min-h-[calc(100vh-80px)] py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Hero / Brand Pillar (order-2 on mobile, order-1 on desktop) */}
          <div className="order-2 lg:order-1 lg:col-span-5 flex flex-col">
            <AuthPillar
              eyebrow="Donor Registration"
              title="Direct Impact for Every Student"
              description="Create your donor account to sponsor verified schools with 100% direct-to-gate delivery."
              mode="register"
            />
          </div>

          {/* Right Bento Form Card (order-1 on mobile, order-2 on desktop) */}
          <div className="order-1 lg:order-2 lg:col-span-7 flex flex-col">
            <div className="rounded-3xl border border-border-subtle bg-white p-6 sm:p-10 shadow-bento flex flex-col justify-between flex-1">
              <div>
                {/* Auth Mode Segmented Switcher */}
                <div className="grid grid-cols-2 rounded-2xl bg-surface-canvas p-1.5 border border-border-subtle mb-8">
                  <Link
                    href="/login"
                    className="flex items-center justify-center py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-xl text-text-body hover:text-text-ink hover:bg-white/60 transition-all select-none"
                  >
                    Sign In
                  </Link>
                  <div className="flex items-center justify-center py-2.5 px-4 text-xs sm:text-sm font-bold rounded-xl bg-surface-forest text-brand-lime shadow-sm select-none">
                    Create Account
                  </div>
                </div>

                {/* Form Header */}
                <div className="mb-6 space-y-1.5">
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-text-ink">
                    Create Donor Account
                  </h1>
                  <p className="text-xs sm:text-sm text-text-body leading-relaxed">
                    Join alumni, parents, and community sponsors funding pure drinking water.
                  </p>
                </div>

                {/* Form Body */}
                <RegisterForm />
              </div>

              {/* Security & Terms Footer */}
              <div className="mt-8 pt-6 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-body/60">
                <span>100% Direct-to-Bursar Delivery</span>
                <p>
                  Already registered?{" "}
                  <Link
                    href="/login"
                    className="font-bold text-surface-forest hover:underline transition-colors"
                  >
                    Sign In here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
