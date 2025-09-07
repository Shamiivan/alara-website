"use client"
import SettingCard from '@/components/settings/SettingCard';
import ClarityCallsSettingsCard from '@/components/settings/ClarityCallsSettingsCard';
import React from 'react';

// This would be imported from a separate file
const ProfileSettingsCard = () => {
  return (
    <div className="p-6 rounded-[12px] border border-[#E2E8F0] bg-white shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-[#F1F5F9] rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-[#0F172A] mb-2">
            Profile
          </h2>
          <p className="text-[#64748B] mb-4">
            Manage your personal information and account details
          </p>

          {/* Placeholder for profile settings components */}
          <div className="text-sm text-[#94A3B8] italic">
            Profile settings will be added here
          </div>
        </div>
      </div>
    </div>
  );
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[#0F172A]">Settings</h1>
        <p className="text-[#64748B]">Manage your account and application preferences</p>
      </div>

      {/* Profile Section */}
      < SettingCard />
      <ClarityCallsSettingsCard />

    </div>
  );
}