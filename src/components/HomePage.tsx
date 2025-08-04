import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Copyright from '../internals/components/Copyright';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CustomizedTreeView from './CustomizedTreeView';
import CustomizedDataGrid from './CustomizedDataGrid';
import HighlightedCard from './HighlightedCard';
import PageViewsBarChart from './PageViewsBarChart';
import SessionsChart from './SessionsChart';
import StatCard, { StatCardProps } from './StatCard';
import UserBookings from './UserBookings';
import RatesManager from './RatesManager';
import ConfigManager from './ConfigManager';
import BookingStatsCard from './BookingStatsCard';
import PeakHoursChart from './PeakHoursChart';
import RevenueByDateChart from './RevenueByDateChart';
import { BASE_URL, env } from "./BaseConfigs";

const data: StatCardProps[] = [
  // ... existing stat card data
];

// Define types for booking data
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
  date: string;
  transaction_id: string;
  confirmed_at: string;
}

interface BookingStats {
  totalRevenue: number;
  totalBookings: number;
  avgBookingValue: number;
  avgBookingDuration: number;
  repeatCustomers: number;
  peakHour: number;
  peakHourCount: number;
  bookingDates: { [date: string]: number };
  hourlyDistribution: { [hour: number]: number };
}

export default function HomePage() {
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [stats, setStats] = React.useState<BookingStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchBookings = async () => {
      try {   
        const response = await fetch(`${BASE_URL}/${env}/get_all_bookings/`);
        if (!response.ok) {
          throw new Error(`Failed to fetch bookings: ${response.statusText}`);
        }
        
        const result = await response.json();
        setBookings(result.data || []);
        calculateStats(result.data || []);
      } catch (err) {
        setError(err.message || 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const calculateStats = (bookings: Booking[]) => {
    if (!bookings || bookings.length === 0) {
      setStats(null);
      return;
    }

    // Calculate various statistics
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.amount, 0);
    const totalBookings = bookings.length;
    const avgBookingValue = totalRevenue / totalBookings;
    
    const durations = bookings.map(b => b.end_time - b.start_time);
    const avgBookingDuration = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
    
    // Calculate repeat customers
    const phoneCounts: { [phone: string]: number } = {};
    bookings.forEach(booking => {
      phoneCounts[booking.phone_number] = (phoneCounts[booking.phone_number] || 0) + 1;
    });
    const repeatCustomers = Object.values(phoneCounts).filter(count => count > 1).length;

    // Calculate hourly distribution
    const hourlyDistribution: { [hour: number]: number } = {};
    bookings.forEach(booking => {
      hourlyDistribution[booking.start_time] = (hourlyDistribution[booking.start_time] || 0) + 1;
    });
    
    // Find peak hour
    let peakHour = 0;
    let peakHourCount = 0;
    Object.entries(hourlyDistribution).forEach(([hour, count]) => {
      if (count > peakHourCount) {
        peakHour = parseInt(hour);
        peakHourCount = count;
      }
    });

    // Calculate revenue by date
    const bookingDates: { [date: string]: number } = {};
    bookings.forEach(booking => {
      bookingDates[booking.date] = (bookingDates[booking.date] || 0) + booking.amount;
    });

    setStats({
      totalRevenue,
      totalBookings,
      avgBookingValue,
      avgBookingDuration,
      repeatCustomers,
      peakHour,
      peakHourCount,
      bookingDates,
      hourlyDistribution
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      {/* Booking Statistics Section */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Booking Statistics
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {/* Financial Summary Cards */}
        <Grid item xs={12} sm={6} md={3} size={6}>
          <BookingStatsCard 
            title="Total Revenue"
            value={`₹ ${stats?.totalRevenue.toLocaleString() || '0'}`}
            description="All-time earnings"
            icon="₹"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3} size={6}>
          <BookingStatsCard 
            title="Total Bookings"
            value={stats?.totalBookings.toString() || '0'}
            description="Confirmed slots"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3} size={6}>
          <BookingStatsCard 
            title="Average Booking"
            value={`₹ ${stats?.avgBookingValue.toFixed(0) || '0'}`}
            description="Per slot"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3} size={6}>
          <BookingStatsCard 
            title="Repeat Customers"
            value={stats?.repeatCustomers.toString() || '0'}
            description="Loyal clients"
            icon="🔄"
          />
        </Grid>

        {/* Charts Section */}
        <Grid item xs={12} md={6} size={12}>
          <PeakHoursChart 
            data={stats ? Object.entries(stats.hourlyDistribution).map(([hour, count]) => ({
              hour: `${hour}:00`,
              bookings: count
            })) : []}
          />
        </Grid>
        
        <Grid item xs={12} md={6} size={12}>
          <RevenueByDateChart 
            data={stats ? Object.entries(stats.bookingDates).map(([date, revenue]) => ({
              date,
              revenue
            })) : []}
          />
        </Grid>
        
        {/* Additional Stats */}
        <Grid item xs={12} sm={6} size={6}>
          <BookingStatsCard 
            title="Peak Hour"
            value={`${stats?.peakHour || 0}:00`}
            description={`${stats?.peakHourCount || 0} bookings`}
            icon="⏰"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} size={6}>
          <BookingStatsCard 
            title="Avg. Duration"
            value={`${stats?.avgBookingDuration.toFixed(1) || '0'} hrs`}
            description="Per reservation"
            icon="⏱️"
          />
        </Grid>
      </Grid>

      {/* Existing content */}
      <Grid container spacing={2} columns={8}>
        <Grid item xs={12} lg={9}>
          {/* <ConfigManager /> */}
        </Grid>
      </Grid>
      
      <Copyright sx={{ my: 4 }} />
    </Box>
  );
}