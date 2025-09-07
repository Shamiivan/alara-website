"use client"
import SettingCard from '@/components/settings/SettingCard';
import ClarityCallsSettingsCard from '@/components/settings/ClarityCallsSettingsCard';
import React from 'react';


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