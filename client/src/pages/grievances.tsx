import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, Phone, Mail, Clock } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

const grievanceSchema = z.object({
  category: z.string().min(1, "Category is required"),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.string().min(1, "Priority is required"),
});

type GrievanceFormData = z.infer<typeof grievanceSchema>;

interface Grievance {
  id: number;
  userId: number;
  category: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  filedAt: string;
  resolvedAt: string | null;
  resolvedBy: number | null;
  resolution: string | null;
}

export default function Grievances() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [adminEdits, setAdminEdits] = useState<Record<number, { status: string; resolution: string }>>({});

  const form = useForm<GrievanceFormData>({
    resolver: zodResolver(grievanceSchema),
    defaultValues: {
      category: "",
      subject: "",
      description: "",
      priority: "",
    },
  });

  const { data: grievances, isLoading } = useQuery<Grievance[] | undefined>({
    queryKey: ["/api/grievances"],
  });

  const submitGrievanceMutation = useMutation({
    mutationFn: async (data: GrievanceFormData) => {
      const response = await apiRequest("POST", "/api/grievances", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Grievance Submitted",
        description: "Your grievance has been submitted successfully and will be reviewed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/grievances"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit grievance. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GrievanceFormData) => {
    submitGrievanceMutation.mutate(data);
  };

  const updateGrievanceMutation = useMutation({
    mutationFn: async (payload: { id: number; status: string; resolution?: string }) => {
      const response = await apiRequest("PATCH", `/api/grievances/${payload.id}`, {
        status: payload.status,
        resolution: payload.resolution,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Grievance Updated",
        description: "Status/resolution saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/grievances"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update grievance",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'filed': return 'Filed';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Grievance Portal</h1>
            <p className="text-gray-600 mt-2">Submit and track your grievances</p>
          </div>
          <Link href="/dashboard">
            <Button className="bg-army-green-600 hover:bg-army-green-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Panel */}
          <div className="lg:col-span-2">
            {user?.role === "admin" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Grievance Review (Admin)</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (grievances?.length || 0) > 0 ? (
                    <div className="space-y-4">
                      {(grievances || []).map((g: Grievance) => {
                        const edit = adminEdits[g.id] || {
                          status: g.status,
                          resolution: g.resolution || "",
                        };

                        return (
                          <Card key={g.id}>
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold text-gray-900 truncate">{g.subject}</h3>
                                    <Badge className={getStatusColor(g.status)}>{getStatusText(g.status)}</Badge>
                                    <Badge variant="outline">{g.priority}</Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">User ID: {g.userId} • Category: {g.category}</p>
                                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{g.description}</p>
                                  <p className="text-xs text-gray-500 mt-2">Filed: {new Date(g.filedAt).toLocaleString()}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label>Status</Label>
                                  <Select
                                    value={edit.status}
                                    onValueChange={(value) =>
                                      setAdminEdits((prev) => ({
                                        ...prev,
                                        [g.id]: { ...edit, status: value },
                                      }))
                                    }
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="filed">Filed</SelectItem>
                                      <SelectItem value="in_progress">In Progress</SelectItem>
                                      <SelectItem value="resolved">Resolved</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label>Resolution</Label>
                                  <Textarea
                                    className="mt-1"
                                    rows={3}
                                    value={edit.resolution}
                                    onChange={(e) =>
                                      setAdminEdits((prev) => ({
                                        ...prev,
                                        [g.id]: { ...edit, resolution: e.target.value },
                                      }))
                                    }
                                    placeholder="Add resolution notes (optional)"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end">
                                <Button
                                  className="bg-army-green-600 hover:bg-army-green-700"
                                  onClick={() => updateGrievanceMutation.mutate({ id: g.id, status: edit.status, resolution: edit.resolution })}
                                  disabled={updateGrievanceMutation.isPending}
                                >
                                  {updateGrievanceMutation.isPending ? "Saving..." : "Save Update"}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">No grievances found</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Submit New Grievance</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="administrative">Administrative</SelectItem>
                        <SelectItem value="welfare">Welfare Schemes</SelectItem>
                        <SelectItem value="medical">Medical Services</SelectItem>
                        <SelectItem value="accommodation">Accommodation</SelectItem>
                        <SelectItem value="pay_allowances">Pay & Allowances</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.category && (
                      <p className="text-red-600 text-sm mt-1">{form.formState.errors.category.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your grievance"
                      className="mt-1"
                      {...form.register("subject")}
                    />
                    {form.formState.errors.subject && (
                      <p className="text-red-600 text-sm mt-1">{form.formState.errors.subject.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Detailed Description</Label>
                    <Textarea
                      id="description"
                      rows={6}
                      placeholder="Provide detailed information about your grievance..."
                      className="mt-1"
                      {...form.register("description")}
                    />
                    {form.formState.errors.description && (
                      <p className="text-red-600 text-sm mt-1">{form.formState.errors.description.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority Level</Label>
                    <Select value={form.watch("priority")} onValueChange={(value) => form.setValue("priority", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.priority && (
                      <p className="text-red-600 text-sm mt-1">{form.formState.errors.priority.message}</p>
                    )}
                  </div>

                  <div>
                    <Label>Supporting Documents</Label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                        <div className="flex text-sm text-gray-600">
                          <span className="relative cursor-pointer bg-white rounded-md font-medium text-army-green-600 hover:text-army-green-500">
                            Upload files
                          </span>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-army-green-600 hover:bg-army-green-700"
                    disabled={submitGrievanceMutation.isPending}
                  >
                    {submitGrievanceMutation.isPending ? "Submitting..." : "Submit Grievance"}
                  </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Grievance Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Grievance Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Submitted</span>
                      <span className="font-semibold text-gray-900">{grievances?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Pending</span>
                      <span className="font-semibold text-yellow-600">
                        {grievances?.filter((g: any) => g.status !== 'resolved').length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Resolved</span>
                      <span className="font-semibold text-green-600">
                        {grievances?.filter((g: any) => g.status === 'resolved').length || 0}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Grievances */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Grievances</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-4">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    ))}
                  </div>
                ) : grievances && Array.isArray(grievances) && grievances.length > 0 ? (
                  <div className="space-y-4">
                    {grievances.slice(0, 3).map((grievance: any) => (
                      <div key={grievance.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {grievance.subject}
                          </h4>
                          <Badge className={getStatusColor(grievance.status)}>
                            {getStatusText(grievance.status)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">
                          Filed {new Date(grievance.filedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No grievances submitted yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-army-green-500 mr-3" />
                    <span>1800-XXX-XXXX</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-army-green-500 mr-3" />
                    <span>grievance@sainiksuathi.gov.in</span>
                  </div>
                  <div className="flex items-start text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-army-green-500 mr-3 mt-0.5" />
                    <span>Mon-Fri, 9:00 AM - 6:00 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
