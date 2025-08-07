import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './AdminSidebar.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldAlt,
  faTachometerAlt,
  faChalkboardTeacher,
  faUserGraduate,
  faSchool,
  faUserShield,
  faFileAlt,
  faQuestionCircle,
  faEnvelope,
  faUser,
  faSignOutAlt,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

function AdminSidebar() {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem('adminData'));

  const handleLogout = () => {
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const toggleLogoutModal = () => {
    setShowLogoutModal(!showLogoutModal);
  };

  return (
    <>
      <nav className={`${styles.navbar} ${isNavOpen ? styles.navbarOpen : styles.navbarClosed}`}>
        <div className={styles.navbarHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <FontAwesomeIcon icon={faShieldAlt} />
            </div>
            <span className={styles.logoText}>AdminPanel</span>
          </div>
          <button className={styles.navToggle} onClick={toggleNav}>
            <FontAwesomeIcon icon={isNavOpen ? faTimes : faBars} />
          </button>
        </div>

        {isNavOpen && (
          <div className={styles.navItems}>
            <div className={styles.navSection}>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <FontAwesomeIcon icon={faTachometerAlt} className={styles.navIcon} />
                <span>Dashboard</span>
              </NavLink>
              <NavLink
                to="/admin/teachers"
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <FontAwesomeIcon icon={faChalkboardTeacher} className={styles.navIcon} />
                <span>Teacher</span>
              </NavLink>
              <NavLink
                to="/admin/students"
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <FontAwesomeIcon icon={faUserGraduate} className={styles.navIcon} />
                <span>Student</span>
              </NavLink>
              <NavLink
                to="/admin/schools"
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <FontAwesomeIcon icon={faSchool} className={styles.navIcon} />
                <span>School</span>
              </NavLink>
              <NavLink
                to="/admin/accounts"
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <FontAwesomeIcon icon={faUserShield} className={styles.navIcon} />
                <span>Accounts</span>
              </NavLink>
              <NavLink
                to="/admin/reports"
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <FontAwesomeIcon icon={faFileAlt} className={styles.navIcon} />
                <span>Reports</span>
              </NavLink>
            </div>

            <div className={styles.supportSection}>
              <h3 className={styles.supportTitle}>Support</h3>
              <div className={styles.supportLinks}>
                <NavLink
                  to="/admin/help"
                  className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                  <FontAwesomeIcon icon={faQuestionCircle} className={styles.navIcon} />
                  <span>Help Center</span>
                </NavLink>
                <NavLink
                  to="/admin/contact"
                  className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                  <FontAwesomeIcon icon={faEnvelope} className={styles.navIcon} />
                  <span>Contact</span>
                </NavLink>
              </div>
            </div>

            <div className={styles.userProfile}>
              <div className={styles.userInfo}>
                <div className={styles.userAvatar}>
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <div>
                  <p className={styles.userName}>{admin?.username || 'Admin'}</p>
                  <p className={styles.userRole}>Super Admin</p>
                </div>
              </div>
              <button onClick={toggleLogoutModal} className={styles.logoutIcon}>
                <FontAwesomeIcon icon={faSignOutAlt} />
              </button>
            </div>
          </div>
        )}
      </nav>

      {showLogoutModal && (
        <div className={styles.logoutModal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Confirm Logout</h3>
              <button onClick={toggleLogoutModal} className={styles.closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <p className={styles.modalText}>Are you sure you want to logout from the admin panel?</p>
            <div className={styles.modalButtons}>
              <button onClick={toggleLogoutModal} className={styles.cancelButton}>
                Cancel
              </button>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminSidebar;