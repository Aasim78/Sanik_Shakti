import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { io, Socket } from "socket.io-client";

interface SosAlert {
  id: number;
  userId: number;
  emergencyType: string;
  message: string;
  sentAt: string;
  acknowledgedAt: string | null;
  acknowledgedBy: number | null;
  user?: {
    name: string;
    email: string;
    serviceNumber: string;
  };
}

export function SosMonitor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (user?.role !== "admin") return;

    // Connect to Socket.IO server
    const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001");
    setSocket(socket);

    // Join admin room
    socket.emit("join-admin", localStorage.getItem("token"));

    // Listen for new SOS alerts
    socket.on("sos-alert", (alert: SosAlert) => {
      toast({
        title: "New SOS Alert!",
        description: `Emergency alert from ${alert.user?.name}: ${alert.emergencyType}`,
        variant: "destructive",
      });
      // Refresh alerts list
      alertsQuery.refetch();
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.role]);

  const alertsQuery = useQuery({
    queryKey: ["sos-alerts"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/sos");
      return response.json() as Promise<SosAlert[]>;
    },
    enabled: user?.role === "admin",
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: number) => {
      const response = await apiRequest("PATCH", `/api/sos/${alertId}/acknowledge`);
      return response.json();
    },
    onSuccess: () => {
      alertsQuery.refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Acknowledge",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  if (user?.role !== "admin") {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            SOS Alert Monitor
          </div>
          {alertsQuery.isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => alertsQuery.refetch()}
            >
              Refresh
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {alertsQuery.data?.map((alert) => (
              <Card key={alert.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{alert.user?.name}</h4>
                      <Badge variant={alert.acknowledgedAt ? "outline" : "destructive"}>
                        {alert.emergencyType}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      Service Number: {alert.user?.serviceNumber}
                    </p>
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-gray-500">
                      Sent: {new Date(alert.sentAt).toLocaleString()}
                    </p>
                  </div>
                  {alert.acknowledgedAt ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => acknowledgeMutation.mutate(alert.id)}
                      disabled={acknowledgeMutation.isPending}
                    >
                      {acknowledgeMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Acknowledge"
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            ))}

            {alertsQuery.data?.length === 0 && (
              <p className="text-center text-gray-500">No active SOS alerts</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 