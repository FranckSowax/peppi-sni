'use client';

import { useEffect, useState } from 'react';
import { Building, DollarSign, AlertTriangle, TrendingUp, Users, CheckCircle } from 'lucide-react';

interface TickerItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

const tickerData: TickerItem[] = [
  { icon: <Building className="w-4 h-4" />, label: 'Projets actifs', value: '24', color: 'text-blue-500' },
  { icon: <TrendingUp className="w-4 h-4" />, label: 'Progression moyenne', value: '67%', color: 'text-green-500' },
  { icon: <DollarSign className="w-4 h-4" />, label: 'Budget engagé', value: '12.5 Mds XAF', color: 'text-primary' },
  { icon: <Users className="w-4 h-4" />, label: 'Équipes terrain', value: '156', color: 'text-purple-500' },
  { icon: <CheckCircle className="w-4 h-4" />, label: 'Livrés ce mois', value: '3', color: 'text-emerald-500' },
  { icon: <AlertTriangle className="w-4 h-4" />, label: 'Alertes actives', value: '7', color: 'text-amber-500' },
];

export function LiveTicker() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div 
      className="bg-gray-900 text-white py-3 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="marquee"
      aria-live="polite"
    >
      <div className={`flex gap-12 animate-ticker ${isPaused ? 'pause-animation' : ''}`}>
        {/* Duplicate items for seamless loop */}
        {[...tickerData, ...tickerData].map((item, index) => (
          <div 
            key={index} 
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <span className={item.color}>{item.icon}</span>
            <span className="text-gray-400 text-sm">{item.label}:</span>
            <span className="font-semibold">{item.value}</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-ticker {
          animation: ticker 30s linear infinite;
        }
        .pause-animation {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
