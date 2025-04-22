
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface PostSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: PostFilters) => void;
}

export interface PostFilters {
  onlyImages: boolean;
  onlyVideos: boolean;
  onlyLiked: boolean;
  onlySaved: boolean;
}

export function PostSearch({ onSearch, onFilterChange }: PostSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<PostFilters>({
    onlyImages: false,
    onlyVideos: false,
    onlyLiked: false,
    onlySaved: false
  });

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleFilterChange = (key: keyof PostFilters) => {
    const newFilters = { 
      ...filters, 
      [key]: !filters[key] 
    };

    // Make sure image and video filters don't conflict
    if (key === "onlyImages" && newFilters.onlyImages) {
      newFilters.onlyVideos = false;
    } else if (key === "onlyVideos" && newFilters.onlyVideos) {
      newFilters.onlyImages = false;
    }

    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="mb-6 flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search posts by caption or username..."
          className="pl-10 pr-4"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyUp={(e) => e.key === "Enter" && handleSearch()}
        />
      </div>
      
      <Button onClick={handleSearch} className="hidden sm:flex">
        Search
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuCheckboxItem
            checked={filters.onlyImages}
            onCheckedChange={() => handleFilterChange("onlyImages")}
          >
            Only Photos
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.onlyVideos}
            onCheckedChange={() => handleFilterChange("onlyVideos")}
          >
            Only Videos
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.onlyLiked}
            onCheckedChange={() => handleFilterChange("onlyLiked")}
          >
            Posts I've Liked
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.onlySaved}
            onCheckedChange={() => handleFilterChange("onlySaved")}
          >
            Posts I've Saved
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
