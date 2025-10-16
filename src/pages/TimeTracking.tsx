import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  DollarSign, 
  Download,
  Plus,
  Timer,
  Target,
  TrendingUp,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { getTimeEntries, getTimeTrackingSummary, TimeEntry as TimeEntryType } from "@/services/timeTrackingService";

interface TimeEntry {
  id: string;
  project: string;
  client: string;
  task: string;
  startTime: string;
  endTime: string | null;
  duration: number; // in minutes
  hourlyRate: number;
  billable: boolean;
  description: string;
  date: string;
  status: 'running' | 'completed' | 'paused';
}

const TimeTracking = () => {
  const { toast } = useToast();
  const [currentTimer, setCurrentTimer] = useState<TimeEntry | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([
    {
      id: '1',
      project: 'Website Redesign',
      client: 'ABC Corporation',
      task: 'Frontend Development',
      startTime: '2024-01-15T09:00:00',
      endTime: '2024-01-15T12:30:00',
      duration: 210,
      hourlyRate: 85,
      billable: true,
      description: 'Implemented responsive navigation and hero section',
      date: '2024-01-15',
      status: 'completed'
    },
  ]);

  const [newEntry, setNewEntry] = useState({
    project: '',
    client: '',
    task: '',
    hourlyRate: 85,
    billable: true,
    description: ''
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentTimer?.status === 'running') {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentTimer?.status]);

  const startTimer = () => {
    if (!newEntry.project || !newEntry.client || !newEntry.task) {
      toast({
        title: "Missing Information",
        description: "Please fill in project, client, and task details",
        variant: "destructive"
      });
      return;
    }

    const timer: TimeEntry = {
      id: Date.now().toString(),
      ...newEntry,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      date: new Date().toISOString().split('T')[0],
      status: 'running'
    };

    setCurrentTimer(timer);
    setElapsedTime(0);
    setIsDialogOpen(false);
    
    toast({
      title: "Timer Started",
      description: `Started tracking time for ${newEntry.task}`
    });
  };

  const pauseTimer = () => {
    if (currentTimer) {
      setCurrentTimer({
        ...currentTimer,
        status: 'paused',
        duration: elapsedTime / 60
      });
    }
  };

  const stopTimer = () => {
    if (currentTimer) {
      const completedEntry: TimeEntry = {
        ...currentTimer,
        endTime: new Date().toISOString(),
        duration: elapsedTime / 60,
        status: 'completed'
      };

      setTimeEntries([completedEntry, ...timeEntries]);
      setCurrentTimer(null);
      setElapsedTime(0);
      
      toast({
        title: "Timer Stopped",
        description: `Time logged: ${formatDuration(elapsedTime / 60)} - $${(elapsedTime / 60 * currentTimer.hourlyRate / 60).toFixed(2)} earned`
      });
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const todayEntries = timeEntries.filter(entry => entry.date === new Date().toISOString().split('T')[0]);
  const totalHoursToday = todayEntries.reduce((sum, entry) => sum + entry.duration, 0) / 60;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Timer className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Time Tracking</h1>
              <p className="text-white/70">Track billable hours and manage your time</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Card className="border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Clock className="w-5 h-5 mr-2" />
              {currentTimer ? 'Active Timer' : 'Start New Timer'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentTimer ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-mono font-bold text-white mb-2">
                    {formatTime(elapsedTime)}
                  </div>
                  <p className="text-white/70">{currentTimer.project} - {currentTimer.task}</p>
                  <p className="text-sm text-white/50">{currentTimer.client}</p>
                </div>
                
                <div className="flex justify-center space-x-2">
                  {currentTimer.status === 'running' ? (
                    <Button onClick={pauseTimer} variant="outline" className="text-white border-white/20 hover:bg-white/10">
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button onClick={() => setCurrentTimer({...currentTimer, status: 'running'})} variant="outline" className="text-white border-white/20 hover:bg-white/10">
                      <Play className="w-4 h-4 mr-2" />
                      Resume
                    </Button>
                  )}
                  <Button onClick={stopTimer} variant="destructive">
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90">
                      <Play className="w-4 h-4 mr-2" />
                      Start Timer
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Start Time Tracking</DialogTitle>
                      <DialogDescription>Fill in the details to start tracking your time</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="project">Project</Label>
                        <Input
                          id="project"
                          value={newEntry.project}
                          onChange={(e) => setNewEntry({...newEntry, project: e.target.value})}
                          placeholder="Project name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="client">Client</Label>
                        <Input
                          id="client"
                          value={newEntry.client}
                          onChange={(e) => setNewEntry({...newEntry, client: e.target.value})}
                          placeholder="Client name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="task">Task</Label>
                        <Input
                          id="task"
                          value={newEntry.task}
                          onChange={(e) => setNewEntry({...newEntry, task: e.target.value})}
                          placeholder="Task description"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                          <Input
                            id="hourlyRate"
                            type="number"
                            value={newEntry.hourlyRate}
                            onChange={(e) => setNewEntry({...newEntry, hourlyRate: Number(e.target.value)})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="billable">Billable</Label>
                          <Select value={newEntry.billable.toString()} onValueChange={(value) => setNewEntry({...newEntry, billable: value === 'true'})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Yes - Billable</SelectItem>
                              <SelectItem value="false">No - Internal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input
                          id="description"
                          value={newEntry.description}
                          onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                          placeholder="What are you working on?"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button onClick={startTimer}>Start Timer</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Hours Today</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalHoursToday.toFixed(1)}h</div>
              <p className="text-xs text-white/70">Tracked today</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">Recent Time Entries</CardTitle>
            <CardDescription className="text-white/70">Your tracked time and earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-white">{entry.project} - {entry.task}</h3>
                      {entry.billable && <Badge variant="default">Billable</Badge>}
                    </div>
                    <p className="text-sm text-white/70">{entry.client}</p>
                    <p className="text-sm text-white/50">{entry.description}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium text-white">{formatDuration(entry.duration)}</p>
                        <p className="text-sm text-white/70">{new Date(entry.date).toLocaleDateString()}</p>
                      </div>
                      {entry.billable && (
                        <div>
                          <p className="font-bold text-primary">${(entry.duration / 60 * entry.hourlyRate).toFixed(2)}</p>
                          <p className="text-sm text-white/70">${entry.hourlyRate}/hr</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TimeTracking;


