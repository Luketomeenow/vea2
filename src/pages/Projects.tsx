import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, Calendar as CalendarIcon, DollarSign, Filter, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { getProjects, getProjectStats, Project } from "@/services/projectsService";
import { toast } from "sonner";

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    activeProjects: 0,
    completedThisMonth: 0,
    totalBudget: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const [projectsData, statsData] = await Promise.all([
          getProjects(user.id),
          getProjectStats(user.id),
        ]);

        setProjects(projectsData);
        if (statsData) {
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'on_hold':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case 'completed':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statsDisplay = [
    { label: "Active Projects", value: stats.activeProjects.toString(), icon: Target },
    { label: "Completed This Month", value: stats.completedThisMonth.toString(), icon: CalendarIcon },
    { label: "Total Budget", value: formatCurrency(stats.totalBudget), icon: DollarSign },
    { label: "Total Spent", value: formatCurrency(stats.totalSpent), icon: DollarSign },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Projects</h1>
            <p className="text-white/70">Manage and track your project portfolio</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsDisplay.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-sm text-white/70">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search projects..." 
                    className="pl-10" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            {filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? 'Try adjusting your search term' : 'Get started by creating your first project'}
                  </p>
                  {!searchTerm && (
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-white">{project.name}</CardTitle>
                          {project.description && (
                            <p className="text-sm text-white/70 mt-1 line-clamp-2">{project.description}</p>
                          )}
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-muted-foreground">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Budget</p>
                          <p className="font-semibold">
                            {project.budget ? formatCurrency(project.budget) : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Spent</p>
                          <p className="font-semibold">
                            {project.spent ? formatCurrency(project.spent) : '$0'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          {formatDate(project.end_date)}
                        </div>
                        <Badge 
                          variant="outline"
                          className={
                            project.priority === 'urgent' ? 'border-red-500 text-red-500' :
                            project.priority === 'high' ? 'border-orange-500 text-orange-500' :
                            project.priority === 'medium' ? 'border-yellow-500 text-yellow-500' :
                            'border-gray-500 text-gray-500'
                          }
                        >
                          {project.priority}
                        </Badge>
                      </div>

                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {project.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {project.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{project.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Projects;




