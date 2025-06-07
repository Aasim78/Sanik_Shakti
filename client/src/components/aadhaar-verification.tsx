import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function AadhaarVerification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [verificationType, setVerificationType] = useState<"OTP" | "BIOMETRIC">("OTP");
  const [otp, setOtp] = useState("");
  const [txnId, setTxnId] = useState("");
  const [step, setStep] = useState<"INITIAL" | "OTP" | "BIOMETRIC" | "COMPLETE">("INITIAL");

  const initiateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/aadhaar/initiate", {
        aadhaarNumber,
        verificationType,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setTxnId(data.txnId);
      if (verificationType === "OTP") {
        setStep("OTP");
        toast({
          title: "OTP Sent",
          description: "Please check your Aadhaar-linked mobile number for OTP.",
        });
      } else {
        setStep("BIOMETRIC");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to initiate verification",
        variant: "destructive",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/aadhaar/verify-otp", {
        aadhaarNumber,
        otp,
        txnId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.verified) {
        setStep("COMPLETE");
        toast({
          title: "Verification Successful",
          description: "Your Aadhaar has been successfully verified.",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: data.error || "Invalid OTP",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify OTP",
        variant: "destructive",
      });
    },
  });

  const verifyBiometricMutation = useMutation({
    mutationFn: async (biometricData: string) => {
      const response = await apiRequest("POST", "/api/aadhaar/verify-biometric", {
        aadhaarNumber,
        biometricData,
        txnId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.verified) {
        setStep("COMPLETE");
        toast({
          title: "Verification Successful",
          description: "Your Aadhaar has been successfully verified using biometrics.",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: data.error || "Biometric verification failed",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify biometrics",
        variant: "destructive",
      });
    },
  });

  const handleInitiate = () => {
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      toast({
        title: "Invalid Aadhaar",
        description: "Please enter a valid 12-digit Aadhaar number",
        variant: "destructive",
      });
      return;
    }
    initiateMutation.mutate();
  };

  const handleVerifyOtp = () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }
    verifyOtpMutation.mutate();
  };

  const handleCaptureBiometric = async () => {
    try {
      // This is a placeholder for actual biometric capture
      // In a real implementation, this would interface with a biometric device
      const biometricData = await window.navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: "Sainik Saathi" },
          user: {
            id: new Uint8Array(16),
            name: user?.email || "",
            displayName: user?.name || "",
          },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          timeout: 60000,
          attestation: "direct",
        },
      });

      if (biometricData) {
        verifyBiometricMutation.mutate(JSON.stringify(biometricData));
      }
    } catch (error) {
      toast({
        title: "Biometric Capture Failed",
        description: "Failed to capture biometric data. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (step === "COMPLETE") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aadhaar Verification Complete</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-600">Your Aadhaar has been successfully verified.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aadhaar Verification</CardTitle>
      </CardHeader>
      <CardContent>
        {step === "INITIAL" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aadhaar">Aadhaar Number</Label>
              <Input
                id="aadhaar"
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ""))}
                maxLength={12}
                placeholder="Enter 12-digit Aadhaar number"
              />
            </div>
            <div className="space-y-2">
              <Label>Verification Method</Label>
              <RadioGroup
                value={verificationType}
                onValueChange={(value) => setVerificationType(value as "OTP" | "BIOMETRIC")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="OTP" id="otp" />
                  <Label htmlFor="otp">OTP</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="BIOMETRIC" id="biometric" />
                  <Label htmlFor="biometric">Biometric</Label>
                </div>
              </RadioGroup>
            </div>
            <Button
              onClick={handleInitiate}
              disabled={initiateMutation.isPending}
              className="w-full"
            >
              {initiateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Start Verification
            </Button>
          </div>
        )}

        {step === "OTP" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
                placeholder="Enter 6-digit OTP"
              />
            </div>
            <Button
              onClick={handleVerifyOtp}
              disabled={verifyOtpMutation.isPending}
              className="w-full"
            >
              {verifyOtpMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Verify OTP
            </Button>
          </div>
        )}

        {step === "BIOMETRIC" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Please place your finger on the biometric scanner when ready.
            </p>
            <Button
              onClick={handleCaptureBiometric}
              disabled={verifyBiometricMutation.isPending}
              className="w-full"
            >
              {verifyBiometricMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Capture Biometric
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 