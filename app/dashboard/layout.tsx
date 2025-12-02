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
      {/* Responsive padding: mobile = 0, desktop = sidebar width */}
      <div className="lg:pl-64 pl-0 pt-16 lg:pt-0 transition-all duration-300">
        {children}
      </div>
      <AIAssistant />
    </div>
  );
}
