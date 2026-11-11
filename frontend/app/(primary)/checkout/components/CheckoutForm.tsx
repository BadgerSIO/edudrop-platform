"use client";
import React, { useEffect, useState } from "react";
import ShoppingCart from "./ShoppingCart";
import CustomerInfo from "./CustomerInfo";
import DonationTo from "./DonationTo";
import { FormProvider, useForm } from "react-hook-form";
import { useAuthContext } from "@/app/context/AuthContext";
import CheckoutAuthentication from "./CheckoutAuthentication";
import { useNavbarContext } from "@/app/context/NavContext";
import toast from "react-hot-toast";
import { deleteCookie, getCookie, setCookie } from "@/app/utility/handleCookie";
import {
  CANONICAL_US_COUNTRY,
  normalizeCountryValue,
} from "@/app/utility/countries";
import { useRouter } from "next/navigation";
import generateOrderID from "@/app/utility/generateOrderId";
import { ISchoolInfo } from "@/app/types/SchoolInfo";
import { SERVERURLAPI } from "@/lib/constants";
import axios from "axios";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import BentoCard from "@/app/sharedComponents/ui/BentoCard";
import EduDropLoader from "@/app/sharedComponents/Loders/EduDropLoader";
import RoleCheckoutGuard, {
  isStaffRole,
} from "@/app/sharedComponents/RoleCheckoutGuard";
import { CheckCircle2, Lock, ArrowRight, Loader2 } from "lucide-react";

interface IFormInput {
  name: {
    firstName: string;
    lastName: string;
  };
  email: string;
  presentAddress: string;
  country: string;
  city: string;
  zipCode: string;
  contactNo: string;
  schoolId: string;
  products: any;
  payMonthly: "yes" | "no";
  totalAmount: number;
}

type CheckoutProps = {
  schools: ISchoolInfo[];
};

export const CheckoutForm = ({ schools }: CheckoutProps) => {
  const router = useRouter();
  const [orderLoading, setOrderLoading] = useState(false);
  const [guestEmailExist, setGuestEmailExist] = useState("");
  const { data: userData, loading } = useAuthContext();
  const { cartProducts, subtotal, isCartOpen, setIsCartOpen } =
    useNavbarContext();
  const staffBlocked = isStaffRole(userData?.role);

  const methods = useForm<IFormInput>({
    mode: "onChange",
    defaultValues: {
      payMonthly: "no",
      country: CANONICAL_US_COUNTRY,
    },
  });

  const { handleSubmit, reset, setValue } = methods;

  const cookiechecker = async () => {
    const guestEmail = await getCookie("guestEmail");
    if (guestEmail) {
      setGuestEmailExist(guestEmail);
      setValue("email", guestEmail);
    }
    return guestEmail;
  };

  const handleClearGuestEmail = async () => {
    await deleteCookie("guestEmail");
    setGuestEmailExist("");
    setValue("email", "");
    toast.success("Guest email cleared. You can enter a new email or sign in.");
  };

  useEffect(() => {
    if (isCartOpen) {
      setIsCartOpen(false);
    }
    cookiechecker();
  }, []);

  useEffect(() => {
    if (userData?.email && userData?.role === "donar") {
      setValue("email", userData.email);
      const { donar } = userData;
      if (donar) {
        if (donar?.name?.firstName) setValue("name.firstName", donar.name.firstName);
        if (donar?.name?.lastName) setValue("name.lastName", donar.name.lastName);
        if (donar?.address?.presentAddress) {
          setValue("presentAddress", donar.address.presentAddress);
        }
        if (donar?.address?.country) {
          setValue("country", normalizeCountryValue(donar.address.country));
        }
        if (donar?.address?.city) {
          setValue("city", donar.address.city);
        }
        if (donar?.contactNo) {
          setValue("contactNo", donar.contactNo);
        }
        if (donar?.address?.zipCode) {
          setValue("zipCode", donar.address.zipCode);
        }
      }
    }
  }, [userData, reset, setValue]);

  const activeEmail = userData?.email || guestEmailExist;

  const onSubmit = async (data: IFormInput) => {
    if (staffBlocked) {
      toast.error(
        "Bursar and Admin accounts cannot submit sponsorship orders. Please sign out and continue as a Donor or Guest."
      );
      return;
    }

    const targetEmail = userData?.email || data.email || guestEmailExist;

    if (!targetEmail) {
      toast.error("Please enter your email or sign in to complete checkout.");
      const emailElem = document.getElementById("enterEmail");
      if (emailElem) {
        emailElem.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    if (!cartProducts || cartProducts.length === 0) {
      toast.error("Your sponsorship cart is empty. Please select classroom supplies.");
      return;
    }

    setOrderLoading(true);

    // If guest checkout, verify email is available or advise sign in
    if (!userData?.email) {
      try {
        const resp = await axios.post(`${SERVERURLAPI}/auth/checkuser`, {
          email: targetEmail,
        });
        if (resp.status === 200) {
          const maxAge = 60 * 60 * 1000;
          await setCookie("guestEmail", targetEmail, maxAge);
          setGuestEmailExist(targetEmail);
        }
      } catch (checkError) {
        toast.error("An account with this email already exists. Please sign in or use a different email.", {
          duration: 5000,
        });
        setOrderLoading(false);
        return;
      }
    }

    data.email = targetEmail;
    data.products = cartProducts;
    data.totalAmount = subtotal;

    try {
      const orderId = generateOrderID();
      const transactionId = `EDUDROP-TX-${orderId}-${Date.now()}`;
      const parameters = new URLSearchParams({
        status: "success",
        order_id: orderId,
        card: "(VISA) ... 4242",
        transaction_id: transactionId,
        data: JSON.stringify(JSON.stringify(data)),
      });
      router.push(`/transaction?${parameters.toString()}`);
    } catch (error) {
      await deleteCookie("paymentIntent");
      console.error("Checkout submission error:", error);
      toast.error(`Failed to submit sponsorship: ${error}`);
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <EduDropLoader
        size="md"
        label="Loading checkout details..."
        sublabel="Verifying donor profile and campus delivery details"
      />
    );
  }

  return (
    <section className="bg-surface-canvas py-10 sm:py-14">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
              {/* Main Checkout Form Column (8 cols) */}
              <div className="lg:col-span-8">
                {staffBlocked ? (
                  <RoleCheckoutGuard
                    variant="card"
                    redirectTo="/checkout"
                    className="mb-8"
                  />
                ) : (
                  <>
                    {/* Step 1: Account Access / Active Badge */}
                    {!userData?.email && !guestEmailExist ? (
                      <CheckoutAuthentication cookiechecker={cookiechecker} />
                    ) : (
                      <BentoCard
                        variant="white"
                        className="mb-8 border-border-subtle/80 p-5 sm:p-6 shadow-bento"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-lime/20 text-surface-forest shrink-0">
                              <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-surface-forest">
                                  {userData?.email ? "Logged In Donor" : "Guest Donor"}
                                </span>
                                <span className="inline-flex items-center rounded-full bg-surface-forest/10 px-2 py-0.5 text-[11px] font-semibold text-surface-forest">
                                  Verified
                                </span>
                              </div>
                              <p className="font-display text-sm font-bold text-text-ink sm:text-base">
                                {activeEmail}
                              </p>
                            </div>
                          </div>

                          {!userData?.email && (
                            <button
                              type="button"
                              onClick={handleClearGuestEmail}
                              className="inline-flex text-xs font-semibold text-text-body transition-colors hover:text-surface-forest underline underline-offset-2"
                            >
                              Use a different email
                            </button>
                          )}
                        </div>
                      </BentoCard>
                    )}

                    {/* Steps 2 & 3: Multi-step Form */}
                    <DonationTo schools={schools} />
                    <CustomerInfo />

                    {/* Final Order Placement Action Bento Card */}
                    <BentoCard
                      variant="white"
                      className="border-border-subtle/80 p-6 sm:p-8 shadow-bento"
                    >
                      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-xs font-semibold text-surface-forest">
                            <Lock className="h-4 w-4 shrink-0" />
                            <span>256-Bit SSL Encrypted Classroom Sponsorship</span>
                          </div>
                          <p className="mt-1 text-xs text-text-body max-w-md">
                            100% of your gift is channeled to physical classroom supply
                            orders with official Bursar delivery receipts.
                          </p>
                        </div>

                        <div className="shrink-0">
                          {cartProducts?.length > 0 ? (
                            <ActionPillButton
                              type="submit"
                              variant="lime"
                              size="lg"
                              disabled={orderLoading}
                              className="w-full justify-center whitespace-nowrap shadow-bento hover:shadow-bento-hover"
                            >
                              {orderLoading ? (
                                <span className="inline-flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Processing Requisition...
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-2">
                                  Confirm & Complete Sponsorship
                                  <ArrowRight className="h-4 w-4" />
                                </span>
                              )}
                            </ActionPillButton>
                          ) : (
                            <ActionPillButton
                              variant="dark"
                              size="lg"
                              href="/products"
                              className="w-full justify-center whitespace-nowrap"
                            >
                              Add Classroom Supplies First
                            </ActionPillButton>
                          )}
                        </div>
                      </div>
                    </BentoCard>
                  </>
                )}
              </div>

              {/* Sticky Shopping Cart Column (4 cols) */}
              <div className="lg:col-span-4">
                <ShoppingCart />
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </section>
  );
};

export default CheckoutForm;
