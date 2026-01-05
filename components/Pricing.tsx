"use client";

import { Check } from "lucide-react";
import { useState, type MouseEvent } from "react";
import useSubscription from "@/lib/hooks/useSubscription";
import Link from "next/link";

// Type definitions
type ProductType = "free" | "pro" | "premium";

interface Plan {
  name: string;
  price: string;
  duration: string;
  description: string;
  features: readonly string[];
  buttonText: string;
  buttonStyle: string;
  popular?: boolean;
  product: ProductType;
  href?: string;
}

export default function Pricing() {
  const { initiateSubscription } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<ProductType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async (product: ProductType): Promise<void> => {
    try {
      setError(null);
      setLoadingPlan(product);
      await initiateSubscription(product);
    } catch (error) {
      console.error("Upgrade error:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handlePlanClick = (plan: Plan, event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>): void => {
    if (!plan.href) {
      event.preventDefault();
      void handleUpgrade(plan.product);
    }
  };

  const plans: readonly Plan[] = [
    {
      name: "Free Trial",
      price: "Free",
      duration: "14 days",
      description: "Perfect for trying out ReimburseMe",
      features: [
        "Upload up to 10 receipts",
        "Basic OCR extraction",
        "1 PDF report export",
        "Email support",
      ],
      buttonText: "Start Free Trial",
      buttonStyle: "border border-gray-300 text-gray-700 hover:bg-gray-50",
      href: "/account/signup",
      product: "free",
    },
    {
      name: "Pro",
      price: "$9",
      duration: "/month",
      description: "For individual professionals",
      features: [
        "Unlimited receipt uploads",
        "Advanced OCR with accuracy",
        "1 monthly report export",
        "Email support",
        "Receipt categories",
        "Monthly expense tracking",
      ],
      buttonText: "Choose Pro",
      buttonStyle: "bg-[#2E86DE] text-white hover:bg-[#2574C7]",
      popular: true,
      product: "pro",
    },
    {
      name: "Premium",
      price: "$15",
      duration: "/month",
      description: "For teams and power users",
      features: [
        "Everything in Pro",
        "Unlimited monthly reports",
        "Gmail auto-import (coming soon)",
        "Priority support",
        "Advanced analytics",
        "Team collaboration",
      ],
      buttonText: "Choose Premium",
      buttonStyle: "border border-gray-300 text-gray-700 hover:bg-gray-50",
      product: "premium",
    },
  ] as const;

  return (
    <>
      <section className="py-16 md:py-24 px-6 bg-[#F3F4F6]" id="pricing">
        <div className="max-w-[1200px] mx-auto">
          {/* Section heading */}
          <div className="text-center mb-12 md:mb-16">
            <h2
              className="text-4xl md:text-[48px] leading-tight md:leading-[1.1] text-gray-900 mb-6"
              style={{
                fontFamily: "Poppins, serif",
                fontWeight: "700",
              }}
            >
              Simple, transparent{" "}
              <em className="font-bold text-[#2E86DE]">pricing</em>
            </h2>

            <p
              className="text-base md:text-lg text-gray-600 max-w-[60ch] mx-auto"
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
              }}
            >
              Start with our free trial, then choose the plan that works best
              for your needs.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-red-800 text-center text-sm">{error}</p>
            </div>
          )}

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`
                  relative bg-white rounded-3xl p-8 border transition-all duration-200
                  ${
                    plan.popular
                      ? "border-[#2E86DE] shadow-xl scale-105"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-lg"
                  }
                `}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-[#2E86DE] text-white px-4 py-2 rounded-2xl text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3
                    className="text-2xl font-bold text-gray-900 mb-2"
                    style={{ fontFamily: "Poppins, system-ui, sans-serif" }}
                  >
                    {plan.name}
                  </h3>

                  <div className="mb-4">
                    <span
                      className="text-4xl font-bold text-gray-900"
                      style={{ fontFamily: "Poppins, system-ui, sans-serif" }}
                    >
                      {plan.price}
                    </span>
                    <span className="text-gray-600 text-lg">
                      {plan.duration}
                    </span>
                  </div>

                  <p className="text-gray-600">{plan.description}</p>
                </div>

                {/* Features list */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className="shrink-0 w-5 h-5 bg-[#10B981] rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <Check size={12} className="text-white" />
                      </div>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {plan.href ? (
                  <Link
                    href={plan.href}
                    className={`
                      block w-full text-center py-3 px-6 rounded-2xl font-semibold transition-colors
                      ${plan.buttonStyle}
                    `}
                  >
                    {plan.buttonText}
                  </Link>
                ) : (
                  <button
                    onClick={(event) => handlePlanClick(plan, event)}
                    disabled={loadingPlan === plan.product}
                    className={`
                      block w-full text-center py-3 px-6 rounded-2xl font-semibold transition-colors disabled:opacity-50
                      ${plan.buttonStyle}
                    `}
                  >
                    {loadingPlan === plan.product
                      ? "Starting Checkout..."
                      : plan.buttonText}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Highlighted One-time Export Promotion */}
          <div className="relative mt-16 md:mt-24 max-w-4xl mx-auto overflow-hidden rounded-[32px] p-1 border border-white/20 shadow-2xl">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#2E86DE]/20 via-[#8B5CF6]/20 to-[#2E86DE]/20 opacity-50 blur-xl animate-pulse"></div>
            
            <div className="relative bg-white/70 backdrop-blur-xl rounded-[30px] p-8 md:p-12 border border-white/40 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2E86DE] text-white text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  One-Time Special
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Just need the <span className="text-[#2E86DE]">results?</span>
                </h3>
                <p className="text-gray-600 text-lg max-w-[400px]">
                  Process up to 10 receipts with AI precision and export as CSV/PDF instantly. 
                  <span className="font-semibold block mt-1">No subscription. No commitment.</span>
                </p>
              </div>

              <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-100 shadow-xl min-w-[280px]">
                <div className="text-gray-500 line-through text-sm mb-1">$9.99 Value</div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-black text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>$3.99</span>
                  <span className="text-gray-500 font-medium">USD</span>
                </div>
                <Link 
                  href="/batch-upload" 
                  className="w-full text-center py-4 px-8 bg-[#2E86DE] hover:bg-[#2574C7] text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Start Batch Export
                </Link>
                <div className="mt-4 flex items-center gap-2 text-xs text-green-600 font-medium">
                  <Check size={14} /> Instant Access • Secure Payment
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600">
              All plans include secure cloud storage and data encryption.
              <br className="hidden sm:block" />
              Cancel anytime. No hidden fees.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
