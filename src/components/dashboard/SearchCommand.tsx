import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Search, FileText, Users, Calendar, Target, DollarSign } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'project' | 'customer' | 'task' | 'document' | 'financial';
  icon: React.ReactNode;
}

const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    title: 'Website Redesign',
    description: 'Project for ABC Corp - Due in 2 days',
    type: 'project',
    icon: <Target className="h-4 w-4" />,
  },
  {
    id: '2',
    title: 'John Smith',
    description: 'CEO at TechStart Inc.',
    type: 'customer',
    icon: <Users className="h-4 w-4" />,
  },
  {
    id: '3',
    title: 'Review Design Mockups',
    description: 'High priority task - Due today',
    type: 'task',
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    id: '4',
    title: 'Q3 Financial Report',
    description: 'PDF document - 2.3 MB',
    type: 'document',
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: '5',
    title: 'Invoice #1234',
    description: '$5,000 - Paid',
    type: 'financial',
    icon: <DollarSign className="h-4 w-4" />,
  },
];

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResults = mockSearchResults.filter(result =>
    result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    result.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedResults = filteredResults.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const getGroupTitle = (type: string) => {
    switch (type) {
      case 'project': return 'Projects';
      case 'customer': return 'Customers';
      case 'task': return 'Tasks';
      case 'document': return 'Documents';
      case 'financial': return 'Financial';
      default: return 'Other';
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start text-muted-foreground min-w-0"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Search everything...
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search projects, customers, tasks..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {Object.entries(groupedResults).map(([type, results], index) => (
            <div key={type}>
              {index > 0 && <CommandSeparator />}
              <CommandGroup heading={getGroupTitle(type)}>
                {results.map((result) => (
                  <CommandItem
                    key={result.id}
                    className="flex items-center space-x-3 p-3 cursor-pointer"
                    onSelect={() => {
                      console.log('Selected:', result);
                      setOpen(false);
                    }}
                  >
                    {result.icon}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{result.title}</p>
                      <p className="text-xs text-muted-foreground">{result.description}</p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}




