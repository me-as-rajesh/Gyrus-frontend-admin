import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './EditProfile.module.css';
import { updateTeacherProfile } from '../../services/mongoDbService';

const EditProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState({
    _id: '',
    name: '',
    email: '',
    phone: '',
    dob: '',
    department: '',
    school: '',
    profileImage: ''
  });

  useEffect(() => {
    const existingProfile = location.state?.profile || JSON.parse(localStorage.getItem('teacherProfile'));
    if (existingProfile) {
      setProfile(existingProfile);
    } else {
      navigate('/profile');
    }
  }, [location.state, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const updatedData = await updateTeacherProfile(profile._id, profile);

      // Save updated profile to localStorage
      localStorage.setItem('teacherProfile', JSON.stringify(updatedData));
      localStorage.setItem('teacherEmail', updatedData.email);

      // Navigate back to profile page
      navigate('/profile', { state: { email: updatedData.email } });

    } catch (err) {
      alert('Failed to update profile: ' + err.message);
    }
  };

  return (
    <div className={styles.editContainer}>
      <div className={styles.editCard}>
        <h2>Edit Teacher Profile</h2>

        <label>Name:</label>
        <input name="name" value={profile.name} onChange={handleChange} />

        <label>Email (readonly):</label>
        <input name="email" value={profile.email} readOnly />

        <label>Phone:</label>
        <input name="phone" value={profile.phone} onChange={handleChange} />

        <label>Date of Birth:</label>
        <input name="dob" type="date" value={profile.dob} onChange={handleChange} />

        <label>Department:</label>
        <input name="department" value={profile.department} onChange={handleChange} />

        <label>School:</label>
        <input name="school" value={profile.school} onChange={handleChange} />

        <label>Profile Image URL:</label>
        <input name="profileImage" value={profile.profileImage} onChange={handleChange} />

        <button onClick={handleSave} className={styles.saveButton}>Save Profile</button>
      </div>
    </div>
  );
};

export default EditProfile;