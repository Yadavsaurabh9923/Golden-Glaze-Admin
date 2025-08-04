import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

interface RevenueByDateChartProps {
  data: { date: string; revenue: number }[];
}

export default function RevenueByDateChart({ data }: RevenueByDateChartProps) {
  // Calculate minimum width for the chart based on number of data points
  const minChartWidth = Math.max(100, data.length * 60); // 80px per bar (adjust as needed)
  
  return (
    <Paper elevation={2} sx={{ p: 2, height: 300, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }} gutterBottom>
        Revenue by Date
      </Typography>
      
      {/* Scrollable container */}
      <div style={{ 
        flex: 1, 
        overflowX: 'auto', 
        overflowY: 'hidden',
        position: 'relative'
      }}>
        {/* Chart with dynamic width */}
        <div style={{ minWidth: minChartWidth, height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 10, left: 0, bottom: 2 }}>
              <XAxis dataKey="date" />
              <YAxis/>
              <Tooltip 
                formatter={(value) => [`₹${value}`, 'Revenue']} 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              />
              <Bar dataKey="revenue" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Paper>
  );
}