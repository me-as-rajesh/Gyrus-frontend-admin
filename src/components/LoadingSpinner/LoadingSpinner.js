import React from 'react';
import { CircularProgress } from '@mui/material';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = () => (
  <div className={styles.container}>
    <CircularProgress />
  </div>
);

export default LoadingSpinner;