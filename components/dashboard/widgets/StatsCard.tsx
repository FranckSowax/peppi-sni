import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-primary',
  iconBgColor = 'bg-primary/10',
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border p-3 sm:p-4 md:p-6">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm text-gray-500 mb-1 truncate">{title}</p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p
              className={cn(
                'text-xs sm:text-sm mt-1 truncate',
                changeType === 'positive' && 'text-green-600',
                changeType === 'negative' && 'text-red-600',
                changeType === 'neutral' && 'text-gray-500'
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className={cn('w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0', iconBgColor)}>
          <Icon className={cn('w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6', iconColor)} />
        </div>
      </div>
    </div>
  );
}
