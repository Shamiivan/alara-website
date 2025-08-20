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

type FieldStatus = "initial" | "valid" | "invalid";

type FieldStatuses = Record<keyof Pick<FormData, "name" | "phone" | "callTime">, FieldStatus>;

export default function OnboardingForm() {
  const router = useRouter();
  const { info, error, logUserAction } = useEventLogger();

  // convex hooks
  const completeOnboarding = useMutation(api.user.completeOnboarding);
  const user = useQuery(api.user.getCurrentUser); // undefined = loading, null = unauth, object = user

  // local state
  const [formEdited, setFormEdited] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    wantsClarityCalls: false,
    callTime: "",
    wantsCallReminders: false,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [fieldStatuses, setFieldStatuses] = useState<FieldStatuses>({
    name: "initial",
    phone: "initial",
    callTime: "initial",
  });
  const [showHourEasterEgg, setShowHourEasterEgg] = useState(false);

  // derived
  const isLoading = user === undefined;
  const progressCount = Object.values(fieldStatuses).filter(status => status === "valid").length;

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

    // Set a default call time to the next whole hour if not already set
    if (!formData.callTime) {
      const now = new Date();
      const nextHour = new Date(now);
      nextHour.setHours(now.getHours() + 1);
      nextHour.setMinutes(0);
      nextHour.setSeconds(0);
      const nextHourString = `${String(nextHour.getHours()).padStart(2, '0')}:00`;
      setFormData(prev => ({ ...prev, callTime: nextHourString }));
    }

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

    // Handle special case for callTime to detect :00 hour for easter egg
    if (name === "callTime" && value.endsWith(":00")) {
      // Only show easter egg 1% of the time (for now showing always for testing)
      const shouldShowEasterEgg = true; // In production: Math.random() < 0.01
      if (shouldShowEasterEgg) {
        setShowHourEasterEgg(true);
      }
    } else if (name === "callTime") {
      setShowHourEasterEgg(false);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name in formErrors) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle blur for validation
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "name" || name === "phone" || name === "callTime") {
      validateField(name as keyof Pick<FormData, "name" | "phone" | "callTime">, value);
    }

    // Format phone number on blur if it seems valid
    if (name === "phone" && phoneRegex.test(value.trim())) {
      // Simple E.164 formatting attempt - not comprehensive
      let formatted = value.trim();
      // If it doesn't start with +, add country code (assuming US/Canada)
      if (!formatted.startsWith("+")) {
        // Remove any non-digit characters
        const digits = formatted.replace(/\D/g, "");
        // Add +1 prefix if it seems like a 10-digit North American number
        if (digits.length === 10) {
          formatted = "+1 " + digits;
        }
      }

      setFormData(prev => ({ ...prev, phone: formatted }));
    }
  };

  // Validate a single field
  const validateField = (field: keyof Pick<FormData, "name" | "phone" | "callTime">, value: string) => {
    let error = "";
    let status: FieldStatus = "valid";

    switch (field) {
      case "name":
        if (!value.trim()) {
          error = "Oops! We need a name to summon you properly! ✨";
          status = "invalid";
        }
        break;
      case "phone":
        if (!value.trim()) {
          error = "Our carrier pigeons need a valid number to reach you! 🐦";
          status = "invalid";
        } else if (!phoneRegex.test(value.trim())) {
          error = "Hmm, phone didn't work. Try another format? (+, spaces, dashes all work!)";
          status = "invalid";
        }
        break;
      case "callTime":
        if (!value) {
          error = "Time machines need proper coordinates! (24-hour HH:MM format) 🕰️";
          status = "invalid";
        } else if (!timeRegex.test(value)) {
          error = "I'm a bit confused! Try 24-hour format like 14:30 ⏰";
          status = "invalid";
        }
        break;
    }

    setFormErrors(prev => ({ ...prev, [field]: error }));
    setFieldStatuses(prev => ({ ...prev, [field]: status }));

    return !error;
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
    const newStatuses = { ...fieldStatuses };

    if (!formData.name.trim()) {
      next.name = "Oops! We need a name to summon you properly! ✨";
      newStatuses.name = "invalid";
      ok = false;
    } else {
      newStatuses.name = "valid";
    }

    if (!formData.phone.trim()) {
      next.phone = "Our carrier pigeons need a valid number to reach you! 🐦";
      newStatuses.phone = "invalid";
      ok = false;
    } else if (!phoneRegex.test(formData.phone.trim())) {
      next.phone = "Hmm,does not look right. Try another format? (+, spaces, dashes all work!)";
      newStatuses.phone = "invalid";
      ok = false;
    } else {
      newStatuses.phone = "valid";
    }

    if (!formData.callTime) {
      next.callTime = "Time machines need proper coordinates! (24-hour HH:MM format) 🕰️";
      newStatuses.callTime = "invalid";
      ok = false;
    } else if (!timeRegex.test(formData.callTime)) {
      next.callTime = "Our time wizard is confused! Try 24-hour format like 14:30 ⏰";
      newStatuses.callTime = "invalid";
      ok = false;
    } else {
      newStatuses.callTime = "valid";
    }

    setFormErrors(next);
    setFieldStatuses(newStatuses);
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

      // Show success state before redirecting
      setShowSuccess(true);

      redirectTimeoutRef.current = setTimeout(() => {
        router.push("/payment");
      }, 4000);
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

  // Helper to determine input class based on field status
  const getInputClasses = (fieldName: keyof FieldStatuses) => {
    const baseClasses = "w-full px-4 py-3 border rounded-lg text-base focus:outline-none transition-all duration-300";

    switch (fieldStatuses[fieldName]) {
      case "valid":
        return `${baseClasses} border-[#10B981] bg-[#10B981]/10 focus:ring-2 focus:ring-[#10B981]/30 placeholder:text-[#6B7280]/60 transform hover:scale-[1.01] hover:shadow-md shadow-sm shadow-emerald-100 animate-fadeIn`;
      case "invalid":
        return `${baseClasses} border-[#EF4444] bg-[#EF4444]/5 focus:ring-2 focus:ring-[#EF4444]/30 placeholder:text-[#6B7280]/60 animate-wiggle shadow-sm shadow-red-100`;
      default:
        return `${baseClasses} border-[#E5E7EB] bg-white/80 focus:ring-2 focus:ring-[#4338CA]/30 hover:border-[#4338CA]/50 placeholder:text-[#6B7280]/60 hover:shadow-md shadow-sm shadow-indigo-50 transform hover:translate-y-[-2px]`;
    }
  };

  // 6) UI
  if (isLoading) {
    return (
      <div className="max-w-[420px] mx-auto p-6 bg-white/90 backdrop-blur-sm rounded-lg shadow-[0_4px_15px_rgba(109,40,217,0.2)] text-center border border-primary-light/30">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">Warming things up…</p>
        <div className="absolute -z-10 blur-3xl opacity-30 bg-indigo-200 w-32 h-32 rounded-full -top-10 -right-10"></div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="max-w-[420px] mx-auto p-6 sm:p-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-[0_8px_25px_rgba(109,40,217,0.25)] text-center bg-primary-light/20 border-2 border-[#6D28D9]/30 transform transition-all duration-500 animate-fadeIn relative overflow-hidden">
        {/* Quirky background elements */}
        <div className="absolute -right-12 -top-12 w-24 h-24 bg-purple-100 rounded-full opacity-40 blur-xl"></div>
        <div className="absolute -left-8 -bottom-10 w-20 h-20 bg-blue-100 rounded-full opacity-30 blur-lg"></div>
        {/* Success confetti effect - mobile optimized */}
        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
          <div className="absolute -left-4 top-0 w-2 h-6 sm:h-8 bg-[#FFD700] rounded-full animate-subtle-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="absolute left-1/4 -top-2 w-2 sm:w-3 h-2 sm:h-3 bg-[#FF6B6B] rounded-full animate-subtle-bounce" style={{ animationDelay: '0.3s' }}></div>
          <div className="absolute left-1/2 -top-4 w-3 sm:w-4 h-3 sm:h-4 bg-[#6D28D9] rounded-full animate-subtle-bounce" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute left-3/4 -top-1 w-2 h-5 sm:h-6 bg-[#10B981] rounded-full animate-subtle-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute -right-2 top-0 w-2 sm:w-3 h-4 sm:h-5 bg-[#FF9F1C] rounded-full animate-subtle-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>

        <div className="mb-4 text-success animate-subtle-bounce relative">
          <div className="absolute inset-0 rounded-full bg-[#10B981]/20 animate-pulse"></div>
          <svg
            className="h-16 w-16 sm:h-20 sm:w-20 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-primary-dark">Woohoo! You're all set! ✨</h2>
        <p className="mb-6 text-muted-foreground">
          We’ve saved your preferences and you’re ready to start.
          To join the pilot group, activate your plan ($10/month). This helps us keep the service running while we grow together.
        </p>
        <div className="relative">
          <div className="h-3 bg-[#E4E4FE] rounded-full overflow-hidden">
            <div className="h-full bg-[#6D28D9] rounded-full w-4/5 animate-pulse"></div>
          </div>
          <div className="absolute right-[20%] -top-1 transform -translate-y-full">
            <span className="inline-block animate-wave text-xl">🚀</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <OnboardingErrorBoundary>
      <div className="pt-24 pb-12 px-4 bg-gradient-to-b from-primary-light/10 via-white/40 to-primary-light/15">
        <div className="max-w-[420px] mx-auto p-4 sm:p-6 bg-white/90 backdrop-blur-sm rounded-lg shadow-[0_4px_20px_rgba(109,40,217,0.15)] border border-primary-light/30 transform transition-all duration-300 hover:shadow-xl relative overflow-hidden">
          {/* Quirky background elements */}
          <div className="absolute -right-12 -top-12 w-24 h-24 bg-purple-100 rounded-full opacity-40 blur-xl"></div>
          <div className="absolute -left-8 -bottom-10 w-20 h-20 bg-blue-100 rounded-full opacity-30 blur-lg"></div>
          <div className="absolute right-1/4 bottom-0 w-2 h-16 bg-purple-200 opacity-20 rotate-12 rounded-full"></div>
          {/* Progress indicators - Journey theme - Mobile friendly */}
          <div className="flex justify-center items-center mb-6 relative px-2">
            <div className="absolute w-full h-1 bg-[#E5E7EB]/40 rounded-full"></div>
            {[0, 1, 2].map((step) => {
              const isCompleted = progressCount > step;
              const isActive = progressCount === step;

              return (
                <div key={step} className="relative flex flex-col items-center z-10 mx-2 sm:mx-4">
                  <div
                    className={`
                      w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-500
                      ${isCompleted
                        ? "bg-[#10B981] text-white shadow-md scale-110"
                        : isActive
                          ? "bg-[#6D28D9] text-white animate-pulse border-2 border-[#6D28D9]/50"
                          : "bg-white border-2 border-[#E5E7EB]"
                      }
                    `}
                  >
                    {isCompleted ? (
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.3334 4L6.00002 11.3333L2.66669 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <span className="text-xs font-medium">{step + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs mt-1 ${isCompleted || isActive ? "text-[#6D28D9]" : "text-[#6B7280]"}`}>
                    {step === 0 ? "Start" : step === 1 ? "Magic" : "Ready!"}
                  </span>
                </div>
              );
            })}
          </div>

          <h2 className="text-2xl font-bold mb-2 text-[#1E1B4B] relative z-10">Hey there, new friend! <span className="inline-block animate-bounce">✨</span></h2>
          <p className="mb-6 text-[#6B7280] relative z-10">
            Just a sprinkle of info and we'll be off on our adventure together!
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-foreground flex items-center flex-wrap">
                  <span>What should we call you?</span>
                  <span className="ml-1 text-[#6D28D9] animate-pulse">✎</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClasses("name")}
                    placeholder="Sir Typeington III"
                    aria-invalid={fieldStatuses.name === "invalid"}
                    aria-describedby={formErrors.name ? "name-error" : undefined}
                  />
                  {fieldStatuses.name === "valid" && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#10B981]">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M13.3334 4L6.00002 11.3333L2.66669 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
                {formErrors.name && (
                  <p id="name-error" className="text-sm text-[#EF4444]" aria-live="polite">{formErrors.name}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-foreground flex items-center flex-wrap">
                  <span>What number should we use to call you</span>
                  <span className="ml-1 text-[#6D28D9]">📱</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    autoComplete="tel"
                    inputMode="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClasses("phone")}
                    placeholder="+1 (555) WIZARDS"
                    aria-invalid={fieldStatuses.phone === "invalid"}
                    aria-describedby={formErrors.phone ? "phone-error" : "phone-help"}
                  />
                  {fieldStatuses.phone === "valid" && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#10B981]">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M13.3334 4L6.00002 11.3333L2.66669 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
                {formErrors.phone ? (
                  <p id="phone-error" className="text-sm text-[#EF4444]" aria-live="polite">{formErrors.phone}</p>
                ) : (
                  <p id="phone-help" className="text-xs text-[#6B7280]">Don't worry! We're not phone spammers. Promise on our pet unicorn. 🦄</p>
                )}
              </div>

              {/* Call Time */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="callTime" className="block text-sm font-medium text-foreground flex items-center flex-wrap">
                    <span>When's your magic hour?</span>
                    <span className="ml-1 text-[#6D28D9]">⏰</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="time"
                    id="callTime"
                    name="callTime"
                    value={formData.callTime}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClasses("callTime")}
                    aria-invalid={fieldStatuses.callTime === "invalid"}
                    aria-describedby={formErrors.callTime ? "time-error" : "time-help"}
                  />
                  {fieldStatuses.callTime === "valid" && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#10B981]">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M13.3334 4L6.00002 11.3333L2.66669 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
                {formErrors.callTime ? (
                  <p id="time-error" className="text-sm text-[#EF4444]" aria-live="polite">{formErrors.callTime}</p>
                ) : (
                  <p id="time-help" className="text-xs text-[#6B7280]">
                    {showHourEasterEgg ?
                      <span className="text-[#8B5CF6] font-medium">Ooh, right on the hour! You're a punctual wizard! ✨</span> :
                      "When Future-You will be sipping tea and ready for a chat."}
                  </p>
                )}
              </div>

              {/* Checkbox options */}
              <div className="space-y-3 pt-2 bg-gradient-to-br from-[#E4E4FE]/20 to-[#F9F9FF] p-3 sm:p-4 rounded-lg border border-[#E4E4FE]/50 transition-all duration-300 hover:bg-[#E4E4FE]/30 shadow-sm hover:shadow-md">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="wantsClarityCalls"
                    name="wantsClarityCalls"
                    checked={formData.wantsClarityCalls}
                    onChange={handleChange}
                    className="h-5 w-5 mt-0.5 text-[#6D28D9] focus:ring-[#6D28D9] rounded"
                  />
                  <span className="text-sm text-foreground">
                    Daily Kick off calls? Yes, please! ☕
                  </span>
                </label>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="wantsCallReminders"
                    name="wantsCallReminders"
                    checked={formData.wantsCallReminders}
                    onChange={handleChange}
                    className="h-5 w-5 mt-0.5 text-[#6D28D9] focus:ring-[#6D28D9] rounded"
                  />
                  <span className="text-sm text-foreground">
                    Gentle Check-in call, only if you want it! 🤗
                  </span>
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="w-full bg-[#4338CA] text-[#FFFFFF] py-3 px-4 rounded-lg hover:bg-[#3730A3] transition-all duration-300
                           disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:ring-offset-2
                           mt-6 text-base font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1
                           relative overflow-hidden group"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sprinkling magic dust...
                  </span>
                ) : (
                  "All aboard the awesome train! 🚂"
                )}
              </button>

              {/* Help link */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  className="text-sm text-[#6B7280] hover:text-[#6D28D9] focus:outline-none focus:underline transition-all duration-300 transform hover:scale-110 inline-flex items-center flex-wrap justify-center shadow-sm hover:shadow-md px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm"
                >
                  <span className="mr-1">Feeling stuck? send us an email at support@tryalara.stream !</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </OnboardingErrorBoundary>
  );
}
