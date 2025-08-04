import React, { useState, useEffect, forwardRef } from 'react';
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
  Typography,
  CircularProgress
} from '@mui/material';
import Slide from '@mui/material/Slide';
import { useTheme } from '@mui/material/styles';
import { BASE_URL, env } from "./BaseConfigs";
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Copyright from '../internals/components/Copyright';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ConfigManager = () => {
  const theme = useTheme()
  const [configs, setConfigs] = useState([]);
  const [editingConfig, setEditingConfig] = useState(null);
  const [newConfigValue, setNewConfigValue] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0)

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/${env}/get_configs/`);
      const data = await response.json();
      setConfigs(data.data || []);
    } catch (error) {
      console.error('Error fetching configs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, [reload]);

  const handleEditClick = (config) => {
    setEditingConfig(config);
    setNewConfigValue(config.configValue.toString());
    setOpenDialog(true);
    setError('');
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingConfig(null);
    setError('');
  };

  const validateConfigValue = (value) => {
    if (value === '') return 'Value is required !';
    if (!/^\d+$/.test(value)) return 'Only whole numbers between 0 and 24 are allowed';
    const numValue = Number(value);
    if (numValue < 0 || numValue > 24) return 'Value must be between 0 and 24';
    return '';
  };

  const handleSaveConfig = async () => {
    if (!editingConfig) return;
    const validationError = validateConfigValue(newConfigValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/${env}/update_config/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          configName: editingConfig.configName,
          configValue: Number(newConfigValue)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update rate");
      }

      setReload(prev => prev + 1);
      setConfigs(configs.map(config =>
        config._id === editingConfig._id
          ? { ...config, configValue: Number(newConfigValue) }
          : config
      ));

      handleDialogClose();
    } catch (error) {
      console.error('Error updating config:', error);
    }
  };

  const formatConfigName = (name) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
    <Box sx={{ mb: 2 }}>
      <Box sx={{ maxWidth: '100%', ml: 1 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/">
            Home
          </Link>
          <Typography sx={{ color: 'text.primary' }}>Time Settings</Typography>
        </Breadcrumbs>
      </Box>
    </Box>

    <Box sx={{ mt: 2, px: { xs: 1, sm: 2 }, width: '100%' }}>
      {/* <Card sx={{ width: '100%', overflowX: 'auto' }}>
        <CardContent sx={{ p: { xs: 1, sm: 2 } }}> */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : configs.length === 0 ? (
            <Typography>No configurations found</Typography>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table
                size="small"
                sx={{
                  minWidth: 600,
                  '& thead th': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? theme.palette.grey[900]
                      : theme.palette.grey[100],
                    fontWeight: 'bold',
                    borderBottom: `2px solid ${theme.palette.divider}`,
                    color: theme.palette.text.primary,
                  },
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
                    <TableCell>CONFIGURATION</TableCell>
                    <TableCell align="center">VALUE</TableCell>
                    <TableCell>LAST UPDATED</TableCell>
                    <TableCell>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {configs.map((config) => (
                    <TableRow key={config._id}>
                      <TableCell sx={{ width: '35%' }}>
                        {formatConfigName(config.configName)}
                      </TableCell>
                      <TableCell align="center" sx={{ width: '25%' }}>
                        {config.configValue}
                      </TableCell>
                      <TableCell sx={{ width: '30%' }}>
                        {formatDate(config.updatedAt)}
                      </TableCell>
                      <TableCell sx={{ width: '20%' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleEditClick(config)}
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
        {/* </CardContent>
      </Card> */}

      {/* Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="xs"
        TransitionComponent={Transition}
      >
        <DialogTitle sx={{ fontWeight: 600, pb: 0, mb: 1 }}>Edit Configuration</DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {editingConfig && (
            <>
              <Typography gutterBottom sx={{ mb: 2 }}>
                <strong>Configuration:</strong> {formatConfigName(editingConfig.configName)}
              </Typography>

              <TextField
                autoFocus
                margin="dense"
                label="New Value (0-24)"
                type="number"
                fullWidth
                variant="standard"
                value={newConfigValue}
                onChange={(e) => {
                  setNewConfigValue(e.target.value);
                  const validationError = validateConfigValue(e.target.value);
                  setError(validationError);
                }}
                inputProps={{
                  min: 0,
                  max: 24,
                  step: 1
                }}
                error={!!error}
                helperText={error || "Enter a value between 0 and 24"}
                FormHelperTextProps={{
                  sx: {
                    fontSize: '0.75rem',
                    mt: 0.5,
                    lineHeight: 1.2
                  }
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
          <Button
            onClick={handleDialogClose}
            sx={{
              minWidth: 100,
              py: 1,
              borderWidth: 1.5,
              '&:hover': { borderWidth: 1.5 }
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveConfig}
            variant="contained"
            disabled={!!error}
            sx={{
              minWidth: 120,
              py: 1,
              backgroundColor: !!error
                ? theme.palette.action.disabledBackground
                : theme.palette.primary.main,
              color: !!error
                ? theme.palette.action.disabled
                : theme.palette.primary.contrastText,
              boxShadow: !!error ? 'none' : undefined,
              '&:hover': {
                backgroundColor: !!error
                  ? theme.palette.action.disabledBackground
                  : theme.palette.primary.dark,
              },
            }}
          >
            Save Config
          </Button>
        </DialogActions>
      </Dialog>
      
      <Copyright sx={{ my: 4 }} />
    </Box>
    </>
  );
};

export default ConfigManager;
