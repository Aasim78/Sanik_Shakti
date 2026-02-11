import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type ApplicationStatus = "pending" | "approved" | "rejected";

interface AdminApplication {
  id: number;
  userId: number;
  schemeId: number;
  status: ApplicationStatus;
  appliedAt: string;
  reviewedAt?: string | null;
  reviewedBy?: number | null;
  comments?: string | null;
  scheme?: {
    id: number;
    title: string;
    category: string;
    amount: number;
  } | null;
  user?: {
    id: number;
    name: string;
    email: string;
    serviceNumber: string;
    role: string;
  };
}

function statusBadgeVariant(status: ApplicationStatus) {
  switch (status) {
    case "approved":
      return "default";
    case "rejected":
      return "destructive";
    default:
      return "secondary";
  }
}

export function ApplicationReview({ className }: { className?: string }) {
  const { user } = useAuth();
  const { toast } = useToast();

  const applicationsQuery = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/applications");
      return response.json() as Promise<AdminApplication[]>;
    },
    enabled: user?.role === "admin",
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (params: { id: number; status: ApplicationStatus }) => {
      const response = await apiRequest("PATCH", `/api/applications/${params.id}`, {
        status: params.status,
      });
      return response.json();
    },
    onSuccess: () => {
      applicationsQuery.refetch();
      toast({
        title: "Application Updated",
        description: "Status updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update application",
        variant: "destructive",
      });
    },
  });

  if (user?.role !== "admin") return null;

  const applications = applicationsQuery.data ?? [];
  const pendingFirst = [...applications].sort((a, b) => {
    if (a.status === b.status) return 0;
    if (a.status === "pending") return -1;
    if (b.status === "pending") return 1;
    return 0;
  });

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Application Review</span>
          {applicationsQuery.isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Button variant="ghost" size="sm" onClick={() => applicationsQuery.refetch()}>
              Refresh
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {applicationsQuery.isError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              Failed to load applications. Please try Refresh, or re-login if your session expired.
            </AlertDescription>
          </Alert>
        )}
        <ScrollArea className="h-[420px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Scheme</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingFirst.map((app) => {
                const canAct = app.status === "pending" && !updateStatusMutation.isPending;
                return (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div className="font-medium">{app.user?.name ?? `User #${app.userId}`}</div>
                      <div className="text-xs text-muted-foreground">{app.user?.serviceNumber ?? app.user?.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{app.scheme?.title ?? `Scheme #${app.schemeId}`}</div>
                      <div className="text-xs text-muted-foreground">
                        {app.scheme?.category ? app.scheme.category : ""}
                        {app.scheme?.amount ? ` · ₹${app.scheme.amount.toLocaleString()}` : ""}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {app.appliedAt ? new Date(app.appliedAt).toLocaleString() : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(app.status)}>{app.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: app.id, status: "approved" })}
                          disabled={!canAct}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateStatusMutation.mutate({ id: app.id, status: "rejected" })}
                          disabled={!canAct}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {applicationsQuery.isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Loading applications...
                  </TableCell>
                </TableRow>
              )}

              {!applicationsQuery.isLoading && pendingFirst.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No applications found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
