import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

interface BookingStatsCardProps {
  title: string;
  value: string;
  description: string;
  icon?: string;
  customContent?: React.ReactNode; // Added
}

export default function BookingStatsCard({ 
  title, 
  value, 
  description, 
  icon,
  customContent 
}: BookingStatsCardProps) {
  return (
    <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>

        <Typography variant="h6" fontWeight="bold">
          {value}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>

        {customContent && (
          <Box sx={{ mt: 2 }}>
            {customContent}
          </Box>
        )}
      </Box>
    </Paper>
  );
}
