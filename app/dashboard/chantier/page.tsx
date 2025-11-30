import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HardHat, MessageSquare, Image, AlertTriangle, User, Camera, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';

const projects = [
  { id: 1, name: 'Résidence Okoumé', progress: 75, status: 'on_track', lastUpdate: 'Il y a 2h' },
  { id: 2, name: 'Marina Bay', progress: 45, status: 'delayed', lastUpdate: 'Il y a 4h' },
  { id: 3, name: 'Centre Commercial Akanda', progress: 90, status: 'on_track', lastUpdate: 'Il y a 1h' },
  { id: 4, name: 'Logements Sociaux Ntoum', progress: 30, status: 'on_track', lastUpdate: 'Hier' },
];

const messages = [
  { id: 1, sender: 'Jean Mbourou', project: 'Résidence Okoumé', message: 'Coulage béton terminé bloc A', type: 'text', time: '10:45' },
  { id: 2, sender: 'Marie Ndong', project: 'Marina Bay', message: '📷 3 photos envoyées', type: 'image', time: '09:30' },
  { id: 3, sender: 'Pierre Ondo', project: 'Centre Commercial', message: '⚠️ Retard livraison ciment', type: 'alert', time: '08:15' },
  { id: 4, sender: 'Sophie Ella', project: 'Résidence Okoumé', message: 'Équipe complète, début toiture', type: 'text', time: '07:00' },
  { id: 5, sender: 'Paul Nzeng', project: 'Logements Ntoum', message: 'Fondations terminées à 100%', type: 'text', time: 'Hier' },
];

const statusConfig = {
  on_track: { label: 'Dans les temps', color: 'text-green-600 bg-green-100' },
  delayed: { label: 'En retard', color: 'text-red-600 bg-red-100' },
  ahead: { label: 'En avance', color: 'text-blue-600 bg-blue-100' },
};

export default function ChantierPage() {
  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Chantier / WhatsApp" 
        subtitle="Suivi terrain en temps réel" 
      />
      
      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardHat className="w-5 h-5 text-primary" />
                Projets
              </CardTitle>
              <CardDescription>Sélectionnez un projet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {projects.map((project) => {
                const status = statusConfig[project.status as keyof typeof statusConfig];
                return (
                  <div
                    key={project.id}
                    className="p-3 rounded-lg border hover:border-primary cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{project.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{project.progress}%</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{project.lastUpdate}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* WhatsApp Feed */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-green-500" />
                    Feed WhatsApp
                  </CardTitle>
                  <CardDescription>Messages terrain en direct</CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-600">Live</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Messages */}
              <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{msg.sender}</span>
                        <span className="text-xs text-gray-400">• {msg.time}</span>
                      </div>
                      <p className="text-xs text-primary">{msg.project}</p>
                      <div className="mt-1 p-2 bg-gray-50 rounded-lg">
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button variant="ghost" size="icon">
                  <Camera className="w-5 h-5" />
                </Button>
                <Input placeholder="Envoyer un message..." className="flex-1" />
                <Button size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
