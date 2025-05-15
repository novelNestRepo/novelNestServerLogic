"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Headphones,
  Library,
  Menu,
  MessageSquare,
  Search,
  Settings,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { cn } from "@/lib/utils";
import ThreeJSBook from "./../src/components/ThreeJSBook";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const featuredBooks = [
    {
      id: 1,
      title: "The Midnight Library",
      author: "Matt Haig",
      cover:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200",
      progress: 67,
    },
    {
      id: 2,
      title: "Project Hail Mary",
      author: "Andy Weir",
      cover:
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=200",
      progress: 23,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={cn(
            "w-20 min-h-screen bg-card fixed left-0 top-0 flex flex-col items-center py-8 gap-8 border-r z-40 transition-transform duration-300 lg:translate-x-0",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}>
          <div className="flex flex-col items-center gap-8 mt-12 lg:mt-0">
            <Button variant="ghost" size="icon" className="rounded-full">
              <BookOpen className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Library className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MessageSquare className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Headphones className="h-6 w-6" />
            </Button>
          </div>
          <div className="mt-auto flex flex-col items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="h-6 w-6" />
            </Button>
            <AuthDialog />
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full lg:ml-20 p-4 sm:p-6 lg:p-8">
          {/* Search Bar */}
          <div className="flex items-center gap-4 mb-8 mt-12 lg:mt-0">
            <div className="relative flex-1 max-w-md mx-auto lg:mx-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search books, authors, or genres..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="featured" className="space-y-4">
            <TabsList className="w-full sm:w-auto flex justify-between sm:justify-start overflow-x-auto">
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="reading">Continue Reading</TabsTrigger>
              <TabsTrigger value="recommended">Recommended</TabsTrigger>
            </TabsList>

            <TabsContent value="featured" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                {featuredBooks.map((book) => (
                  <Card key={book.id} className="overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                    <div className="relative h-[300px] w-full bg-gradient-to-b from-background/50 to-background/10 rounded-t-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500">
                        <ThreeJSBook width={240} height={300} />
                      </div>
                    </div>
                    <div className="p-4 space-y-2 bg-card">
                      <h3 className="text-lg font-semibold line-clamp-1">
                        {book.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-1">
                        {book.author}
                      </p>
                      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300" 
                          style={{ width: `${book.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{book.progress}% completed</p>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reading">
              <ScrollArea className="h-[400px] w-full">
                {/* Reading list content */}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="recommended">
              {/* AI Recommendations will go here */}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
