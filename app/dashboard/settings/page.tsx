'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Bell, Shield, Palette } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'appearance', label: 'Apparence', icon: Palette },
  ];

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Paramètres" 
        subtitle="Gérez votre compte et vos préférences" 
      />
      
      <main className="p-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>Informations du Profil</CardTitle>
                  <CardDescription>Mettez à jour vos informations personnelles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-10 h-10 text-gray-400" />
                    </div>
                    <Button variant="outline">Changer la photo</Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nom complet</Label>
                      <Input id="fullName" placeholder="Votre nom" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="votre@email.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input id="phone" placeholder="+241 XX XX XX XX" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Rôle</Label>
                      <Input id="role" value="Direction Générale" disabled />
                    </div>
                  </div>

                  <Button>Sauvegarder les modifications</Button>
                </CardContent>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Préférences de Notifications</CardTitle>
                  <CardDescription>Configurez comment vous recevez les alertes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { title: 'Alertes critiques', description: 'Notifications pour les alertes de haute priorité' },
                    { title: 'Mises à jour projets', description: 'Changements de statut des projets' },
                    { title: 'Messages terrain', description: 'Nouveaux messages WhatsApp' },
                    { title: 'Rapports', description: 'Rapports générés et planifiés' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle>Sécurité du Compte</CardTitle>
                  <CardDescription>Gérez votre mot de passe et la double authentification</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Changer le mot de passe</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                        <Input id="currentPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                        <Input id="newPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                        <Input id="confirmPassword" type="password" />
                      </div>
                    </div>
                    <Button>Mettre à jour le mot de passe</Button>
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Double authentification (2FA)</h3>
                        <p className="text-sm text-gray-500">Ajoutez une couche de sécurité supplémentaire</p>
                      </div>
                      <Button variant="outline">Activer</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'appearance' && (
              <Card>
                <CardHeader>
                  <CardTitle>Apparence</CardTitle>
                  <CardDescription>Personnalisez l&apos;interface</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Thème</h3>
                    <div className="flex gap-3">
                      <button className="p-4 border-2 border-primary rounded-lg">
                        <div className="w-16 h-10 bg-white border rounded mb-2" />
                        <span className="text-sm">Clair</span>
                      </button>
                      <button className="p-4 border rounded-lg hover:border-gray-400">
                        <div className="w-16 h-10 bg-gray-900 rounded mb-2" />
                        <span className="text-sm">Sombre</span>
                      </button>
                      <button className="p-4 border rounded-lg hover:border-gray-400">
                        <div className="w-16 h-10 bg-gradient-to-r from-white to-gray-900 rounded mb-2" />
                        <span className="text-sm">Système</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Sidebar</h3>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">Réduire automatiquement sur mobile</span>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
