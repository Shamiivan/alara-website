"use client"

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
  return (
    <div className="font-sans items-center justify-items-center">
      <main className="flex flex-col">
        <section className="w-full overflow-hidden flex flex-col items-center justify-center bg-gradient-to-b from-[hsl(var(--background))] to-[hsl(var(--primary-light)/0.1)] px-4 sm:px-6 pt-24 pb-16 sm:pt-32 sm:pb-24">
          <div className="w-full max-w-3xl mx-auto text-center">
            <div className="mb-12 sm:mb-16 fade-in">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6 sm:mb-8 leading-[1.2] sm:leading-[1.1]">
                Start your month of clarity.
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-xl mx-auto leading-relaxed">
                Clarity for less than the price of two coffees.
              </p>
            </div>
          </div>

          <div className="w-full max-w-md mx-auto fade-in">
            <Card className="border border-[hsl(var(--primary-light)/0.5)] shadow-lg bg-gradient-to-b from-card to-[hsl(var(--primary-light)/0.1)] backdrop-blur-sm overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(var(--secondary)/0.1)] rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[hsl(var(--accent)/0.1)] rounded-full -ml-16 -mb-16 blur-2xl"></div>

              <div className="absolute top-6 right-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[hsl(var(--primary))]">
                  <path d="M12 2L14.4 8.09L21 9.4L16.5 14.01L17.6 20.6L12 17.5L6.4 20.6L7.5 14.01L3 9.4L9.6 8.09L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <CardHeader className="text-center pt-8 pb-4 relative z-10">
                <div className="flex flex-col items-center justify-center">
                  <div className="text-4xl sm:text-5xl font-bold text-foreground mb-2 relative">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]">$10</span>
                    <span className="text-xl text-muted-foreground font-medium">/ 1 month</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-center px-8 relative z-10">
                <p className="text-foreground/90 mb-6">
                  One month to find your flow. Cancel anytime.
                </p>
                <p className="text-sm text-muted-foreground mb-8">
                  Try it. If it's not for you, we'll refund you.
                </p>
                <Button size="lg" className="w-full mb-4 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] hover:opacity-90 transition-all duration-300 shadow-md">
                  Start 1-Month Trial
                </Button>
              </CardContent>
              <CardFooter className="flex justify-center pb-8 relative z-10">
                <Link href="/faq" className="text-sm text-primary hover:underline flex items-center gap-1">
                  <span>Questions? Read the FAQ</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </CardFooter>
            </Card>
          </div>

          <div className="w-full max-w-xl mx-auto mt-12 py-5 opacity-90 fade-in">
            <div className="relative flex flex-col items-center">
              <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--primary-light)/0.2)] to-transparent rounded-3xl"></div>
              <div className="relative z-10 p-8 text-center">
                <div className="flex justify-center mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[hsl(var(--accent))]">
                    <path d="M12 2L14.4 8.09L21 9.4L16.5 14.01L17.6 20.6L12 17.5L6.4 20.6L7.5 14.01L3 9.4L9.6 8.09L12 2Z" fill="currentColor" />
                  </svg>
                </div>
                <p className="text-lg sm:text-xl italic text-foreground/80 mb-6">
                  "Join us on a journey to clarity and focused productivity."
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}