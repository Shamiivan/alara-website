"use client"
import React from 'react';
import { useSettingsData } from '@/hooks/useSettingsData';
import { SettingsView } from '@/components/settings/SettingsView';

export default function SettingsPage() {
  const settingsData = useSettingsData();

  return <SettingsView {...settingsData} />;
}