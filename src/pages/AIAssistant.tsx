import { DashboardLayout } from "@/components/DashboardLayout";
import { AIChat } from "@/components/dashboard/AIChat";

const AIAssistant = () => {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <AIChat />
      </div>
    </DashboardLayout>
  );
};

export default AIAssistant;




