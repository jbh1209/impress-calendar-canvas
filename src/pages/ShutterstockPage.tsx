
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import ImageSearch from "@/components/shutterstock/ImageSearch";
import SelectedImages from "@/components/shutterstock/SelectedImages";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function ShutterstockPage() {
  const [activeTab, setActiveTab] = useState("search");
  const { user } = useAuth();

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  return (
    <div className="min-h-screen bg-darkBg flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Stock Image Library</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="search">Search Images</TabsTrigger>
              <TabsTrigger value="selections">My Selections</TabsTrigger>
            </TabsList>
            
            <Card className="bg-darkSecondary border-darkBorder p-6">
              <TabsContent value="search">
                <ImageSearch />
              </TabsContent>
              
              <TabsContent value="selections">
                <SelectedImages />
              </TabsContent>
            </Card>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
