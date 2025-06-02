import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Phone, Mail, Clock, InfoIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SOSModal({ isOpen, onClose }: SOSModalProps) {
  const [emergencyType, setEmergencyType] = useState("");
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const sendSOSMutation = useMutation({
    mutationFn: async (data: { emergencyType: string; message?: string }) => {
      const response = await apiRequest("POST", "/api/sos", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "SOS Alert Sent",
        description: "Emergency contacts have been notified immediately.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sos"] });
      onClose();
      setEmergencyType("");
      setMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send SOS Alert",
        description: error.message || "Please try again or contact emergency services directly.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyType) {
      toast({
        title: "Emergency Type Required",
        description: "Please select the type of emergency.",
        variant: "destructive",
      });
      return;
    }
    
    sendSOSMutation.mutate({
      emergencyType,
      message: message.trim() || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="bg-red-600 text-white p-6 -m-6 mb-6 rounded-t-lg">
          <DialogTitle className="flex items-center text-xl">
            <AlertTriangle className="h-6 w-6 mr-3" />
            Emergency SOS Alert
          </DialogTitle>
          <p className="text-red-100">This will notify emergency contacts</p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="emergency_type">Emergency Type</Label>
            <Select value={emergencyType} onValueChange={setEmergencyType}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select emergency type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medical">Medical Emergency</SelectItem>
                <SelectItem value="security">Security Threat</SelectItem>
                <SelectItem value="accident">Accident</SelectItem>
                <SelectItem value="family">Family Emergency</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="emergency_message">Brief Message (Optional)</Label>
            <Textarea
              id="emergency_message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="mt-1"
              placeholder="Additional details..."
            />
          </div>
          
          <Alert className="bg-yellow-50 border-yellow-200">
            <InfoIcon className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <p className="font-medium mb-2">Emergency contacts will be notified:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Unit Command Center</li>
                <li>Emergency Response Team</li>
                <li>Registered family contacts</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <div className="flex space-x-3">
            <Button 
              type="submit" 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={sendSOSMutation.isPending}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              {sendSOSMutation.isPending ? "Sending..." : "Send SOS Alert"}
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              className="flex-1" 
              onClick={onClose}
              disabled={sendSOSMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
