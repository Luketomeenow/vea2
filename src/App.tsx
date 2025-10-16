import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import DiagnosticTest from "./pages/DiagnosticTest";
import Dashboard from "./pages/Dashboard";
import AIAssistant from "./pages/AIAssistant";
import Analytics from "./pages/Analytics";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Customers from "./pages/Customers";
import Finances from "./pages/Finances";
import CashFlow from "./pages/CashFlow";
import TimeTracking from "./pages/TimeTracking";
import Calendar from "./pages/Calendar";
import Documents from "./pages/Documents";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="dark">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/diagnostic" element={<DiagnosticTest />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
            <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
            <Route path="/finances" element={<ProtectedRoute><Finances /></ProtectedRoute>} />
            <Route path="/cash-flow" element={<ProtectedRoute><CashFlow /></ProtectedRoute>} />
            <Route path="/time-tracking" element={<ProtectedRoute><TimeTracking /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
