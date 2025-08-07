import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, User, Mail, Calendar, BookOpen, Lock, Phone, School } from 'lucide-react';
import { saveTeacherJoinRequest } from '../../services/mongoDbService';
import styles from './Signup.module.css';

const Signup = () => {
  const navigate = useNavigate();
  const [teacherData, setTeacherData] = useState({
    name: '',
    email: '',
    dob: '',
    department: '',
    password: '',
    phone: '',
    school: '',
    profileImage: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTeacherData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      setTeacherData(prev => ({
        ...prev,
        profileImage: reader.result
      }));
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    if (!teacherData.name.trim()) {
      setError('Name is required');
      return false;
    }

    if (!teacherData.email) {
      setError('Email is required');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(teacherData.email)) {
      setError('Please enter a valid email');
      return false;
    }

    if (!teacherData.dob) {
      setError('Date of birth is required');
      return false;
    }

    if (!teacherData.department.trim()) {
      setError('Department is required');
      return false;
    }

    if (!teacherData.password) {
      setError('Password is required');
      return false;
    }

    if (teacherData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Prepare data for API
      const submissionData = {
        name: teacherData.name,
        email: teacherData.email,
        dob: teacherData.dob,
        department: teacherData.department,
        password: teacherData.password,
        phone: teacherData.phone,
        school: teacherData.school,
        profileImage: teacherData.profileImage
      };

      // Save join request to MongoDB
      await saveTeacherJoinRequest(submissionData);

      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        navigate('/review-page');
      }, 2000);
    } catch (err) {
      console.error('Join request failed:', err);
      setError(err.message || 'Failed to submit join request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles['login-container']}>
      <div className={styles.header}>
        <h1 className={styles.title}>Teacher Join Request</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.loginForm}>
        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.profileImageContainer}>
          <div className={styles.imageWrapper}>
            {previewImage ? (
              <img src={previewImage} alt="Profile" className={styles.profileImage} />
            ) : (
              <div className={styles.profilePlaceholder}>
                <User size={48} className={styles.placeholderIcon} />
              </div>
            )}
          </div>
          <label className={styles.uploadButton}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className={styles.fileInput}
            />
            <PlusCircle size={20} className={styles.plusIcon} />
            Upload Photo
          </label>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="name">
            <User size={18} className={styles.inputIcon} />
            Full Name:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={teacherData.name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">
            <Mail size={18} className={styles.inputIcon} />
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={teacherData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="dob">
            <Calendar size={18} className={styles.inputIcon} />
            Date of Birth:
          </label>
          <input
            type="date"
            id="dob"
            name="dob"
            value={teacherData.dob}
            onChange={handleInputChange}
            required
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="department">
            <BookOpen size={18} className={styles.inputIcon} />
            Department:
          </label>
          <input
            type="text"
            id="department"
            name="department"
            value={teacherData.department}
            onChange={handleInputChange}
            placeholder="Enter your department"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">
            <Lock size={18} className={styles.inputIcon} />
            Password:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={teacherData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone">
            <Phone size={18} className={styles.inputIcon} />
            Phone:
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={teacherData.phone}
            onChange={handleInputChange}
            placeholder="Enter your phone number"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="school">
            <School size={18} className={styles.inputIcon} />
            School:
          </label>
          <input
            type="text"
            id="school"
            name="school"
            value={teacherData.school}
            onChange={handleInputChange}
            placeholder="Enter your school"
          />
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? 'Submitting Request...' : 'Submit Join Request'}
        </button>

        {isSubmitted && (
          <div className={styles.successMessage}>
            Request submitted successfully! Waiting for admin approval...
          </div>
        )}
      </form>
    </div>
  );
};

export default Signup;