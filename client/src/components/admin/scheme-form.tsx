import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Scheme {
  id: number;
  title: string;
  description: string;
  category: string;
  amount: number;
  eligibility: string;
  deadline: string;
  processingTime: string;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  maxBeneficiaries: number | null;
  currentBeneficiaries: number;
  documents: string[];
  applicationProcess: string;
  benefits: string;
  fundingSource: string | null;
  contactPerson: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  tags: string[];
  status: string;
}

interface SchemeFormProps {
  scheme?: Scheme;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SchemeForm({ scheme, isOpen, onClose, onSuccess }: SchemeFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Scheme>>(
    scheme || {
      title: "",
      description: "",
      category: "education",
      amount: 0,
      eligibility: "",
      deadline: "",
      processingTime: "",
      startDate: new Date().toISOString().split("T")[0],
      applicationProcess: "",
      benefits: "",
      status: "UPCOMING",
      tags: [],
    }
  );

  const mutation = useMutation({
    mutationFn: async (data: Partial<Scheme>) => {
      const response = await apiRequest(
        scheme ? "PATCH" : "POST",
        scheme ? `/api/schemes/${scheme.id}` : "/api/schemes",
        data
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: scheme ? "Scheme Updated" : "Scheme Created",
        description: scheme
          ? "The scheme has been updated successfully."
          : "The new scheme has been created successfully.",
      });
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: scheme ? "Update Failed" : "Creation Failed",
        description: error.message || `Failed to ${scheme ? "update" : "create"} scheme`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{scheme ? "Edit Scheme" : "Create New Scheme"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="housing">Housing</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxBeneficiaries">Max Beneficiaries</Label>
              <Input
                id="maxBeneficiaries"
                type="number"
                value={formData.maxBeneficiaries || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxBeneficiaries: parseInt(e.target.value) || null,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value || null })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eligibility">Eligibility Criteria</Label>
            <Textarea
              id="eligibility"
              value={formData.eligibility}
              onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicationProcess">Application Process</Label>
            <Textarea
              id="applicationProcess"
              value={formData.applicationProcess}
              onChange={(e) =>
                setFormData({ ...formData, applicationProcess: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefits">Benefits</Label>
            <Textarea
              id="benefits"
              value={formData.benefits}
              onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPCOMING">Upcoming</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="ENDED">Ended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="processingTime">Processing Time</Label>
              <Input
                id="processingTime"
                value={formData.processingTime}
                onChange={(e) =>
                  setFormData({ ...formData, processingTime: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {scheme ? "Update" : "Create"} Scheme
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 