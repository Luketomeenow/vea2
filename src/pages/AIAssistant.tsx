import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AIChat } from "@/components/dashboard/AIChat";

const AIAssistant = () => {
  const location = useLocation();
  const initialQuery = useRef<string | null>(
    (location.state as { aiQuery?: string })?.aiQuery || null
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <AIChat initialQuery={initialQuery.current} />
      </div>
    </DashboardLayout>
  );
};

export default AIAssistant;




