import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { io, Socket } from "socket.io-client";

type EmergencyType = "MEDICAL" | "SECURITY" | "FIRE" | "OTHER";

export function SosAlert() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [emergencyType, setEmergencyType] = useState<EmergencyType>("MEDICAL");
  const [message, setMessage] = useState("");
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  useEffect(() => {
    // Connect to Socket.IO server
    const socketUrl = (import.meta.env.VITE_SOCKET_URL as string | undefined) || "http://localhost:3001";
    const socket = io(socketUrl);
    setSocket(socket);

    // Listen for acknowledgment
    socket.on(`sos-acknowledged-${user?.id}`, (data) => {
      setIsAcknowledged(true);
      toast({
        title: "SOS Alert Acknowledged",
        description: `Your alert has been acknowledged by ${data.acknowledgedBy.name}`,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id]);

  const sendSosMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/sos", {
        emergencyType,
        message,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "SOS Alert Sent",
        description: "Emergency services have been notified. Help is on the way.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send Alert",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSendSos = () => {
    if (!message) {
      toast({
        title: "Message Required",
        description: "Please provide details about your emergency",
        variant: "destructive",
      });
      return;
    }
    sendSosMutation.mutate();
  };

  return (
    <Card className="border-red-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-500">
          <AlertTriangle className="h-5 w-5" />
          Emergency SOS Alert
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Emergency Type</Label>
            <RadioGroup
              value={emergencyType}
              onValueChange={(value) => setEmergencyType(value as EmergencyType)}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MEDICAL" id="medical" />
                <Label htmlFor="medical">Medical</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="SECURITY" id="security" />
                <Label htmlFor="security">Security</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="FIRE" id="fire" />
                <Label htmlFor="fire">Fire</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="OTHER" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Emergency Details</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your emergency situation..."
              className="h-24"
            />
          </div>

          <Button
            onClick={handleSendSos}
            disabled={sendSosMutation.isPending || isAcknowledged}
            variant="destructive"
            className="w-full"
          >
            {sendSosMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Send SOS Alert"
            )}
          </Button>

          {isAcknowledged && (
            <p className="text-sm text-green-600 text-center">
              Your alert has been acknowledged. Help is on the way.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 