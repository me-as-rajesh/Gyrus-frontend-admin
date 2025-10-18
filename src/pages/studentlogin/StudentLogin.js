import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginStudent, getStudentData } from '../../services/studentService';
import styles from './StudentLogin.module.css';

const StudentLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    regNo: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: ''
  });

  // Check if student data exists in localStorage on component mount
  useEffect(() => {
    const studentData = getStudentData();
    if (studentData) {
      navigate('/student/dashboard');
    }
  }, [navigate]);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'regNo' ? value.toUpperCase() : value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { name, regNo } = formData;

      // Client-side validation
      if (!name.trim() || !regNo.trim()) {
        throw new Error('Both name and registration number are required');
      }

      await loginStudent(name.trim(), regNo.trim());
      
      // Show success notification
      setNotification({
        show: true,
        message: 'Login successful! Redirecting to dashboard...',
        type: 'success'
      });
      
      // Navigate after a short delay to allow user to see the success message
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 1500);
      
    } catch (error) {
      setError(error.message);
      // Show error notification
      setNotification({
        show: true,
        message: error.message || 'Login failed. Please check your credentials.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Notification Toast */}
      {notification.show && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.message}
          <button 
            className={styles.notificationClose} 
            onClick={() => setNotification({ show: false, message: '', type: '' })}
          >
            &times;
          </button>
        </div>
      )}

      <h2 className={styles.title}>Student Login</h2>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className={styles.input}
            placeholder="Enter your full name"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Registration Number</label>
          <input
            type="text"
            name="regNo"
            value={formData.regNo}
            onChange={handleInputChange}
            required
            className={styles.input}
            placeholder="Enter your registration number"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`${styles.button} ${isLoading ? styles.buttonDisabled : ''}`}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default StudentLogin;

//http://localhost:5000/api/student/student-data/KGF/799