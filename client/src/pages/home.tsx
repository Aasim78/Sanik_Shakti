import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HandHeart, AlertTriangle, FileText, TrendingUp, UserPlus, LogIn, Users, MessageSquare, Share2, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="text-yellow-300">Transforming Military Welfare</span><br />
                Through Technology
              </h1>
              <p className="text-xl text-gray-200 mb-8">
                A comprehensive platform for soldiers, veterans, and families providing seamless access to welfare schemes, emergency support, grievance resolution, and community connectivity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-8">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Get Started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button 
                    variant="outline" 
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-600 font-semibold py-3 px-8"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Indian Armed Forces personnel" 
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Features</h2>
            <p className="text-lg text-gray-600">Comprehensive welfare management at your fingertips</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer hover:bg-green-50">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HandHeart className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Welfare Schemes</h3>
                <p className="text-gray-600">AI-driven eligibility checker and instant applications for military welfare schemes.</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer hover:bg-red-50">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Emergency Network</h3>
                <p className="text-gray-600">SOS alerts with geolocation to nearby hospitals, units, and emergency contacts.</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer hover:bg-blue-50">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Grievance Portal</h3>
                <p className="text-gray-600">Smart complaint filing with NLP urgency detection and blockchain accountability.</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer hover:bg-purple-50">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Share2 className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Resource Sharing</h3>
                <p className="text-gray-600">Marketplace for books, equipment, and housing with secure messaging system.</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer hover:bg-indigo-50">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Community Hubs</h3>
                <p className="text-gray-600">Region-based networking and peer support groups with professional moderation.</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer hover:bg-orange-50">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Real-time Tracking</h3>
                <p className="text-gray-600">Live application status with transparent progress from submission to disbursement.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Military Personnel</h2>
            <p className="text-lg text-gray-600">Real feedback from soldiers, officers, and families using Sainik Saathi</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-army-green-100 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-army-green-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">Major Rajesh Kumar</h4>
                    <p className="text-sm text-gray-600">Infantry Regiment</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"Sainik Saathi transformed how I access welfare schemes. The AI eligibility checker saved me hours of paperwork, and my children's education grant was approved in just 10 days."</p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">Mrs. Priya Singh</h4>
                    <p className="text-sm text-gray-600">Army Family Member</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"The SOS feature gave me peace of mind. When my husband was deployed, I knew help was just one click away. The community support through regional hubs is incredible."</p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">Col. Vikram Sharma</h4>
                    <p className="text-sm text-gray-600">Administrative Officer</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"As an admin, the grievance resolution system with blockchain tracking ensures complete transparency. Processing times reduced by 60% since implementing Sainik Saathi."</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
