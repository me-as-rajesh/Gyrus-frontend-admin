import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { CheckCircle, AlertCircle } from 'lucide-react';
import styles from './MongoConnectionModal.module.css';


const MongoConnectionModal = ({ open, onClose, onConnect }) => {
  const [connectionString, setConnectionString] = useState('');
  const [dbName, setDbName] = useState('');
  const [status, setStatus] = useState(null); // null, 'connecting', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleConnect = async () => {
    if (!connectionString || !dbName) {
      setStatus('error');
      setErrorMessage('Please fill all fields');
      return;
    }

    try {
      setStatus('connecting');
      
      // Simulate connection (replace with actual connection logic)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // If you were connecting to a real backend API:
      // const response = await fetch('/api/connect-mongo', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ connectionString, dbName })
      // });
      // const data = await response.json();
      
      setStatus('success');
      setTimeout(() => {
        onConnect({ connectionString, dbName });
        onClose();
      }, 1000);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'Failed to connect to MongoDB');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Connect to MongoDB</DialogTitle>
      <DialogContent>
        <div className={styles.formGroup}>
          <TextField
            label="Connection String"
            value={connectionString}
            onChange={(e) => setConnectionString(e.target.value)}
            placeholder="mongodb+srv://<username>:<password>@cluster.mongodb.net"
            fullWidth
            margin="normal"
            variant="outlined"
          />
        </div>
        <div className={styles.formGroup}>
          <TextField
            label="Database Name"
            value={dbName}
            onChange={(e) => setDbName(e.target.value)}
            placeholder="my-school-db"
            fullWidth
            margin="normal"
            variant="outlined"
          />
        </div>

        {status === 'error' && (
          <Alert severity="error" icon={<AlertCircle size={20} />}>
            {errorMessage}
          </Alert>
        )}

        {status === 'success' && (
          <Alert severity="success" icon={<CheckCircle size={20} />}>
            Successfully connected to MongoDB!
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={status === 'connecting'}>
          Cancel
        </Button>
        <Button
          onClick={handleConnect}
          color="primary"
          variant="contained"
          disabled={status === 'connecting'}
          startIcon={status === 'connecting' ? <CircularProgress size={20} /> : null}
        >
          {status === 'connecting' ? 'Connecting...' : 'Connect'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MongoConnectionModal;