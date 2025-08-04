import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { columns, rows } from '../internals/data/gridData';

export default function CustomizedDataGrid() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Add this state declaration near the top with other states
  const [operationalConfigs, setOperationalConfigs] = React.useState({
    weekday_start: 5,
    weekday_end: 24,
    weekend_start: 5,
    weekend_end: 24,
  });

  React.useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [configsResponse, bookingsResponse, ratesResponse] = await Promise.all([
          fetch(`${BASE_URL}/${env}/get_configs/`),
          fetch(`${BASE_URL}/${env}/get_all_bookings/`),
          fetch(`${BASE_URL}/${env}/get_rates/`)
        ]);
        
        // Check all responses
        if (!configsResponse.ok || !bookingsResponse.ok || !ratesResponse.ok) {
          throw new Error('One or more API requests failed');
        }

        setDataFetch(true);
  
        // Parse all JSON data
        const [configData, bookingsData, ratesData] = await Promise.all([
          configsResponse.json(),
          bookingsResponse.json(),
          ratesResponse.json()
        ]);
        
        // Process configs
        const newOperationalConfigs = {
          weekday_start: configData.data.find(c => c.configName === 'WEEKDAY_START')?.configValue ?? 5,
          weekday_end: configData.data.find(c => c.configName === 'WEEKDAY_END')?.configValue ?? 24,
          weekend_start: configData.data.find(c => c.configName === 'WEEKEND_START')?.configValue ?? 5,
          weekend_end: configData.data.find(c => c.configName === 'WEEKEND_END')?.configValue ?? 24,
        };

        // Update operational configs state
        setOperationalConfigs(newOperationalConfigs);
        setBookings(bookingsData.data);  // Add state: const [bookings, setBookings] = useState([])

        const weekdayRates = {
          Morning: Number(ratesData.data.find(c => c.session === 'WEEKDAY_MORNING_RATE')?.rate) || 500,
          Afternoon: Number(ratesData.data.find(c => c.session === 'WEEKDAY_AFTERNOON_RATE')?.rate) || 500,
          Night: Number(ratesData.data.find(c => c.session === 'WEEKDAY_NIGHT_RATE')?.rate) || 500,
        };
        
        const weekendRates = {
          Morning: Number(ratesData.data.find(c => c.session === 'WEEKEND_MORNING_RATE')?.rate) || 500,
          Afternoon: Number(ratesData.data.find(c => c.session === 'WEEKEND_AFTERNOON_RATE')?.rate) || 500,
          Night: Number(ratesData.data.find(c => c.session === 'WEEKEND_NIGHT_RATE')?.rate) || 500,
        };

        // Now determine day type and set slot prices (assumes selectedDate is already set)
        if (selectedDate) {
          const dayType = getDayType(selectedDate);
          const slotPrices = dayType === 'weekend' ? weekendRates : weekdayRates;
        }

        // Save the fetched rates as state if needed
        setRates(ratesData.data);

        // Set Booked Slots
        const extractedTimes = bookingsData.data.filter(booking => booking.status === 'Confirmed').map(booking => ({start: booking.start_time,end: booking.end_time}));
        // Use a Set to store only unique values
        // const uniqueSortedTimes = [...new Set(extractedTimes)].sort((a, b) => a - b);

        const held = bookingsData.data.filter(booking => booking.status === 'Hold').map(booking => ({start: booking.start_time,end: booking.end_time}));
        setHeldSlots(held)
        
        setBookedSlots(extractedTimes);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchAllData();
  }, []);

  return (
    <DataGrid
      checkboxSelection
      rows={rows}
      columns={columns}
      getRowClassName={(params) =>
        params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
      }
      initialState={{
        pagination: { paginationModel: { pageSize: 20 } },
      }}
      pageSizeOptions={[10, 20, 50]}
      disableColumnResize
      density="compact"
      slotProps={{
        filterPanel: {
          filterFormProps: {
            logicOperatorInputProps: {
              variant: 'outlined',
              size: 'small',
            },
            columnInputProps: {
              variant: 'outlined',
              size: 'small',
              sx: { mt: 'auto' },
            },
            operatorInputProps: {
              variant: 'outlined',
              size: 'small',
              sx: { mt: 'auto' },
            },
            valueInputProps: {
              InputComponentProps: {
                variant: 'outlined',
                size: 'small',
              },
            },
          },
        },
      }}
    />
  );
}
