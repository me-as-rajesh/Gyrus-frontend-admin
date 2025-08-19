import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Calendar, BookOpen, Edit, School, Phone } from 'lucide-react';
import { getTeacherProfile } from '../../services/mongoDbService';
import styles from './Profile.module.css';

// Utility function to generate a consistent random color based on email
const getRandomColor = (email) => {
  if (!email) return '#e0e6ed';
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 50%, 60%)`;
};

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const email = location.state?.email || localStorage.getItem('teacherEmail');
        if (!email) {
          navigate('/dashboard');
          return;
        }

        const profileData = await getTeacherProfile(email);
        if (!profileData) {
          throw new Error('Profile not found');
        }
        
        setProfile(profileData);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, location.state]);

  const handleEdit = () => {
    navigate('/edit-profile', { state: { profile } });
  };

  const getAvatarLetter = () => {
    return profile?.email ? profile.email.charAt(0).toUpperCase() : 'T';
  };

  if (loading) {
    return <div className={styles.loading}>Loading profile...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!profile) {
    return <div className={styles.error}>No profile data available</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <h1>Teacher Profile</h1>
          <button onClick={handleEdit} className={styles.editButton}>
            <Edit size={18} /> Edit Profile
          </button>
        </div>

        <div className={styles.profileContent}>
          <div className={styles.profileImageContainer}>
            <div className={styles.profileImagePlaceholder} style={{ backgroundColor: getRandomColor(profile.email) }}>
              <span className={styles.avatarLetter}>{getAvatarLetter()}</span>
            </div>
          </div>

          <div className={styles.profileDetails}>
            <div className={styles.detailItem}>
              <User size={20} className={styles.detailIcon} />
              <div>
                <span className={styles.detailLabel}>Name:</span>
                <span className={styles.detailValue}>{profile.name}</span>
              </div>
            </div>

            <div className={styles.detailItem}>
              <Mail size={20} className={styles.detailIcon} />
              <div>
                <span className={styles.detailLabel}>Email:</span>
                <span className={styles.detailValue}>{profile.email}</span>
              </div>
            </div>

            <div className={styles.detailItem}>
              <Phone size={20} className={styles.detailIcon} />
              <div>
                <span className={styles.detailLabel}>Phone:</span>
                <span className={styles.detailValue}>{profile.phone}</span>
              </div>
            </div>

            <div className={styles.detailItem}>
              <Calendar size={20} className={styles.detailIcon} />
              <div>
                <span className={styles.detailLabel}>Date of Birth:</span>
                <span className={styles.detailValue}>
                  {new Date(profile.dob).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className={styles.detailItem}>
              <BookOpen size={20} className={styles.detailIcon} />
              <div>
                <span className={styles.detailLabel}>Department:</span>
                <span className={styles.detailValue}>{profile.department}</span>
              </div>
            </div>

            <div className={styles.detailItem}>
              <School size={20} className={styles.detailIcon} />
              <div>
                <span className={styles.detailLabel}>School:</span>
                <span className={styles.detailValue}>{profile.school}</span>
              </div>
            </div>

            <div className={styles.detailItem}>
              <Calendar size={20} className={styles.detailIcon} />
              <div>
                <span className={styles.detailLabel}>Member Since:</span>
                <span className={styles.detailValue}>
                  {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;