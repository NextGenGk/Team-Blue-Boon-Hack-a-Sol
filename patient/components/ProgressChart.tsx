"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Activity } from "lucide-react";

interface ProgressItem {
  completion_percentage: number;
  date: string;
}

interface ProgressChartProps {
  data: ProgressItem[];
  loading?: boolean;
}

export default function ProgressChart({ data, loading = false }: ProgressChartProps) {
  // Prepare chart data
  const chartData = data && data.length > 0 
    ? data
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
          completion: item.completion_percentage
        }))
    : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Completion Rate Over Time
        </h3>
        
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#666' }}
                angle={-45}
                textAnchor="end"
                height={80}
                stroke="#ccc"
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 12, fill: '#666' }}
                label={{ 
                  value: 'Completion Rate (%)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: '#666' }
                }}
                stroke="#ccc"
              />
              <Tooltip 
                formatter={(value: any) => [`${value}%`, 'Completion Rate']}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="completion" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-medium text-gray-700 mb-2">No Data Available</h4>
            <p className="text-gray-500">No completion rate data found for display.</p>
          </div>
        )}
      </div>
    </div>
  );
}