import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, Calendar as CalendarIcon, Users, DollarSign, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Projects = () => {
  const projects = [
    { id: 1, name: "Website Redesign", client: "ABC Corporation", status: "In Progress", progress: 75, budget: "$45,000", deadline: "Jan 15, 2025", team: ["John", "Sarah", "Mike"], priority: "High" },
    { id: 2, name: "Mobile App Development", client: "Tech Solutions Inc", status: "Planning", progress: 25, budget: "$85,000", deadline: "Mar 30, 2025", team: ["Alex", "Emma", "David", "Lisa"], priority: "High" },
  ];

  const stats = [
    { label: "Active Projects", value: "8", icon: Target },
    { label: "Completed This Month", value: "12", icon: CalendarIcon },
    { label: "Team Members", value: "24", icon: Users },
    { label: "Total Budget", value: "$340K", icon: DollarSign },
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
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
              <Input placeholder="Search projects..." className="pl-10" />
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-white">{project.name}</CardTitle>
                    <p className="text-sm text-white/70">{project.client}</p>
                  </div>
                  <Badge variant="default">{project.status}</Badge>
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Projects;




