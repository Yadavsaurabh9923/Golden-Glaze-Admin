import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

interface PeakHoursChartProps {
  data: { hour: string; bookings: number }[];
}

export default function PeakHoursChart({ data }: PeakHoursChartProps) {
  // Calculate minimum width for the chart based on number of data points
  const minChartWidth = Math.max(100, data.length * 60); // 80px per bar (adjust as needed)
  
  return (
    <Paper elevation={2} sx={{ p: 2, height: 300, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }} gutterBottom>
        Bookings by Hour
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
            <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 5 }}>
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                formatter={(value) => [value, 'Bookings']}
              />
              <Bar dataKey="bookings" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Paper>
  );
}