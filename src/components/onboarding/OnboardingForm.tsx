"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEventLogger } from "@/lib/eventLogger";
import { OnboardingErrorBoundary } from "@/components/ErrorBoundary";

type FormData = {
  name: string;
  phone: string;
  wantsClarityCalls: boolean;
  callTime: string; // "HH:MM"
  wantsCallReminders: boolean;
};

type FormErrors = Partial<
  Record<keyof Pick<FormData, "name" | "phone" | "callTime">, string>
>;

export default function OnboardingForm() {
  const router = useRouter();
  const { info, error, logUserAction } = useEventLogger();

  // convex hooks
  const completeOnboarding = useMutation(api.user.completeOnboarding);
  const user = useQuery(api.user.getCurrentUser); // undefined = loading, null = unauth, object = user

  // local state
  const [formEdited, setFormEdited] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    wantsClarityCalls: false,
    callTime: "",
    wantsCallReminders: false,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // derived
  const isLoading = user === undefined;

  // 1) redirect unauthenticated users once we know
  useEffect(() => {
    if (user === null) router.replace("/signin");
  }, [user, router]);

  // 2) hydrate once from server (StrictMode-safe)
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!user || formEdited || hydratedRef.current) return;

    const next: FormData = {
      name: user.name ?? "",
      phone: user.phone ?? "",
      wantsClarityCalls: Boolean(user.wantsClarityCalls),
      callTime: user.callTime ?? "",
      wantsCallReminders: Boolean(user.wantsCallReminders),
    };

    const changed =
      next.name !== formData.name ||
      next.phone !== formData.phone ||
      next.wantsClarityCalls !== formData.wantsClarityCalls ||
      next.callTime !== formData.callTime ||
      next.wantsCallReminders !== formData.wantsCallReminders;

    if (changed) setFormData(next);

    hydratedRef.current = true;

    if (process.env.NODE_ENV === "development") {
      // Avoid putting `info` in deps; it may be unstable
      try {
        console.debug("[onboarding] hydrated form from user");
      } catch { }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, formEdited]); // do NOT include formData / info here

  // 3) input handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormEdited(true);
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name in formErrors) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // 4) validation
  const timeRegex = useMemo(() => /^([01]?\d|2[0-3]):[0-5]\d$/, []);
  const phoneRegex = useMemo(
    () => /^\+?[0-9()\-\s]{7,20}$/,
    []
  );

  const validateForm = () => {
    const next: FormErrors = {};
    let ok = true;

    if (!formData.name.trim()) {
      next.name = "Full name is required.";
      ok = false;
    }
    if (!formData.phone.trim()) {
      next.phone = "Phone number is required.";
      ok = false;
    } else if (!phoneRegex.test(formData.phone.trim())) {
      next.phone = "Enter a valid phone number (you can include +, spaces, or dashes).";
      ok = false;
    }
    if (!formData.callTime) {
      next.callTime = "Preferred call time is required.";
      ok = false;
    } else if (!timeRegex.test(formData.callTime)) {
      next.callTime = "Use 24‑hour HH:MM (e.g., 09:00 or 14:30).";
      ok = false;
    }

    setFormErrors(next);
    return ok;
  };

  // 5) submit/redirect
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (process.env.NODE_ENV === "development") {
        info("onboarding", "Submitting onboarding form", formData);
        logUserAction("Onboarding form submitted", "onboarding", formData);
      }

      await completeOnboarding({
        name: formData.name.trim(),
        phoneNumber: formData.phone.trim(),
        wantsClarityCalls: formData.wantsClarityCalls,
        callTime: formData.callTime,
        wantsCallReminders: formData.wantsCallReminders,
      });

      if (process.env.NODE_ENV === "development") {
        info("onboarding", "Onboarding completed");
        logUserAction("Onboarding completed", "onboarding", formData);
      }

      redirectTimeoutRef.current = setTimeout(() => {
        router.push("/payment");
      }, 900);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      error(
        "onboarding",
        "Failed to complete onboarding",
        { error: msg, formData },
        true,
        "Failed to complete onboarding. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  // 6) UI
  if (isLoading) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
        <p className="mt-4 text-gray-600">Loading your information…</p>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <div className="mb-4 text-green-500">
          <svg
            className="h-16 w-16 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Onboarding Complete</h2>
        <p className="mb-6 text-gray-600">Redirecting you to payment…</p>
        <div className="animate-pulse">
          <div className="h-2 bg-blue-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <OnboardingErrorBoundary>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-2">Complete Your Onboarding</h2>
          <p className="mb-6 text-gray-600">
            Please provide the following information to complete your account setup.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Contact Information */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Contact Information</h3>

              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  autoComplete="tel"
                  inputMode="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (123) 456‑7890"
                />
                {formErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                )}
              </div>
            </div>

            {/* Call Preferences */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Call Preferences</h3>

              <div className="mb-4">
                <label htmlFor="callTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Call Time (24‑hour format)
                </label>
                <input
                  type="time"
                  id="callTime"
                  name="callTime"
                  value={formData.callTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.callTime && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.callTime}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="wantsClarityCalls"
                    name="wantsClarityCalls"
                    checked={formData.wantsClarityCalls}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-900">
                    I want clarity calls before scheduled tasks
                  </span>
                </label>
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="wantsCallReminders"
                    name="wantsCallReminders"
                    checked={formData.wantsCallReminders}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-900">
                    I want call reminders for scheduled calls
                  </span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Complete Onboarding
            </button>
          </form>
        </div>
      </div>
    </OnboardingErrorBoundary>
  );
}
