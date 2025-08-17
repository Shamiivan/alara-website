"use client";

import Link from 'next/link';
import { cn } from '../utils';

interface NavbarBrandProps {
  logo?: React.ReactNode;
  className?: string;
}

export const NavbarBrand: React.FC<NavbarBrandProps> = ({ logo, className }) => {
  return (
    <Link href="/" className={cn('flex items-center gap-2', className)}>
      {logo || (
        <div className="flex items-center">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 bg-primary/10 rounded-full"></div>
            <div className="absolute inset-2 bg-primary/20 rounded-full"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="w-4 h-4 text-primary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
          </div>
          <span className="ml-2 text-xl font-bold text-foreground">Alara</span>
        </div>
      )}
    </Link>
  );
};

export default NavbarBrand;