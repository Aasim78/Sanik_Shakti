import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AadhaarVerification } from "@/components/aadhaar-verification";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";

export default function Register() {
  const [, setLocation] = useLocation();
  const { register } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<"DETAILS" | "AADHAAR">("DETAILS");
  const [formData, setFormData] = useState({
    name: "",
      email: "",
      password: "",
    serviceNumber: "",
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      return register(formData);
    },
    onSuccess: () => {
      setStep("AADHAAR");
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate();
  };

  if (step === "AADHAAR") {
    return <AadhaarVerification />;
  }

  return (
    <div className="container max-w-lg mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Register for Sainik Saathi</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
                <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              </div>
            <div className="space-y-2">
              <Label htmlFor="serviceNumber">Service Number</Label>
                <Input
                id="serviceNumber"
                value={formData.serviceNumber}
                onChange={(e) => setFormData({ ...formData, serviceNumber: e.target.value })}
                required
              />
              </div>
              <Button 
                type="submit" 
              className="w-full"
              disabled={registerMutation.isPending}
              >
              {registerMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Continue to Verification
              </Button>
            </form>
          </CardContent>
        </Card>
    </div>
  );
}
