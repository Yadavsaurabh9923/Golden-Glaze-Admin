import * as React from 'react';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-data-grid-pro/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppNavbar from './components/AppNavbar';
import Header from './components/Header';
import HomePage from './components/HomePage';
import SideMenu from './components/SideMenu';
import AppTheme from './theme/AppTheme';
import { Routes, Route } from 'react-router-dom';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from './theme/customizations';
import RatesManager from './components/RatesManager';
import ConfigManager from './components/ConfigManager';
import UserBookings from './components/UserBookings';
import AllBookings from './components/AllBookings';

import {
  Modal,
  Typography,
  TextField,
  Button,
  Paper,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Dashboard(props: { disableCustomTheme?: boolean }) {
  const [open, setOpen] = React.useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("unlocked"));
      if (stored && stored.value && stored.expiresAt > Date.now()) {
        return false; // unlocked and still valid
      }
    } catch (e) {
      // ignore parse errors
    }
    return true; // locked
  });
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("unlocked"));
      if (stored && stored.value && stored.expiresAt > Date.now()) {
        setOpen(false); // still valid
      } else {
        setOpen(true); // expired or not present
      }
    } catch (e) {
      setOpen(true); // if parse fails
    }
    setLoading(false);
  }, []);

  const handleCheckPassword = () => {
    if (password === '737843') {
      const expiryTime = Date.now() + 10 * 60 * 1000; // 2 minutes in ms
      localStorage.setItem("unlocked", JSON.stringify({ value: true, expiresAt: expiryTime }));
      setOpen(false);
    } else {
      window.location.href = 'https://golden-glaze.vercel.app/';
    }
  };

  if (loading) {
    return null; // or a spinner while checking localStorage
  }

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />

      {/* Password Modal */}
      <Modal open={open} disableEscapeKeyDown>
        <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          bgcolor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(5px)'
        }}
      >

          <Paper
            elevation={6}
            sx={{
              p: 4,
              textAlign: 'center',
              width: 350,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              color: 'white',
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
              Golden Glaze Secure Access
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
              Please enter the 6-digit password
            </Typography>
            <TextField
              // use "tel" so many mobile browsers open the numeric keypad
              type="tel"
              inputProps={{
                inputMode: 'numeric',    // hint for virtual keyboard
                pattern: '[0-9]*',       // additional hint for some browsers
                maxLength: 6,            // prevents typing past 4 chars
                style: { textAlign: 'center', fontSize: '1.2rem' },
                'aria-label': '6 digit password',
              }}
              value={password}
              onChange={(e) => {
                // keep only digits, max length 4
                const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 6);
                setPassword(digitsOnly);
              }}
              fullWidth
              sx={{
                mb: 3,
                background: 'white',
                borderRadius: 2,
              }}
            />
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleCheckPassword}
              sx={{
                backgroundColor: '#0d47a1',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#08306b',
                },
              }}
            >
              Unlock
            </Button>
          </Paper>
        </Box>
      </Modal>

      {/* Main Layout */}
      {!open && (
        <Box sx={{ display: 'flex' }}>
          <SideMenu />
          <AppNavbar />
          <Box
            component="main"
            sx={(theme) => ({
              flexGrow: 1,
              backgroundColor: theme.vars
                ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
                : alpha(theme.palette.background.default, 1),
              overflow: 'auto',
            })}
          >
            <Stack
              spacing={2}
              sx={{
                alignItems: 'left',
                mx: 3,
                pb: 5,
                mt: { xs: 8, md: 0 },
              }}
            >
              <Header />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/bookings" element={<UserBookings />} />
                <Route path="/all-bookings" element={<AllBookings />} />
                <Route path="/rates-settings" element={<RatesManager />} />
                <Route path="/time-settings" element={<ConfigManager />} />
              </Routes>
            </Stack>
          </Box>
        </Box>
      )}
    </AppTheme>
  );
}
