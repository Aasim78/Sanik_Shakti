import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { SosMonitor } from "@/components/admin/sos-monitor";
import { SchemeManager } from "@/components/admin/scheme-manager";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user || user.role !== "admin") {
    setLocation("/login");
    return null;
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <SosMonitor />
          <SchemeManager />
        </div>
      </div>
    </div>
  );
} 