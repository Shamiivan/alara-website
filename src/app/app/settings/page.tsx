"use client";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[#0F172A]">Settings</h1>
        <p className="text-[#475569]">Manage your account preferences</p>
      </div>

      <div className="p-6 rounded-[12px] border border-[#E2E8F0] bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Account Settings</h2>
        <p className="text-[#475569]">
          This is the settings page of your Alara application. The sidebar navigation
          will highlight this section when you&apos;re here.
        </p>
      </div>
    </div>
  );
}