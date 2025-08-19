"use client"

import { useState } from 'react';
import { cn } from '@/lib/utils';

// Policy Section component with toggle functionality
const PolicySection = ({ title, content }: { title: string; content: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full py-5 text-left"
      >
        <h3 className="text-lg font-medium text-foreground">{title}</h3>
        <span className="ml-2 flex-shrink-0">
          <svg
            className={cn("w-5 h-5 transition-transform duration-200", {
              "transform rotate-180": isOpen,
            })}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </button>
      <div
        className={cn("overflow-hidden transition-all duration-300", {
          "max-h-0 opacity-0": !isOpen,
          "max-h-[1000px] opacity-100 pb-5": isOpen,
        })}
      >
        <div className="text-muted-foreground space-y-4">{content}</div>
      </div>
    </div>
  );
};

export default function PolicyPage() {
  return (
    <div className="font-sans items-center justify-items-center">
      <main className="flex flex-col">
        <section className="w-full overflow-hidden flex flex-col items-center justify-center bg-[hsl(var(--background))] px-4 sm:px-6 pt-24 pb-16 sm:pt-32 sm:pb-24">
          <div className="w-full max-w-3xl mx-auto text-center">
            <div className="mb-12 sm:mb-16 fade-in">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6 sm:mb-8 leading-[1.2] sm:leading-[1.1]">
                Policies
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-xl mx-auto leading-relaxed">
                Our commitment to transparency, privacy, and fair terms.
              </p>
            </div>
          </div>

          <div className="w-full max-w-3xl mx-auto">
            <div className="bg-card rounded-xl shadow-sm p-6 sm:p-8">
              <PolicySection
                title="Privacy Policy"
                content={
                  <>
                    <p>We only collect what's needed to make the service work: your profile (name, email, phone if provided), your calls and transcripts, and the tasks you create.</p>
                    <p>Your data is stored securely. We do not sell it. We do not share it with advertisers.</p>
                    <p>We use your data only to provide the service and to improve features.</p>
                    <p>You can request deletion or export of your data anytime — just email us.</p>
                    <p>AI processing is limited to powering the product. We do not send your data to train external models.</p>
                  </>
                }
              />

              <PolicySection
                title="Terms of Service"
                content={
                  <>
                    <p>This is a pilot service designed to help you stay on track with your goals. It is not medical, legal, or therapeutic advice.</p>
                    <p>By using the service, you agree to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Use it respectfully.</li>
                      <li>Provide accurate information when asked.</li>
                      <li>Accept that the service may change or pause during the pilot.</li>
                    </ul>
                    <p className="mt-4"><strong>Payments & Refunds:</strong> The pilot costs $10 for one month. If you're not satisfied, we will refund you in full.</p>
                    <p><strong>Ownership:</strong> You own your content. We own the brand, design, and service code.</p>
                  </>
                }
              />

              <PolicySection
                title="Refund Policy"
                content={
                  <>
                    <p>During the pilot, every user is entitled to a full refund of the $10 within their first month, no questions asked.</p>
                    <p>To request a refund, just contact us via email or Discord. We will process it as quickly as possible.</p>
                    <p>Future refund rules may change, but we will always keep them simple and fair.</p>
                  </>
                }
              />

              <PolicySection
                title="Support & Feedback"
                content={
                  <>
                    <p>We support you via email and Discord. We usually reply within an hour during active hours.</p>
                    <p>We welcome feedback, suggestions, and ideas. If you get stuck, reach out.</p>
                    <p>We regularly review user feedback, and if multiple people raise the same issue, we prioritize fixing it.</p>
                    <p>We see early users as partners in shaping the product.</p>
                  </>
                }
              />
            </div>
          </div>

          <div className="w-full max-w-xl mx-auto mt-12 py-5 opacity-90 fade-in">
            <div className="relative flex flex-col items-center">
              <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--primary-light)/0.1)] to-transparent rounded-3xl"></div>
              <div className="relative z-10 p-8 text-center">
                <p className="text-lg sm:text-xl italic text-foreground/80 mb-6">
                  "We believe in transparency and fairness in everything we do."
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}