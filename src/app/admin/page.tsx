import AdminNextCallCard from "@/components/admin/AdminNextCallCard";

// Admin page for managing user calls
export default function AdminPage() {
  return (
    <div>
      <h1>Admin - Manage User Calls</h1>
      {/* Add components for managing user calls here */}
      <AdminNextCallCard
        defaultEmail="user@example.com"
        initialUtc="2025-08-26T18:30:00Z"
      />
    </div>
  );
}