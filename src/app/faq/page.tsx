"use client"

import { useState } from 'react';
import { cn } from '@/lib/utils';

// FAQ Item component with toggle functionality
const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full py-5 text-left"
      >
        <h3 className="text-lg font-medium text-foreground">{question}</h3>
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
          "max-h-96 opacity-100 pb-5": isOpen,
        })}
      >
        <p className="text-muted-foreground">{answer}</p>
      </div>
    </div>
  );
};

export default function FAQPage() {
  // FAQ data
  const faqs = [
    {
      question: "Do I need to pay to try it?",
      answer: "Yes — it's $10 for one month. After that, we'll decide the future of the product together with early users. If you don't like it, you'll get a full refund, no questions asked."
    },
    {
      question: "Who can join as a pilot user?",
      answer: "Anyone who believes in the vision. We're looking for people who not only want to try it out but also share ideas for making it better. If you see potential, consider giving it a shot."
    },
    {
      question: "How do I give feedback or suggest improvements?",
      answer: "You can reach us through Discord, email, or even short interviews if you're open to it. We really value early user input."
    },
    {
      question: "What if I get stuck—do you offer support?",
      answer: "Yes — you can reach us on Discord or by email. Typical response time is about 1 hour."
    },
    {
      question: "How do you handle my data and privacy?",
      answer: "Your conversations and tasks are yours. We never sell your data. Everything is stored securely, and you can request deletion at any time."
    },
    {
      question: "Do I need to set up complicated projects or tags?",
      answer: "Nope. That's exactly what we're avoiding. The app is designed to reduce setup work, not add more."
    },
    {
      question: "How does the daily check-in work?",
      answer: "There are two types of calls:\n\nPlanning calls (usually in the morning): A quick unload of what's on your mind, turned into one clear step and a couple of support actions.\n\nCheck-in calls (midday or evening): Gentle reminders or reviews to see how things went and help you adjust."
    },
    {
      question: "How do you track progress?",
      answer: "We don't count endless tasks. Instead, we track starts, completions, and streaks. It's about steady momentum, not guilt. Evening reviews will also help reflect and celebrate wins."
    },
    {
      question: "Can I adjust my plan mid-day if things change?",
      answer: "Yes — that's the whole point. If life shifts, you can shrink, move, or re-plan your step in minutes."
    }
  ];

  return (
    <div className="font-sans items-center justify-items-center">
      <main className="flex flex-col">
        <section className="w-full overflow-hidden flex flex-col items-center justify-center bg-[hsl(var(--background))] px-4 sm:px-6 pt-24 pb-16 sm:pt-32 sm:pb-24">
          <div className="w-full max-w-3xl mx-auto text-center">
            <div className="mb-12 sm:mb-16 fade-in">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6 sm:mb-8 leading-[1.2] sm:leading-[1.1]">
                Frequently Asked Questions
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-xl mx-auto leading-relaxed">
                Find answers to common questions about Alara and how it can help you find clarity in your productivity.
              </p>
            </div>
          </div>

          <div className="w-full max-w-3xl mx-auto">
            <div className="bg-card rounded-xl shadow-sm p-6 sm:p-8">
              {faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>

          <div className="w-full max-w-xl mx-auto mt-12 py-5 opacity-90 fade-in">
            <div className="relative flex flex-col items-center">
              <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--primary-light)/0.1)] to-transparent rounded-3xl"></div>
              <div className="relative z-10 p-8 text-center">
                <p className="text-lg sm:text-xl italic text-foreground/80 mb-6">
                  "Still have questions? Contact our support team and we'll be happy to help."
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}