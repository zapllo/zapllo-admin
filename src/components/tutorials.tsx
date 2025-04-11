import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import axios from "axios";
import {
  Play,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  ExternalLink,
  Clock,
  Calendar,
  Eye,
  Bookmark,
  BookmarkCheck,
  Tag,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// Import the dialog components
import CreateTutorialDialog from "./modals/createTutorial";
import EditTutorialDialog from "./modals/editTutorial";
import DeleteConfirmationDialog from "./modals/deleteConfirmationDialog";

interface Tutorial {
  _id: string;
  title: string;
  category: string;
  link: string;
  thumbnail: string;
  description?: string;
  difficulty?: string;
  duration?: number;  // in minutes
  createdAt?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  tags?: string[];
  viewCount?: number;
}

interface TutorialsProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  filter?: string;
}

const categoryOptions = [
  "All",
  "Task Delegation App",
  "Leave and Attendance App",
  "Zapllo WABA",
];

// Filter options
const difficulties = ["All Levels", "Beginner", "Intermediate", "Advanced"];
const sortOptions = ["Newest", "Oldest", "Most Viewed", "A-Z", "Z-A"];

const Tutorials: React.FC<TutorialsProps> = ({
  isCollapsed,
  setIsCollapsed,
  filter
}) => {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [filteredTutorials, setFilteredTutorials] = useState<Tutorial[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isSortMenuOpen, setIsSortMenuOpen] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("Newest");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All Levels");
  const [bookmarkedTutorials, setBookmarkedTutorials] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [tutorialToDelete, setTutorialToDelete] = useState<string | null>(null);

  useEffect(() => {
    // Load bookmarked tutorials from localStorage
    const savedBookmarks = localStorage.getItem("bookmarkedTutorials");
    if (savedBookmarks) {
      setBookmarkedTutorials(JSON.parse(savedBookmarks));
    }

    fetchTutorials();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tutorials, selectedCategory, searchTerm, sortBy, difficultyFilter, activeTab]);

  // Filter tutorials based on current filter settings
  const applyFilters = () => {
    // Start with the main category filter
    let result = tutorials;

    if (selectedCategory !== "All") {
      result = result.filter(tutorial => tutorial.category === selectedCategory);
    }

    // Apply tab filter
    if (activeTab === "bookmarked") {
      result = result.filter(tutorial => bookmarkedTutorials.includes(tutorial._id));
    } else if (activeTab === "new") {
      result = result.filter(tutorial => tutorial.isNew);
    } else if (activeTab === "featured") {
      result = result.filter(tutorial => tutorial.isFeatured);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(tutorial =>
        tutorial.title.toLowerCase().includes(searchLower) ||
        tutorial.description?.toLowerCase().includes(searchLower) ||
        tutorial.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply difficulty filter
    if (difficultyFilter !== "All Levels") {
      result = result.filter(tutorial => tutorial.difficulty === difficultyFilter);
    }

    // Apply sort
    switch (sortBy) {
      case "Newest":
        result = [...result].sort((a, b) =>
          new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
        );
        break;
      case "Oldest":
        result = [...result].sort((a, b) =>
          new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime()
        );
        break;
      case "Most Viewed":
        result = [...result].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
      case "A-Z":
        result = [...result].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "Z-A":
        result = [...result].sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    setFilteredTutorials(result);
  };

  const fetchTutorials = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("/api/tutorials");

      // Add some mock data for better visual display
      const enhancedTutorials = response.data.tutorials.map((tutorial: Tutorial, index: number) => ({
        ...tutorial,
        difficulty: ["Beginner", "Intermediate", "Advanced"][index % 3],
        duration: Math.floor(Math.random() * 30) + 5, // 5-35 minutes
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(), // Random date in last 90 days
        isFeatured: index % 5 === 0,
        isNew: index % 4 === 0,
        tags: ["Tutorial", tutorial.category, index % 2 === 0 ? "Recommended" : ""],
        viewCount: Math.floor(Math.random() * 1000)
      }));

      setTutorials(enhancedTutorials);
      setFilteredTutorials(enhancedTutorials);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch tutorials:", err);
      setError("Failed to load tutorials. Please try again later.");
      setLoading(false);
      toast.error("Failed to load tutorials");
    }
  };

  const handleTutorialCreated = (newTutorial: Tutorial) => {
    setTutorials((prev) => [
      ...prev,
      {
        ...newTutorial,
        createdAt: new Date().toISOString(),
        isNew: true,
        viewCount: 0
      }
    ]);
    toast.success("Tutorial created successfully");
  };

  const handleTutorialUpdated = (updatedTutorial: Tutorial) => {
    setTutorials((prev) =>
      prev.map((tutorial) =>
        tutorial._id === updatedTutorial._id
          ? { ...tutorial, ...updatedTutorial }
          : tutorial
      )
    );
    toast.success("Tutorial updated successfully");
  };

  const handleDelete = async () => {
    if (!tutorialToDelete) return;

    try {
      await axios.delete(`/api/tutorials/${tutorialToDelete}`);
      setTutorials((prev) =>
        prev.filter((tutorial) => tutorial._id !== tutorialToDelete)
      );
      setDeleteDialogOpen(false);
      setTutorialToDelete(null);
      toast.success("Tutorial deleted successfully");
    } catch (err) {
      console.error("Failed to delete tutorial:", err);
      toast.error("Failed to delete tutorial");
    }
  };

  const openDeleteDialog = (tutorialId: string) => {
    setTutorialToDelete(tutorialId);
    setDeleteDialogOpen(true);
  };

  const toggleBookmark = (tutorialId: string) => {
    let updatedBookmarks;

    if (bookmarkedTutorials.includes(tutorialId)) {
      updatedBookmarks = bookmarkedTutorials.filter(id => id !== tutorialId);
      toast.info("Tutorial removed from bookmarks");
    } else {
      updatedBookmarks = [...bookmarkedTutorials, tutorialId];
      toast.success("Tutorial bookmarked");
    }

    setBookmarkedTutorials(updatedBookmarks);
    localStorage.setItem("bookmarkedTutorials", JSON.stringify(updatedBookmarks));
  };

  const resetFilters = () => {
    setSelectedCategory("All");
    setSearchTerm("");
    setSortBy("Newest");
    setDifficultyFilter("All Levels");
    setActiveTab("all");
    toast.info("Filters have been reset");
  };

  // Render tutorial cards
  const renderTutorialCard = (tutorial: Tutorial) => {
    const isBookmarked = bookmarkedTutorials.includes(tutorial._id);

    return (
      <Card key={tutorial._id} className="overflow-hidden group hover:shadow-md transition-shadow">
        <div className="relative">
          <img
            src={tutorial.thumbnail || "https://via.placeholder.com/640x360"}
            alt={tutorial.title}
            className="w-full h-48 object-cover transition-transform group-hover:scale-105"
          />

          {/* Duration badge */}
          {tutorial.duration && (
            <Badge
              className="absolute bottom-2 right-2 bg-black/70 hover:bg-black/70"
              variant="secondary"
            >
              <Clock className="h-3 w-3 mr-1" />
              {tutorial.duration} min
            </Badge>
          )}

          {/* Featured/New badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {tutorial.isFeatured && (
              <Badge className="bg-yellow-600 hover:bg-yellow-700">Featured</Badge>
            )}
            {tutorial.isNew && (
              <Badge className="bg-green-600 hover:bg-green-700">New</Badge>
            )}
          </div>

          {/* Bookmark button */}
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleBookmark(tutorial._id);
            }}
            className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 text-white h-8 w-8 rounded-full"
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold line-clamp-2 mb-1">{tutorial.title}</h3>

              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <Badge
                  variant="outline"
                  className="mr-2 font-normal"
                >
                  {tutorial.category}
                </Badge>

                {tutorial.difficulty && (
                  <span className="flex items-center">
                    <Tag className="h-3 w-3 mr-1" />
                    {tutorial.difficulty}
                  </span>
                )}
              </div>

              {tutorial.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {tutorial.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center text-xs text-muted-foreground mb-3">
            {tutorial.createdAt && (
              <span className="flex items-center mr-4">
                <Calendar className="h-3 w-3 mr-1" />
                {format(new Date(tutorial.createdAt), "MMM d, yyyy")}
              </span>
            )}

            {tutorial.viewCount !== undefined && (
              <span className="flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                {tutorial.viewCount} views
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex justify-between">
          <a
            href={tutorial.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            <Play className="h-4 w-4 mr-1" />
            Watch Tutorial
          </a>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => toggleBookmark(tutorial._id)}
              >
                {isBookmarked ? (
                  <>
                    <BookmarkCheck className="h-4 w-4 mr-2" /> Remove bookmark
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4 mr-2" /> Bookmark tutorial
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a
                  href={tutorial.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" /> Open in new tab
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <EditTutorialDialog
                  tutorial={tutorial}
                  onTutorialUpdated={handleTutorialUpdated}
                />

              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={() => openDeleteDialog(tutorial._id)}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete tutorial
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>
    );
  };

  // Render tutorial item in list view
  const renderTutorialListItem = (tutorial: Tutorial) => {
    const isBookmarked = bookmarkedTutorials.includes(tutorial._id);

    return (
      <div
        key={tutorial._id}
        className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
      >
        <div className="relative sm:w-48 h-32 flex-shrink-0">
          <img
            src={tutorial.thumbnail || "https://via.placeholder.com/640x360"}
            alt={tutorial.title}
            className="w-full h-full object-cover rounded-md"
          />

          {/* Duration badge */}
          {tutorial.duration && (
            <Badge
              className="absolute bottom-2 right-2 bg-black/70 hover:bg-black/70"
              variant="secondary"
            >
              <Clock className="h-3 w-3 mr-1" />
              {tutorial.duration} min
            </Badge>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{tutorial.title}</h3>

                {tutorial.isFeatured && (
                  <Badge className="bg-yellow-600 hover:bg-yellow-700">Featured</Badge>
                )}

                {tutorial.isNew && (
                  <Badge className="bg-green-600 hover:bg-green-700">New</Badge>
                )}
              </div>

              <div className="flex items-center flex-wrap gap-2 mt-1 mb-2">
                <Badge
                  variant="outline"
                  className="font-normal"
                >
                  {tutorial.category}
                </Badge>

                {tutorial.difficulty && (
                  <span className="text-xs flex items-center text-muted-foreground">
                    <Tag className="h-3 w-3 mr-1" />
                    {tutorial.difficulty}
                  </span>
                )}

                {tutorial.createdAt && (
                  <span className="text-xs flex items-center text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(tutorial.createdAt), "MMM d, yyyy")}
                  </span>
                )}

                {tutorial.viewCount !== undefined && (
                  <span className="text-xs flex items-center text-muted-foreground">
                    <Eye className="h-3 w-3 mr-1" />
                    {tutorial.viewCount} views
                  </span>
                )}
              </div>

              {tutorial.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1 mb-3">
                  {tutorial.description || "No description available."}
                </p>
              )}
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => toggleBookmark(tutorial._id)}
              className="h-8 w-8 flex-shrink-0"
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-primary" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between mt-auto pt-2">
            <a
              href={tutorial.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              <Play className="h-4 w-4 mr-1" />
              Watch Tutorial
            </a>

            <div className="flex items-center gap-2">
              <EditTutorialDialog
                tutorial={tutorial}
                onTutorialUpdated={handleTutorialUpdated}
              />

              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                onClick={() => openDeleteDialog(tutorial._id)}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render loading skeleton based on view mode
  const renderSkeletons = () => {
    if (viewMode === "grid") {
      return Array(6).fill(0).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <Skeleton className="w-full h-48" />
          <CardContent className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Skeleton className="h-9 w-32" />
          </CardFooter>
        </Card>
      ));
    } else {
      return Array(4).fill(0).map((_, index) => (
        <div key={index} className="flex gap-4 p-4 border rounded-lg">
          <Skeleton className="w-48 h-32 flex-shrink-0" />
          <div className="flex-1">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <div className="flex justify-between mt-4">
              <Skeleton className="h-9 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </div>
        </div>
      ));
    }
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center text-center py-16">
      {searchTerm || selectedCategory !== "All" || difficultyFilter !== "All Levels" ? (
        <>
          <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <h3 className="text-lg font-medium mb-2">No matching tutorials</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            We couldn't find any tutorials matching your current filters.
          </p>
          <Button onClick={resetFilters}>Reset Filters</Button>
        </>
      ) : (
        <>
          <Play className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <h3 className="text-lg font-medium mb-2">No tutorials yet</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            There are no tutorials available yet. Create your first tutorial to get started.
          </p>
          <CreateTutorialDialog onTutorialCreated={handleTutorialCreated}/>
        </>
      )}
    </div>
  );

  return (
    <div className="container px-4 mt-12 mx-auto">
      {/* Filters and Actions */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div className="w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search tutorials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-[300px]"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 text-muted-foreground"
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFiltersOpen(true)}
              aria-label="More filters"
              className="hidden md:flex"
            >
              <Filter className="h-4 w-4" />
            </Button> */}

            <DropdownMenu open={isSortMenuOpen} onOpenChange={setIsSortMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden md:flex">
                  Sort: {sortBy}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
              {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option}
                    className="cursor-pointer"
                    onClick={() => {
                      setSortBy(option);
                      setIsSortMenuOpen(false);
                    }}
                  >
                    {option === sortBy && (
                      <svg
                        className="mr-2 h-4 w-4 text-primary"
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    )}
                    <span className={sortBy === option ? "font-medium" : ""}>
                      {option}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden md:flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="h-9 px-2.5 rounded-none rounded-l-md"
                aria-label="Grid view"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 2C1.22386 2 1 2.22386 1 2.5V4.5C1 4.77614 1.22386 5 1.5 5H4.5C4.77614 5 5 4.77614 5 4.5V2.5C5 2.22386 4.77614 2 4.5 2H1.5ZM6 2.5C6 2.22386 6.22386 2 6.5 2H9.5C9.77614 2 10 2.22386 10 2.5V4.5C10 4.77614 9.77614 5 9.5 5H6.5C6.22386 5 6 4.77614 6 4.5V2.5ZM11 2.5C11 2.22386 11.2239 2 11.5 2H13.5C13.7761 2 14 2.22386 14 2.5V4.5C14 4.77614 13.7761 5 13.5 5H11.5C11.2239 5 11 4.77614 11 4.5V2.5ZM1 6.5C1 6.22386 1.22386 6 1.5 6H4.5C4.77614 6 5 6.22386 5 6.5V9.5C5 9.77614 4.77614 10 4.5 10H1.5C1.22386 10 1 9.77614 1 9.5V6.5ZM6.5 6C6.22386 6 6 6.22386 6 6.5V9.5C6 9.77614 6.22386 10 6.5 10H9.5C9.77614 10 10 9.77614 10 9.5V6.5C10 6.22386 9.77614 6 9.5 6H6.5ZM11 6.5C11 6.22386 11.2239 6 11.5 6H13.5C13.7761 6 14 6.22386 14 6.5V9.5C14 9.77614 13.7761 10 13.5 10H11.5C11.2239 10 11 9.77614 11 9.5V6.5ZM1.5 11C1.22386 11 1 11.2239 1 11.5V13.5C1 13.7761 1.22386 14 1.5 14H4.5C4.77614 14 5 13.7761 5 13.5V11.5C5 11.2239 4.77614 11 4.5 11H1.5ZM6 11.5C6 11.2239 6.22386 11 6.5 11H9.5C9.77614 11 10 11.2239 10 11.5V13.5C10 13.7761 9.77614 14 9.5 14H6.5C6.22386 14 6 13.7761 6 13.5V11.5ZM11.5 11C11.2239 11 11 11.2239 11 11.5V13.5C11 13.7761 11.2239 14 11.5 14H13.5C13.7761 14 14 13.7761 14 13.5V11.5C14 11.2239 13.7761 11 13.5 11H11.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="h-9 px-2.5 rounded-none rounded-r-md"
                aria-label="List view"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 2C1.22386 2 1 2.22386 1 2.5C1 2.77614 1.22386 3 1.5 3H13.5C13.7761 3 14 2.77614 14 2.5C14 2.22386 13.7761 2 13.5 2H1.5ZM1 5.5C1 5.22386 1.22386 5 1.5 5H13.5C13.7761 5 14 5.22386 14 5.5C14 5.77614 13.7761 6 13.5 6H1.5C1.22386 6 1 5.77614 1 5.5ZM1 8.5C1 8.22386 1.22386 8 1.5 8H13.5C13.7761 8 14 8.22386 14 8.5C14 8.77614 13.7761 9 13.5 9H1.5C1.22386 9 1 8.77614 1 8.5ZM1.5 11C1.22386 11 1 11.2239 1 11.5C1 11.7761 1.22386 12 1.5 12H13.5C13.7761 12 14 11.7761 14 11.5C14 11.2239 13.7761 11 13.5 11H1.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </Button>
            </div>

            <CreateTutorialDialog onTutorialCreated={handleTutorialCreated}/>

          </div>
        </div>

        {/* Mobile filters button */}
        {/* <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFiltersOpen(true)}
          className="w-full md:hidden mb-4"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters & Sort
        </Button> */}

        {/* Tabs */}
        <div className="flex justify-between items-center border-b pb-2">
          <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full sm:w-auto justify-start overflow-x-auto">
              <TabsTrigger value="all">All Tutorials</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="hidden sm:flex h-8 gap-1 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="text-xs">Reset</span>
          </Button>
        </div>

        {/* Filter stats */}
        <div className="flex flex-wrap items-center gap-2 text-sm mt-2">
          <span className="text-muted-foreground">
            {filteredTutorials.length} {filteredTutorials.length === 1 ? 'tutorial' : 'tutorials'} found
          </span>

          {selectedCategory !== "All" && (
            <Badge variant="secondary" className="px-2 py-0 h-5">
              {selectedCategory}
              <button
                onClick={() => setSelectedCategory("All")}
                className="ml-1 hover:text-foreground"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3">
                  <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </button>
            </Badge>
          )}

          {difficultyFilter !== "All Levels" && (
            <Badge variant="secondary" className="px-2 py-0 h-5">
              {difficultyFilter}
              <button
                onClick={() => setDifficultyFilter("All Levels")}
                className="ml-1 hover:text-foreground"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3">
                  <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </button>
            </Badge>
          )}

          {searchTerm && (
            <Badge variant="secondary" className="px-2 py-0 h-5">
              Search: "{searchTerm}"
              <button
                onClick={() => setSearchTerm("")}
                className="ml-1 hover:text-foreground"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3">
                <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </button>
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {renderSkeletons()}
        </div>
      ) : filteredTutorials.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredTutorials.map((tutorial) =>
            viewMode === "grid"
              ? renderTutorialCard(tutorial)
              : renderTutorialListItem(tutorial)
          )}
        </div>
      )}

      {/* Filter Dialog */}
      {/* <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filter Tutorials</DialogTitle>
            <DialogDescription>
              Refine the tutorials list with these filters
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sort">Sort by</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="viewMode">View mode</Label>
              <div className="flex border rounded-md">
                <Button
                  type="button"
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  onClick={() => setViewMode("grid")}
                  className="flex-1 rounded-none rounded-l-md"
                >
                  Grid
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  onClick={() => setViewMode("list")}
                  className="flex-1 rounded-none rounded-r-md"
                >
                  List
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetFilters} className="mr-auto">
              Reset filters
            </Button>
            <Button onClick={() => setIsFiltersOpen(false)}>
              Apply filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setTutorialToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Tutorial"
        description="Are you sure you want to delete this tutorial? This action cannot be undone."
      />

      {/* Error Toast for failed API requests */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <div>
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setError(null)}
            className="ml-2"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Tutorials;
