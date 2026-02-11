import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Search, Filter } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SchemeForm } from "./scheme-form";

interface SchemeFilters {
  category?: string;
  status?: string;
  search?: string;
  minAmount?: number;
  maxAmount?: number;
  isActive?: boolean;
  tags?: string[];
}

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

export function SchemeManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState<SchemeFilters>({});
  const [tab, setTab] = useState<"active" | "upcoming" | "ended" | "all">("active");
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const effectiveFilters = useMemo(() => {
    const status =
      tab === "active"
        ? "ACTIVE"
        : tab === "upcoming"
          ? "UPCOMING"
          : tab === "ended"
            ? "ENDED"
            : undefined;

    return {
      ...filters,
      status,
    } satisfies SchemeFilters;
  }, [filters, tab]);

  const schemesUrl = useMemo(() => {
    const params = new URLSearchParams();

    if (effectiveFilters.category) params.set("category", effectiveFilters.category);
    if (effectiveFilters.status) params.set("status", effectiveFilters.status);
    if (effectiveFilters.search) params.set("search", effectiveFilters.search);
    if (effectiveFilters.minAmount !== undefined) params.set("minAmount", String(effectiveFilters.minAmount));
    if (effectiveFilters.maxAmount !== undefined) params.set("maxAmount", String(effectiveFilters.maxAmount));
    if (effectiveFilters.isActive !== undefined) params.set("isActive", String(effectiveFilters.isActive));
    if (effectiveFilters.tags?.length) params.set("tags", effectiveFilters.tags.join(","));

    const qs = params.toString();
    return qs ? `/api/schemes?${qs}` : "/api/schemes";
  }, [effectiveFilters]);

  const schemesQuery = useQuery({
    queryKey: ["schemes", effectiveFilters],
    queryFn: async () => {
      const response = await apiRequest("GET", schemesUrl);
      return response.json() as Promise<Scheme[]>;
    },
    enabled: user?.role === "admin",
  });

  const deleteSchemeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/schemes/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Scheme Deleted",
        description: "The scheme has been deleted successfully.",
      });
      schemesQuery.refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete scheme",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this scheme?")) {
      deleteSchemeMutation.mutate(id);
    }
  };

  const handleEdit = (scheme: Scheme) => {
    setSelectedScheme(scheme);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedScheme(null);
    setIsFormOpen(true);
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Scheme Management</span>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Scheme
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="ended">Ended</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search schemes..."
                  value={filters.search || ""}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-8"
                />
              </div>
            </div>
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters({ ...filters, category: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="housing">Housing</SelectItem>
                <SelectItem value="family">Family</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>

          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {schemesQuery.isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Failed to load schemes. Try Refresh, or re-login if your session expired.
                  </AlertDescription>
                </Alert>
              )}

              {schemesQuery.isLoading && (
                <div className="flex items-center justify-center py-10 text-gray-500">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading schemes...
                </div>
              )}

              {schemesQuery.data?.map((scheme) => (
                <Card key={scheme.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{scheme.title}</h3>
                        <Badge>{scheme.category}</Badge>
                        <Badge variant={scheme.status === "ACTIVE" ? "default" : "secondary"}>
                          {scheme.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{scheme.description}</p>
                      <div className="flex gap-4 text-sm">
                        <span>Amount: ₹{scheme.amount}</span>
                        <span>
                          Beneficiaries: {scheme.currentBeneficiaries}
                          {scheme.maxBeneficiaries && `/${scheme.maxBeneficiaries}`}
                        </span>
                      </div>
                      {/* Defensive check for tags */}
                      {Array.isArray(scheme.tags) && scheme.tags.length > 0 && (
                        <div className="flex gap-1">
                          {scheme.tags.map((tag) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(scheme)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(scheme.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {!schemesQuery.isLoading && schemesQuery.data?.length === 0 && (
                <p className="text-center text-gray-500">No schemes found</p>
              )}
            </div>
          </ScrollArea>
        </Tabs>
      </CardContent>

      <SchemeForm
        scheme={selectedScheme || undefined}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          schemesQuery.refetch();
          setIsFormOpen(false);
        }}
      />
    </Card>
  );
} 