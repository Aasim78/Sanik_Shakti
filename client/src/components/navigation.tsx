import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Home, Bell, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";

export function Navigation() {
  const { user, logout, isAuthenticated } = useAuth();
  const [location] = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Shield className="text-army-green-600 h-8 w-8 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-army-green-600">Sainik Saathi</h1>
                <p className="text-xs text-gray-500">Simplifying Welfare for Armed Forces</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">
                  Welcome, <span className="font-medium">{user?.fullName}</span>
                </span>
                <Badge variant="secondary" className="bg-army-green-100 text-army-green-800">
                  <Shield className="h-3 w-3 mr-1" />
                  {user?.role}
                </Badge>
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/">
                  <Button 
                    variant={location === "/" ? "default" : "ghost"} 
                    size="sm"
                    className={location === "/" ? "bg-army-green-600 hover:bg-army-green-700" : ""}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </Link>
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-army-green-600 hover:text-army-green-700 hover:bg-army-green-50"
                  >
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
