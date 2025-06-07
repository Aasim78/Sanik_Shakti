import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Search, 
  MapPin, 
  Clock, 
  Book, 
  Wrench, 
  Home, 
  MessageCircle,
  Plus,
  Filter
} from "lucide-react";
import { Link } from "wouter";

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  // Sample marketplace data
  const marketplaceItems = [
    {
      id: 1,
      title: "Complete NCERT Mathematics Set (Class 6-12)",
      description: "Well-maintained textbooks for children's education. All books in excellent condition with minimal highlighting.",
      category: "books",
      type: "available",
      price: "Free",
      location: "Delhi Cantonment",
      postedBy: "Major Suresh Kumar",
      postedAt: "2 days ago",
      status: "Available"
    },
    {
      id: 2,
      title: "Power Tools Kit - Complete Set",
      description: "Professional grade tools including drill machine, angle grinder, and hand tools. Perfect for home repairs.",
      category: "equipment",
      type: "available",
      price: "₹500/month",
      location: "Pune Cantonment",
      postedBy: "Capt. Amit Singh",
      postedAt: "1 week ago",
      status: "Available"
    },
    {
      id: 3,
      title: "2BHK Flat - Family Accommodation",
      description: "Spacious 2BHK near military base with parking. Available for temporary posting families.",
      category: "housing",
      type: "available",
      price: "₹15,000/month",
      location: "Jaipur Cantonment",
      postedBy: "Col. Rajesh Verma",
      postedAt: "3 days ago",
      status: "Available"
    },
    {
      id: 4,
      title: "Engineering Textbooks Needed",
      description: "Looking for mechanical engineering textbooks for my son's college. Willing to buy or borrow.",
      category: "books",
      type: "needed",
      price: "Negotiable",
      location: "Mumbai",
      postedBy: "Mrs. Kavita Sharma",
      postedAt: "5 days ago",
      status: "Looking"
    }
  ];

  const filteredItems = marketplaceItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesLocation = !locationFilter || item.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'books': return <Book className="h-5 w-5" />;
      case 'equipment': return <Wrench className="h-5 w-5" />;
      case 'housing': return <Home className="h-5 w-5" />;
      default: return <Book className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'books': return 'bg-blue-100 text-blue-800';
      case 'equipment': return 'bg-orange-100 text-orange-800';
      case 'housing': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'available' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resource Sharing Marketplace</h1>
            <p className="text-gray-600 mt-2">Share books, equipment, and housing within the military community</p>
          </div>
          <div className="flex gap-4">
            <Button className="bg-army-green-600 hover:bg-army-green-700">
              <Plus className="h-4 w-4 mr-2" />
              List Item
            </Button>
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="housing">Housing</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Marketplace Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Items ({filteredItems.length})</TabsTrigger>
            <TabsTrigger value="available">Available ({filteredItems.filter(i => i.type === 'available').length})</TabsTrigger>
            <TabsTrigger value="needed">Needed ({filteredItems.filter(i => i.type === 'needed').length})</TabsTrigger>
            <TabsTrigger value="my-items">My Listings</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-lg ${getCategoryColor(item.category)}`}>
                          {getCategoryIcon(item.category)}
                        </div>
                        <div>
                          <Badge className={getCategoryColor(item.category)}>
                            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <Badge className={getTypeColor(item.type)}>
                        {item.type === 'available' ? 'Available' : 'Needed'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Price:</span>
                        <span className="font-semibold text-green-600">{item.price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Location:</span>
                        <span className="text-sm font-medium">{item.location}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Posted by:</span>
                        <span className="text-sm font-medium">{item.postedBy}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {item.postedAt}
                      </div>
                      <Button size="sm" className="bg-army-green-600 hover:bg-army-green-700">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="available">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.filter(item => item.type === 'available').map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-lg ${getCategoryColor(item.category)}`}>
                          {getCategoryIcon(item.category)}
                        </div>
                        <Badge className={getCategoryColor(item.category)}>
                          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                        </Badge>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Available</Badge>
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Price:</span>
                        <span className="font-semibold text-green-600">{item.price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Location:</span>
                        <span className="text-sm font-medium">{item.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {item.postedAt}
                      </div>
                      <Button size="sm" className="bg-army-green-600 hover:bg-army-green-700">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="needed">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.filter(item => item.type === 'needed').map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-lg ${getCategoryColor(item.category)}`}>
                          {getCategoryIcon(item.category)}
                        </div>
                        <Badge className={getCategoryColor(item.category)}>
                          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                        </Badge>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800">Needed</Badge>
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Budget:</span>
                        <span className="font-semibold text-purple-600">{item.price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Location:</span>
                        <span className="text-sm font-medium">{item.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {item.postedAt}
                      </div>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Offer Help
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-items">
            <div className="text-center py-16">
              <div className="text-gray-500">
                <Plus className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No items listed yet</h3>
                <p className="mb-6">Start sharing resources with your military community</p>
                <Button className="bg-army-green-600 hover:bg-army-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  List Your First Item
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}