import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, LayoutDashboard, ChevronRight, ChevronLeft } from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teacherData, setTeacherData] = useState({
    name: '',
    email: '',
    profileImage: null,
  });
  const navigate = useNavigate();
  const API_BASE_URL = 'https://gyrus-backend-admin.onrender.com';

  useEffect(() => {
    const savedData = localStorage.getItem('teacherProfile');
    if (savedData) {
      const teacherProfile = JSON.parse(savedData);
      setTeacherData(teacherProfile);
      fetchGroups(teacherProfile.email);
    }
  }, []);

  const fetchGroups = async (teacherEmail) => {
    if (!teacherEmail) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/groups/teacher/${teacherEmail}`);
      if (!response.ok) throw new Error('Failed to fetch groups');
      const data = await response.json();
      setGroups(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleHideSidebar = () => {
    setIsHidden(!isHidden);
    setIsOpen(true); // Reset to open state when showing sidebar
  };

  return (
    <>
      <button
        className={styles.toggleButton}
        onClick={toggleHideSidebar}
      >
        {isHidden ? (
          <ChevronRight className={styles.toggleIcon} />
        ) : (
          <ChevronLeft className={styles.toggleIcon} />
        )}
      </button>
      <div className={`${styles.sidebar} ${isOpen ? styles.open : ''} ${isHidden ? styles.hidden : ''}`}>
        <div className={styles.sidebarHeader} onClick={() => navigate('/profile')}>
          <div
            className={styles.profileButton}
            onClick={(e) => {
              e.stopPropagation();
              toggleSidebar();
            }}
          >
            {teacherData.profileImage ? (
              <img src={teacherData.profileImage} alt="Profile" className={styles.profileImage} />
            ) : (
              <div className={styles.profilePlaceholder}>
                <User size={20} className={styles.placeholderIcon} />
              </div>
            )}
          </div>
          {isOpen && (
            <div className={styles.teacherInfo}>
              <h3 className={styles.teacherName}>{teacherData.name || 'Teacher Name'}</h3>
              <p className={styles.teacherEmail}>{teacherData.email || 'example@gmail.com'}</p>
            </div>
          )}
        </div>

        <nav className={styles.nav}>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.active}` : styles.navLink)}
          >
            <LayoutDashboard className={styles.icon} />
            <span>Dashboard</span>
          </NavLink>

          <div className={styles.groupSection}>
            <h4 className={styles.sectionTitle}>Groups</h4>
            {loading && <div className={styles.loading}>Loading groups...</div>}
            {error && <div className={styles.error}>Error: {error}</div>}
            {groups.length > 0 ? (
              <>
                {groups.map((group) => (
                  <NavLink
                    key={group._id}
                    to={`/info/${group._id}`}
                    className={({ isActive }) =>
                      isActive ? `${styles.groupLink} ${styles.active}` : styles.groupLink
                    }
                  >
                    {group.groupName} ({group.class} - {group.section})
                  </NavLink>
                ))}
              </>
            ) : (
              !loading && !error && <div className={styles.noGroups}>No groups found</div>
            )}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;