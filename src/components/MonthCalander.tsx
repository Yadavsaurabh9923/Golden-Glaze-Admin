import * as React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MonthCalendar } from '@mui/x-date-pickers/MonthCalendar';

export default function MonthSelector() {
  const [value, setValue] = React.useState<Dayjs | null>(dayjs());

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MonthCalendar 
        value={value}
        onChange={(newValue) => setValue(newValue)}
      />
    </LocalizationProvider>
  );
}
