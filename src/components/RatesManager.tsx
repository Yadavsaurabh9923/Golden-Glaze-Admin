import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import Slide from '@mui/material/Slide';
import { forwardRef } from 'react';
import { BASE_URL, env } from "./BaseConfigs";
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Copyright from '../internals/components/Copyright';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const RatesManager = () => {
  const [rates, setRates] = useState([]);
  const [editingRate, setEditingRate] = useState(null);
  const [newRateValue, setNewRateValue] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rateError, setRateError] = useState('');
  const [reload, setReload] = useState(0);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/${env}/get_rates/`);
      const data = await response.json();
      setRates(data.data || []);
    } catch (error) {
      console.error('Error fetching rates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [reload]);

  const handleEditClick = (rate) => {
    setEditingRate(rate);
    setNewRateValue(rate.rate.toString());
    setOpenDialog(true);
  };

  const validateAmount = (value) => {
    if (!/^\d+$/.test(value)) {
      return 'Amount must be a whole number without decimals or letters';
    }
    const numValue = parseInt(value, 10);
    if (numValue <= 0) {
      return 'Amount must be greater than 0';
    }
    return '';
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingRate(null);
  };

  const handleSaveRate = async () => {
    const errorMsg = validateAmount(newRateValue);
    if (errorMsg) {
      setRateError(errorMsg);
      return;
    }

    if (!editingRate || !newRateValue) return;

    try {
      const response = await fetch(`${BASE_URL}/${env}/update_rate/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session: editingRate.session,
          rate: Number(newRateValue)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update rate");
      }

      setReload(prev => prev + 1);
      handleDialogClose();
    } catch (error) {
      console.error('Error updating rate:', error);
    }
  };

  const formatSessionName = (session) =>
    session.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  return (
    <>
    <Box sx={{ mb: 2 }}>
      <Box sx={{ maxWidth: '100%', ml: 1 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/">
            Home
          </Link>
          <Typography sx={{ color: 'text.primary' }}>Rate Settings</Typography>
        </Breadcrumbs>
      </Box>
    </Box>

    <Box sx={{ mt: 2, px: { xs: 1, sm: 2 } }}>
      
      {loading ? (
        <Typography>Loading rates...</Typography>
      ) : rates.length === 0 ? (
        <Typography>No rates found</Typography>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <Table
            size="small"
            sx={{
              minWidth: 600,
              borderCollapse: 'separate',
              borderSpacing: '0 7px',
              '& thead th': (theme) => ({
                backgroundColor: theme.palette.mode === 'dark'
                  ? theme.palette.grey[900]
                  : theme.palette.grey[100],
                fontWeight: 'bold',
                borderBottom: `2px solid ${theme.palette.divider}`,
                color: theme.palette.text.primary,
              }),
              '& tbody td': {
                borderBottom: '1px solid',
                borderColor: 'divider',
                paddingY: 1.5,
              },
              '& tbody tr': {
                backgroundColor: 'background.paper',
                borderRadius: 1,
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>SESSION</TableCell>
                <TableCell align="right">RATE (₹)</TableCell>
                <TableCell>LAST CHANGED</TableCell>
                <TableCell>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rates.map((rate) => (
                <TableRow key={rate._id}>
                  <TableCell sx={{ width: '35%' }}>
                    {formatSessionName(rate.session)}
                  </TableCell>
                  <TableCell align="right" sx={{ width: '25%' }}>
                    ₹{rate.rate}
                  </TableCell>
                  <TableCell sx={{ width: '30%' }}>
                    {formatDate(rate.lastChanged)}
                  </TableCell>
                  <TableCell sx={{ width: '20%' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleEditClick(rate)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="xs"
        TransitionComponent={Transition}
      >
        <DialogTitle sx={{ fontWeight: 600, pb: 0, mb: 1 }}>
          Edit Rate
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {editingRate && (
            <>
              <Typography gutterBottom sx={{ mb: 2 }}>
                <strong>Session:</strong> {formatSessionName(editingRate.session)}
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                label="New Rate (₹)"
                type="text"
                fullWidth
                variant="standard"
                value={newRateValue}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewRateValue(val);
                  const errorMsg = validateAmount(val);
                  setRateError(errorMsg);
                }}
                error={!!rateError}
                helperText={rateError || 'Only whole numbers are allowed (e.g. 100, 500)'}
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 2,
            pt: 1,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1.5,
          }}
        >
          <Button onClick={handleDialogClose} sx={{ minWidth: 100, py: 1 }} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSaveRate}
            disabled={!!rateError}
            sx={{ minWidth: 120, py: 1 }}
            variant="contained"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      <Copyright sx={{ my: 4 }} />
    </Box></>
  );
};

export default RatesManager;
