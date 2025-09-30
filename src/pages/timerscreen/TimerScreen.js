import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './TimerScreen.module.css';

const TimerScreen = () => {
  const [timeLeft, setTimeLeft] = useState(1 * 60); // 1 minute in seconds
  const totalTime = 1 * 60; // Total time in seconds
  const navigate = useNavigate();

  useEffect(() => {
    if (timeLeft > 0) {
      const intervalId = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(intervalId);
    } else if (timeLeft === 0) {
      navigate('/student/dashboard');
    }
  }, [timeLeft, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const angle = ((totalTime - timeLeft) / totalTime) * 360;

  return (
    <div className={styles.container}>
      <div className={styles.timerDisplay}>
        <div
          className={styles.progressCircle}
          style={{ background: `conic-gradient(#4CAF50 0deg ${angle}deg, #e0e0e0 ${angle}deg 360deg)` }}
        >
          <span className={styles.timerText}>{formatTime(timeLeft)}</span>
        </div>
      </div>
    </div>
  );
};

export default TimerScreen;
