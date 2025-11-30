'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const data = [
  { month: 'Jan', budget: 4000, depenses: 2400 },
  { month: 'Fév', budget: 3000, depenses: 1398 },
  { month: 'Mar', budget: 2000, depenses: 9800 },
  { month: 'Avr', budget: 2780, depenses: 3908 },
  { month: 'Mai', budget: 1890, depenses: 4800 },
  { month: 'Jun', budget: 2390, depenses: 3800 },
];

export function FinancialChart() {
  return (
    <div className="bg-white rounded-xl border h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900">Santé Financière</h3>
        <p className="text-sm text-gray-500">Budget vs Dépenses (en millions XAF)</p>
      </div>
      <div className="p-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="budget" name="Budget" fill="#f5821f" radius={[4, 4, 0, 0]} />
            <Bar dataKey="depenses" name="Dépenses" fill="#00529b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
