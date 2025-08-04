import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { BASE_URL, env } from "./BaseConfigs";
import { GridColDef } from "@mui/x-data-grid";
import Chip from "@mui/material/Chip";
import ChartUserByTime from './ChartUserByTime';
import Box from '@mui/material/Box';
import { Button, Card, CardContent, Typography, useTheme } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Copyright from '../internals/components/Copyright';

export default function CustomizedDataGrid() {
  const theme = useTheme();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [bookings, setBookings] = React.useState([]);
  const [reload, setReload] = React.useState(0);

  React.useEffect(() => {
    const fetchAllData = async () => {
      try {
        const bookingsResponse = await fetch(`${BASE_URL}/${env}/get_all_upcoming_bookings/`);
        
        if (!bookingsResponse.ok) {
          throw new Error("Failed to fetch bookings");
        }

        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [reload]);

  function renderStatus(status: "Confirmed" | "Offline") {
    const colors: {
      [index: string]: "success" | "default";
    } = {
      Confirmed: "success",
      Offline: "default",
    };

    return <Chip label={status} color={colors[status]} size="small" />;
  }

  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.7,
      minWidth: 100,
      renderCell: (params) => renderStatus(params.value as any),
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1.2,
      minWidth: 150,
    },
    {
      field: "start_time",
      headerName: "Start Time",
      headerAlign: "left",
      align: "left",
      flex: 0.8,
      minWidth: 110,
    },
    {
      field: "end_time",
      headerName: "End Time",
      headerAlign: "left",
      align: "left",
      flex: 0.8,
      minWidth: 100,
    },
    {
      field: "amount",
      headerName: "Amount",
      headerAlign: "left",
      align: "left",
      flex: 0.9,
      minWidth: 100,
      valueFormatter: (params) => params !== undefined ? `₹ ${params}` : 'N/A',
    },
    {
      field: "booking_time",
      headerName: "Booked At",
      headerAlign: "left",
      align: "left",
      flex: 1.5,
      minWidth: 170,
    },
    {
      field: "transaction_id",
      headerName: "Transaction ID",
      headerAlign: "left",
      align: "left",
      flex: 1.5,
      minWidth: 200,
    },
    {
      field: "email",
      headerName: "Email",
      headerAlign: "left",
      align: "left",
      flex: 1.8,
      minWidth: 220,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.7,
      minWidth: 140,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          color="error"
          onClick={() => handleCancelBooking(params.row._id)}
          sx={{
            mb: 0.2,
            height: '30px',
            alignItems: 'center',
            justifyContent: 'center',
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.75rem',
            color: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.light,
            },
          }}
        >
          Cancel Booking
        </Button>
      ),
    }
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
    date: string;
    transaction_id: string;
    confirmed_at?: string;
  }

  const handleCancelBooking = async (bookingId: string) => {
    const confirm = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirm) return;

    try {
      const response = await fetch(`${BASE_URL}/${env}/delete_booking_by_id/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ booking_id: bookingId }),
      });

      const data = await response.json();

      if (response.ok) {
        setBookings(prevBookings => prevBookings.filter(booking => booking._id !== bookingId));
        alert("Booking cancelled successfully.");
        setReload(prev => prev + 1);
      } else {
        alert(data.message || "Failed to cancel booking.");
      }
    } catch (err) {
      alert("Error cancelling booking.");
    }
  };

  function formatBookingData(bookings: Booking[]): Booking[] {
    return bookings.map((booking) => {
      const [day, month, year] = booking.date.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day);
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });

      const formatTime = (hour: number): string => {
        const period = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour} ${period}`;
      };

      const bookingTime = new Date(booking.booking_time);
      const formattedBookingTime = bookingTime.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      return {
      _id: booking._id,
      name: booking.name,
      date: formattedDate,
      start_time: formatTime(booking.start_time),
      end_time: formatTime(booking.end_time),
      amount: booking.amount, // ✅ Explicitly added
      status: booking.status,
      booking_time: formattedBookingTime,
      transaction_id: booking.transaction_id,
      email: booking.email,
      phone_number: booking.phone_number,
      ...(booking.confirmed_at && {
        confirmed_at: new Date(booking.confirmed_at).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      }),
    };
  });
}

  return (
    
    <>
      <Box sx={{ 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2,
        overflow: 'hidden'
      }}>

      <div role="presentation">
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/">
            Home
          </Link>
          <Typography sx={{ color: 'text.primary' }}>Upcoming Bookings</Typography>
        </Breadcrumbs>
      </div>

      {loading ? (
          <Box sx={{ 
            height: 400, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ 
            height: 200, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            p: 1
          }}>
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => setReload(prev => prev + 1)}
            >
              Retry
            </Button>
          </Box>
        ) : (
          <DataGrid
      checkboxSelection
      rows={formatBookingData(bookings)} // Changed from 'rows' to 'bookings' which is your actual data
      columns={columns}
      getRowId={(row) => row._id} // This tells DataGrid to use the _id field as the unique identifier
      getRowClassName={(params) =>
        params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
      }
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 10,
          },
        },
      }}
      pageSizeOptions={[10, 20, 50]}
      // disableColumnResize
      density="compact"
      loading={loading} // Added loading state
      slotProps={{
        filterPanel: {
          filterFormProps: {
            logicOperatorInputProps: {
              variant: "outlined",
              size: "small",
            },
            columnInputProps: {
              variant: "outlined",
              size: "small",
              sx: {
                mt: "auto",
              },
            },
            operatorInputProps: {
              variant: "outlined",
              size: "small",
              sx: {
                mt: "auto",
              },
            },
            valueInputProps: {
              InputComponentProps: {
                variant: "outlined",
                size: "small",
              },
            },
          },
        },
      }}
      />
    )}
    <ChartUserByTime key={reload} bookings={bookings} />
    <Copyright />
    </Box>
    </>
  );
}