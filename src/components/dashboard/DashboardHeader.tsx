import { User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationDropdown } from "./NotificationDropdown";
import { SearchCommand } from "./SearchCommand";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export function DashboardHeader() {
  const { toast } = useToast();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleUserAction = (action: string) => {
    toast({
      title: `${action} clicked`,
      description: "This would navigate to the respective page",
    });
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/login");
    }
  };

  // Get user initials for avatar fallback
  const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center space-x-4">
        <SidebarTrigger />
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="w-80 max-w-sm">
          <SearchCommand />
        </div>
        
        {/* Notifications */}
        <NotificationDropdown />
        
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || user?.email || 'User'} />
                <AvatarFallback>{getInitials(profile?.full_name, user?.email)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'No email'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleUserAction("Profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleUserAction("Settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}




