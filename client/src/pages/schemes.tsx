import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Users, Calendar, Clock, Search } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Schemes() {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [eligibilityFilter, setEligibilityFilter] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: schemes, isLoading } = useQuery({
    queryKey: ["/api/schemes"],
  });

  const applyMutation = useMutation({
    mutationFn: async (schemeId: number) => {
      const response = await apiRequest("POST", "/api/applications", { schemeId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully and is under review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredSchemes = schemes?.filter((scheme: any) => {
    const categoryMatch = !categoryFilter || scheme.category === categoryFilter;
    const eligibilityMatch = !eligibilityFilter || scheme.eligibility.toLowerCase().includes(eligibilityFilter.toLowerCase());
    return categoryMatch && eligibilityMatch;
  }) || [];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'education': return 'bg-army-green-100 text-army-green-800';
      case 'medical': return 'bg-red-100 text-red-800';
      case 'housing': return 'bg-blue-100 text-blue-800';
      case 'family': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welfare Schemes</h1>
            <p className="text-gray-600 mt-2">Browse and apply for available welfare schemes</p>
          </div>
          <Link href="/dashboard">
            <Button className="bg-army-green-600 hover:bg-army-green-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="housing">Housing</SelectItem>
                    <SelectItem value="family">Family Welfare</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Eligibility</Label>
                <Select value={eligibilityFilter} onValueChange={setEligibilityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Personnel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Personnel</SelectItem>
                    <SelectItem value="active">Active Service</SelectItem>
                    <SelectItem value="veteran">Veterans</SelectItem>
                    <SelectItem value="family">Family Members</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Amount Range</Label>
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Amount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button className="w-full bg-army-green-600 hover:bg-army-green-700" disabled>
                  <Search className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schemes Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-20 mb-4" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-16 w-full mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredSchemes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemes.map((scheme: any) => (
              <Card key={scheme.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className={getCategoryColor(scheme.category)}>
                      {scheme.category.charAt(0).toUpperCase() + scheme.category.slice(1)}
                    </Badge>
                    <span className="text-2xl font-bold text-yellow-600">₹{scheme.amount.toLocaleString()}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{scheme.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{scheme.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 text-army-green-500 mr-2" />
                      <span>Eligible: {scheme.eligibility}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-army-green-500 mr-2" />
                      <span>Deadline: {scheme.deadline}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 text-army-green-500 mr-2" />
                      <span>Processing: {scheme.processingTime}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-army-green-600 hover:bg-army-green-700"
                    onClick={() => applyMutation.mutate(scheme.id)}
                    disabled={applyMutation.isPending}
                  >
                    {applyMutation.isPending ? "Applying..." : "Apply Now"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-500">
              <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No schemes found</h3>
              <p>Try adjusting your filters to see more schemes.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
