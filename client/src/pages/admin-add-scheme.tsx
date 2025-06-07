import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function AdminAddScheme() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    amount: "",
    eligibility: "",
    deadline: "",
    processingTime: "",
    isActive: true,
    startDate: "",
    endDate: "",
    maxBeneficiaries: "",
    documents: "",
    applicationProcess: "",
    benefits: "",
    fundingSource: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    tags: "",
    status: "ACTIVE",
  });
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/schemes", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Scheme Added", description: "The scheme was added successfully." });
      navigate("/schemes");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to add scheme.", variant: "destructive" });
    },
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      setForm((prev) => ({
        ...prev,
        [name]: e.target.checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Convert fields to correct types
    const data = {
      ...form,
      amount: Number(form.amount),
      maxBeneficiaries: Number(form.maxBeneficiaries),
      isActive: Boolean(form.isActive),
      documents: form.documents.split(",").map((d) => d.trim()).filter(Boolean),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
    };
    mutation.mutate(data);
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Add New Scheme</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required className="input w-full border p-2 rounded" />
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required className="input w-full border p-2 rounded" />
            <input name="category" placeholder="Category" value={form.category} onChange={handleChange} required className="input w-full border p-2 rounded" />
            <input name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleChange} required className="input w-full border p-2 rounded" />
            <input name="eligibility" placeholder="Eligibility" value={form.eligibility} onChange={handleChange} required className="input w-full border p-2 rounded" />
            <input name="deadline" placeholder="Deadline" value={form.deadline} onChange={handleChange} required className="input w-full border p-2 rounded" />
            <input name="processingTime" placeholder="Processing Time" value={form.processingTime} onChange={handleChange} required className="input w-full border p-2 rounded" />
            <input name="startDate" type="date" placeholder="Start Date" value={form.startDate} onChange={handleChange} required className="input w-full border p-2 rounded" />
            <input name="endDate" type="date" placeholder="End Date" value={form.endDate} onChange={handleChange} className="input w-full border p-2 rounded" />
            <input name="maxBeneficiaries" type="number" placeholder="Max Beneficiaries" value={form.maxBeneficiaries} onChange={handleChange} required className="input w-full border p-2 rounded" />
            <input name="documents" placeholder="Documents (comma separated)" value={form.documents} onChange={handleChange} className="input w-full border p-2 rounded" />
            <input name="applicationProcess" placeholder="Application Process" value={form.applicationProcess} onChange={handleChange} className="input w-full border p-2 rounded" />
            <input name="benefits" placeholder="Benefits" value={form.benefits} onChange={handleChange} className="input w-full border p-2 rounded" />
            <input name="fundingSource" placeholder="Funding Source" value={form.fundingSource} onChange={handleChange} className="input w-full border p-2 rounded" />
            <input name="contactPerson" placeholder="Contact Person" value={form.contactPerson} onChange={handleChange} className="input w-full border p-2 rounded" />
            <input name="contactEmail" placeholder="Contact Email" value={form.contactEmail} onChange={handleChange} className="input w-full border p-2 rounded" />
            <input name="contactPhone" placeholder="Contact Phone" value={form.contactPhone} onChange={handleChange} className="input w-full border p-2 rounded" />
            <input name="tags" placeholder="Tags (comma separated)" value={form.tags} onChange={handleChange} className="input w-full border p-2 rounded" />
            <select name="status" value={form.status} onChange={handleChange} className="input w-full border p-2 rounded">
              <option value="ACTIVE">Active</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="PAUSED">Paused</option>
              <option value="ENDED">Ended</option>
            </select>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
              Is Active
            </label>
            <Button type="submit" className="w-full bg-army-green-600 hover:bg-army-green-700" disabled={mutation.isPending}>
              {mutation.isPending ? "Adding..." : "Add Scheme"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 