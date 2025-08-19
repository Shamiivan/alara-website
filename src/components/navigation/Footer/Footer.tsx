import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left side - Brand/Identity */}
          <div className="flex flex-col space-y-2">
            <div className="text-lg font-semibold">Alara</div>
            <p className="text-sm text-muted-foreground">Conversations, not lists.</p>
          </div>

          {/* Center - Navigation */}
          <div className="flex flex-col space-y-4">
            <nav className="flex flex-col space-y-2">
              <Link
                href="/how-it-works"
                className="text-sm hover:text-primary transition-colors"
              >
                How it Works
              </Link>
              <Link
                href="/faq"
                className="text-sm hover:text-primary transition-colors"
              >
                FAQ
              </Link>
              <Link
                href="/pilot"
                className="text-sm hover:text-primary transition-colors"
              >
                Join the Pilot
              </Link>
              <Link
                href="/policy"
                className="text-sm hover:text-primary transition-colors"
              >
                Privacy
              </Link>
            </nav>
          </div>

          {/* Right side - Social/Updates */}
          <div className="flex flex-col space-y-2">
            <p className="text-sm text-muted-foreground">Follow along as we build:</p>
            <Link
              href="https://alara.ai"
              className="text-sm hover:text-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Alara
            </Link>
          </div>
        </div>

        {/* Bottom bar - Copyright */}
        <div className="mt-8 pt-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Alara. Built with care.
          </p>
        </div>
      </div>
    </footer>
  );
}