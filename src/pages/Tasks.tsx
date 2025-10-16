import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, Search, Calendar, Tag, CheckCircle2, Circle, Trash2, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { getTasks, createTask, updateTask, deleteTask, toggleTaskStatus, TaskWithProject } from "@/services/tasksService";

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    status: "todo" | "in_progress" | "review" | "done" | "blocked";
    priority: "low" | "medium" | "high" | "urgent";
    due_date: string;
    project_id: string;
  }>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    due_date: "",
    project_id: "",
  });

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const tasksData = await getTasks(user.id);
        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user?.id]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateTask = async () => {
    if (!newTask.title.trim() || !user?.id) return;
    
    try {
      const createdTask = await createTask(user.id, newTask);
      
      if (createdTask) {
        setTasks([createdTask, ...tasks]);
        setNewTask({
          title: "",
          description: "",
          status: "todo",
          priority: "medium",
          due_date: "",
          project_id: "",
        });
        setIsDialogOpen(false);
        toast.success("Task created successfully");
      } else {
        toast.error("Failed to create task");
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error("Failed to create task");
    }
  };

  const handleStatusToggle = async (taskId: string, currentStatus: string) => {
    try {
      const success = await toggleTaskStatus(taskId, currentStatus);
      
      if (success) {
        setTasks(tasks.map(task => 
          task.id === taskId 
            ? { ...task, status: currentStatus === 'done' ? 'todo' : 'done' as const, completed_at: currentStatus === 'done' ? null : new Date().toISOString() }
            : task
        ));
        toast.success("Task status updated");
      } else {
        toast.error("Failed to update task");
      }
    } catch (error) {
      console.error('Error toggling task status:', error);
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const success = await deleteTask(taskId);
      
      if (success) {
        setTasks(tasks.filter(task => task.id !== taskId));
        toast.success("Task deleted successfully");
      } else {
        toast.error("Failed to delete task");
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error("Failed to delete task");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done": return "default";
      case "in_progress": return "secondary";
      case "review": return "secondary";
      case "todo": return "outline";
      case "blocked": return "destructive";
      default: return "outline";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Tasks</h1>
            <p className="text-white/70">Manage your tasks and projects</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Add a new task to your workflow
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Task title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Task description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={newTask.priority} 
                      onValueChange={(value: "low" | "medium" | "high") => setNewTask({...newTask, priority: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTask}>Create Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Loading tasks...</p>
            </div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "No tasks found matching your criteria" 
                  : "No tasks yet. Create your first task to get started!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusToggle(task.id, task.status)}
                        className="p-0 h-auto"
                      >
                        {task.status === "done" ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </Button>
                      <div>
                        <CardTitle className={`text-lg ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {task.description}
                        </CardDescription>
                        {task.project_name && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Project: {task.project_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-4 flex-wrap gap-2">
                      <Badge variant={getPriorityColor(task.priority)}>
                        <Tag className="h-3 w-3 mr-1" />
                        {task.priority}
                      </Badge>
                      <Badge variant={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex gap-1">
                          {task.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    {task.due_date && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(task.due_date)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Tasks;


