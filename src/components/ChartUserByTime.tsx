import * as React from 'react';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SunnySnowingIcon from '@mui/icons-material/SunnySnowing';
import LightModeIcon from '@mui/icons-material/LightMode';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import NightsStayIcon from '@mui/icons-material/NightsStay';

interface StyledTextProps {
  variant: 'primary' | 'secondary';
}

const StyledText = styled('text', {
  shouldForwardProp: (prop) => prop !== 'variant',
})<StyledTextProps>(({ theme }) => ({
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fill: (theme.vars || theme).palette.text.secondary,
  variants: [
    {
      props: {
        variant: 'primary',
      },
      style: {
        fontSize: theme.typography.h5.fontSize,
      },
    },
    {
      props: ({ variant }) => variant !== 'primary',
      style: {
        fontSize: theme.typography.body2.fontSize,
      },
    },
    {
      props: {
        variant: 'primary',
      },
      style: {
        fontWeight: theme.typography.h5.fontWeight,
      },
    },
    {
      props: ({ variant }) => variant !== 'primary',
      style: {
        fontWeight: theme.typography.body2.fontWeight,
      },
    },
  ],
}));

const colors = [
  'hsl(220, 20%, 65%)',
  'hsl(220, 20%, 42%)',
  'hsl(220, 20%, 35%)',
  'hsl(220, 20%, 25%)',
];

interface Booking {
  _id: string;
  start_time: number;
  end_time: number;
  amount: number;
  email: string;
  phone_number: string;
  name: string;
  status: string;
  booking_time: string;
  date: string; // Format: "DD-MM-YYYY"
  transaction_id: string;
  confirmed_at?: string;
}

export default function ChartUserByTime({ bookings }: { bookings: Booking[] }) {
  function countBookingsByTimeOfDay(bookings: Booking[]) {
    // Get today's date at start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate end date (6 days from today at end of day)
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    const counts = {
        midnight: 0,  // 0-6
        morning: 0,   // 6-12
        afternoon: 0, // 12-17
        evening: 0,   // 17-19
        night: 0,     // 19-24
        total: 0
    };

    bookings.forEach(booking => {
        // Parse booking date (DD-MM-YYYY)
        const [day, month, year] = booking.date.split("-").map(Number);
        if (isNaN(day) || isNaN(month) || isNaN(year)) return;

        const bookingDate = new Date(year, month - 1, day);
        bookingDate.setHours(12); // Avoid timezone issues
        
        // Check if booking is within next 7 days
        if (bookingDate >= today && bookingDate <= endDate) {
            counts.total++;
            const hour = booking.start_time;

            if (hour >= 0 && hour < 6) counts.midnight++;
            else if (hour >= 6 && hour < 12) counts.morning++;
            else if (hour >= 12 && hour < 17) counts.afternoon++;
            else if (hour >= 17 && hour < 19) counts.evening++;
            else if (hour >= 19 && hour < 24) counts.night++;
        }
    });

    return counts;
}

  const counts = countBookingsByTimeOfDay(bookings);
  const totalBookings = counts.total;

  const getPercentage = (count: number) =>
    totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0;

  const timeData = [
    {
      name: 'Midnight: 12AM - 6AM ',
      count: counts.midnight,
      percentage: getPercentage(counts.midnight),
      icon: <DarkModeIcon />,
      color: 'hsl(240, 70%, 60%)',
    },
    {
      name: 'Morning: 6AM - 12PM',
      count: counts.morning,
      percentage: getPercentage(counts.morning),
      icon: <SunnySnowingIcon />,
      color: 'hsl(240, 70%, 60%)',
    },
    {
      name: 'Afternoon: 12PM - 5PM',
      count: counts.afternoon,
      percentage: getPercentage(counts.afternoon),
      icon: <LightModeIcon />,
      color: 'hsl(240, 70%, 60%)',
    },
    {
      name: 'Evening: 5PM - 7PM',
      count: counts.evening,
      percentage: getPercentage(counts.evening),
      icon: <WbTwilightIcon />,
      color: 'hsl(240, 70%, 60%)',
    },
    {
      name: 'Night: 7PM - 12AM',
      count: counts.night,
      percentage: getPercentage(counts.night),
      icon: <NightsStayIcon />,
      color: 'hsl(240, 70%, 60%)',
    }
  ];

  return (
    <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" sx={{ mb: 2 }}>
          Bookings by Time of Day (This Week)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Total bookings this week: {totalBookings}
        </Typography>

        {timeData.map((time, index) => (
          <Stack key={index} direction="row" sx={{ alignItems: 'center', gap: 2, pb: 2 }}>
            {time.icon}
            <Stack sx={{ gap: 1, flexGrow: 1 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: '500' }}>
                  {time.name} ({time.count})
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {time.percentage}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={time.percentage}
                sx={{
                  [`& .${linearProgressClasses.bar}`]: {
                    backgroundColor: time.color,
                  },
                }}
              />
            </Stack>
          </Stack>
        ))}
      </CardContent>
    </Card>
  );
}
