import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

export default function CardAlert() {
  const phoneNumber = "7038796452";
  const message = "Hi Saurabh, I have a question !";

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank"); // opens in WhatsApp Web or App
  };

  return (
    <Card variant="outlined" sx={{ m: 1.5, flexShrink: 0 }}>
      <CardContent>
        <AutoAwesomeRoundedIcon fontSize="small" />
        <Typography gutterBottom sx={{ fontWeight: 600 }}>
          Any doubts / questions?
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>  
        </Typography>
        <Button variant="contained" size="small" onClick={handleWhatsAppClick} fullWidth>
          Message Developer
        </Button>
      </CardContent>
    </Card>
  );
}
