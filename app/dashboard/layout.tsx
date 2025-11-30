import { Sidebar } from '@/components/dashboard/Sidebar';
import { AIAssistant } from '@/components/ai/AIAssistant';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-64 transition-all duration-300">
        {children}
      </div>
      <AIAssistant />
    </div>
  );
}
