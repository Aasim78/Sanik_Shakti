import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Search, 
  MapPin, 
  Users, 
  MessageCircle,
  Plus,
  Send,
  Heart,
  Share,
  BookOpen,
  Wrench,
  Shield,
  Clock
} from "lucide-react";
import { Link } from "wouter";

export default function Community() {
  const [selectedHub, setSelectedHub] = useState("delhi");

  // Sample community data
  const communityHubs = [
    {
      id: "delhi",
      name: "Delhi Cantonment",
      members: 1247,
      location: "Delhi",
      description: "Connect with military families and personnel in Delhi NCR region"
    },
    {
      id: "pune",
      name: "Pune Military Station",
      members: 892,
      location: "Maharashtra",
      description: "Southern Command community for welfare discussions and support"
    },
    {
      id: "jaipur",
      name: "Jaipur Cantonment",
      members: 654,
      location: "Rajasthan",
      description: "Desert Corps community for local networking and resources"
    }
  ];

  const communityPosts = [
    {
      id: 1,
      author: "Major Priya Singh",
      rank: "Major",
      unit: "Corps of Engineers",
      avatar: "PS",
      timestamp: "2 hours ago",
      content: "Looking for recommendations for good schools near Jaipur Cantonment for my daughter's admission. Any suggestions for CBSE schools with strong academics?",
      category: "education",
      likes: 12,
      replies: 8,
      location: "Jaipur"
    },
    {
      id: 2,
      author: "Col. Rajesh Kumar",
      rank: "Colonel",
      unit: "Infantry Regiment",
      avatar: "RK",
      timestamp: "4 hours ago",
      content: "Organizing a skill-sharing session this weekend. I can teach basic plumbing repairs in exchange for computer troubleshooting lessons. Who's interested?",
      category: "skill-swap",
      likes: 18,
      replies: 15,
      location: "Delhi"
    },
    {
      id: 3,
      author: "Mrs. Kavita Sharma",
      rank: "Family Member",
      unit: "Artillery Regiment",
      avatar: "KS",
      timestamp: "6 hours ago",
      content: "Thank you to everyone who helped during my husband's deployment. The community support here is incredible. Special thanks to the emergency contact network.",
      category: "support",
      likes: 34,
      replies: 12,
      location: "Pune"
    },
    {
      id: 4,
      author: "Capt. Vikram Patel",
      rank: "Captain",
      unit: "Armoured Corps",
      avatar: "VP",
      timestamp: "8 hours ago",
      content: "Starting a PTSD support group for veterans and active personnel. Professional counselor will be present. DM for details. Remember, seeking help is a sign of strength.",
      category: "mental-health",
      likes: 28,
      replies: 6,
      location: "Delhi"
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'education': return <BookOpen className="h-4 w-4" />;
      case 'skill-swap': return <Wrench className="h-4 w-4" />;
      case 'support': return <Heart className="h-4 w-4" />;
      case 'mental-health': return <Shield className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'education': return 'bg-blue-100 text-blue-800';
      case 'skill-swap': return 'bg-orange-100 text-orange-800';
      case 'support': return 'bg-green-100 text-green-800';
      case 'mental-health': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPosts = communityPosts.filter(post => 
    selectedHub === "all" || post.location.toLowerCase().includes(communityHubs.find(h => h.id === selectedHub)?.location.toLowerCase() || "")
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Community Hubs</h1>
            <p className="text-gray-600 mt-2">Connect with military families and personnel in your region</p>
          </div>
          <div className="flex gap-4">
            <Button className="bg-army-green-600 hover:bg-army-green-700">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Community Hubs Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Community Hubs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant={selectedHub === "all" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedHub("all")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  All Communities
                </Button>
                {communityHubs.map((hub) => (
                  <Button
                    key={hub.id}
                    variant={selectedHub === hub.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedHub(hub.id)}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    <div className="text-left flex-1">
                      <div className="font-medium">{hub.name}</div>
                      <div className="text-xs text-gray-500">{hub.members} members</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Educational Resources
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Wrench className="h-4 w-4 mr-2" />
                  Skill Exchange
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Support Groups
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="h-4 w-4 mr-2" />
                  Peer Support
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Selected Hub Info */}
            {selectedHub !== "all" && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  {(() => {
                    const hub = communityHubs.find(h => h.id === selectedHub);
                    return hub ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">{hub.name}</h3>
                          <p className="text-gray-600">{hub.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-army-green-600">{hub.members}</div>
                          <div className="text-sm text-gray-500">Active Members</div>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Create Post */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarFallback>YU</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Input 
                      placeholder="Share something with your community..." 
                      className="mb-3"
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Badge variant="outline">Education</Badge>
                        <Badge variant="outline">Skill Swap</Badge>
                        <Badge variant="outline">Support</Badge>
                      </div>
                      <Button size="sm" className="bg-army-green-600 hover:bg-army-green-700">
                        <Send className="h-4 w-4 mr-2" />
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community Posts */}
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarFallback>{post.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{post.author}</h4>
                            <p className="text-sm text-gray-600">{post.rank} • {post.unit}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getCategoryColor(post.category)}>
                              {getCategoryIcon(post.category)}
                              <span className="ml-1">
                                {post.category.replace('-', ' ').split(' ').map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}
                              </span>
                            </Badge>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {post.timestamp}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-800 mb-4">{post.content}</p>
                        
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-500">
                              <Heart className="h-4 w-4 mr-1" />
                              {post.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-500">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {post.replies}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-green-500">
                              <Share className="h-4 w-4 mr-1" />
                              Share
                            </Button>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            {post.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <Button variant="outline" className="w-full">
                Load More Posts
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}