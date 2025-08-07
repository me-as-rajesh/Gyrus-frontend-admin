import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminAccounts.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faEnvelope,
  faSearch,
  faPlus,
  faFilter,
  faEdit,
  faTrashAlt,
  faChevronLeft,
  faChevronRight,
  faTimes,
  faUserShield,
  faUser
} from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = 'https://gyrus-backend-admin.onrender.com/';

function AdminAccounts() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [admin, setAdmin] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [addFormData, setAddFormData] = useState({
    username: '',
    password: '',
    role: 'Admin'
  });
  const [editFormData, setEditFormData] = useState({
    username: '',
    role: 'Admin'
  });
  const navigate = useNavigate();

  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem('adminData'));

    if (!adminData) {
      navigate('/admin/login');
      return;
    }

    setAdmin(adminData);
    fetchAdmins();
  }, [navigate]);

  const fetchAdmins = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/admins`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch admins');
      }

      setAdmins(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addFormData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add admin');
      }

      setAdmins([...admins, data]);
      setShowAddModal(false);
      setAddFormData({ username: '', password: '', role: 'Admin' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditAdmin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/admins/${selectedAdmin._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update admin');
      }

      setAdmins(admins.map((item) => (item._id === selectedAdmin._id ? data : item)));
      setShowEditModal(false);
      setSelectedAdmin(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAdmin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/admins/${selectedAdmin._id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete admin');
      }

      setAdmins(admins.filter((item) => item._id !== selectedAdmin._id));
      setShowDeleteModal(false);
      setSelectedAdmin(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const openAddModal = () => {
    setShowAddModal(true);
  };

  const openEditModal = (adminItem) => {
    setSelectedAdmin(adminItem);
    setEditFormData({
      username: adminItem.username,
      role: adminItem.role || 'Admin',
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (adminItem) => {
    setSelectedAdmin(adminItem);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedAdmin(null);
    setAddFormData({ username: '', password: '', role: 'Admin' });
    setEditFormData({ username: '', role: 'Admin' });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredAdmins = admins.filter(
    (adminItem) =>
      adminItem.username.toLowerCase().includes(searchQuery) ||
      adminItem.email?.toLowerCase().includes(searchQuery) ||
      adminItem.role.toLowerCase().includes(searchQuery) ||
      adminItem.status.toLowerCase().includes(searchQuery)
  );

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.mainWrapper}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1 className={styles.headerTitle}>Admin Accounts</h1>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.notificationButton}>
              <FontAwesomeIcon icon={faBell} className={styles.notificationIcon} />
              <span className={styles.notificationBadge}></span>
            </button>
            <button className={styles.notificationButton}>
              <FontAwesomeIcon icon={faEnvelope} className={styles.notificationIcon} />
              <span className={styles.notificationBadge}></span>
            </button>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.welcomeBanner}>
          <div className={styles.welcomeContent}>
            <div>
              <h2 className={styles.welcomeTitle}>
                Welcome back, {admin?.username || 'Admin'}
              </h2>
              <span className={styles.welcomeText}>You have full administrative privileges</span>
            </div>
            <div className={styles.welcomeIconContainer}>
              <FontAwesomeIcon icon={faUserShield} className={styles.welcomeIcon} />
            </div>
          </div>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <div className={styles.actionBar}>
          <div className={styles.searchContainer}>
            <div className={styles.searchIcon}>
              <FontAwesomeIcon icon={faSearch} />
            </div>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search admins..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className={styles.actionButtons}>
            <button className={styles.addButton} onClick={openAddModal}>
              <FontAwesomeIcon icon={faPlus} className={styles.buttonIcon} />
              <span>Add Admin</span>
            </button>
            <button className={styles.filterButton}>
              <FontAwesomeIcon icon={faFilter} className={styles.buttonIcon} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Username</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Created At</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.map((adminItem) => (
                  <tr key={adminItem._id} className={styles.tableRow}>
                    <td>
                      <div className={styles.adminInfo}>
                        <div className={styles.adminAvatar}>
                          <FontAwesomeIcon icon={faUser} />
                        </div>
                        <div className={styles.adminDetails}>
                          <div className={styles.adminUsername}>
                            {adminItem.username}
                            {admin && admin.id === adminItem._id && (
                              <span className={styles.badgePrimary}>You</span>
                            )}
                          </div>
                          <div className={styles.adminEmail}>{adminItem.email || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          adminItem.role === 'Super Admin'
                            ? styles.badgePrimary
                            : styles.badgeSecondary
                        }`}
                      >
                        {adminItem.role || 'Admin'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          adminItem.status === 'Active'
                            ? styles.statusActive
                            : styles.statusInactive
                        }`}
                      >
                        {adminItem.status || 'Active'}
                      </span>
                    </td>
                    <td>{new Date(adminItem.createdAt).toLocaleString()}</td>
                    <td className={styles.tableActions}>
                      <button
                        className={styles.editButton}
                        onClick={() => openEditModal(adminItem)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => openDeleteModal(adminItem)}
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <div className={styles.paginationMobile}>
              <button className={styles.paginationButton}>Previous</button>
              <button className={styles.paginationButton}>Next</button>
            </div>
            <div className={styles.paginationDesktop}>
              <div className={styles.paginationInfo}>
                <p>
                  Showing <span>1</span> to <span>{filteredAdmins.length}</span> of{' '}
                  <span>{filteredAdmins.length}</span> results
                </p>
              </div>
              <div>
                <nav className={styles.paginationNav}>
                  <button className={styles.paginationItem}>
                    <FontAwesomeIcon icon={faChevronLeft} className={styles.paginationIcon} />
                  </button>
                  <button className={`${styles.paginationItem} ${styles.active}`}>1</button>
                  <button className={styles.paginationItem}>2</button>
                  <button className={styles.paginationItem}>3</button>
                  <button className={styles.paginationItem}>
                    <FontAwesomeIcon icon={faChevronRight} className={styles.paginationIcon} />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Add New Admin</h3>
              <button onClick={closeModals} className={styles.closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form onSubmit={handleAddAdmin}>
              <div className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label>Username</label>
                  <input
                    type="text"
                    value={addFormData.username}
                    onChange={(e) => setAddFormData({ ...addFormData, username: e.target.value })}
                    required
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Password</label>
                  <input
                    type="password"
                    value={addFormData.password}
                    onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                    required
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Role</label>
                  <select
                    value={addFormData.role}
                    onChange={(e) => setAddFormData({ ...addFormData, role: e.target.value })}
                    className={styles.formInput}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>
              </div>
              <div className={styles.modalButtons}>
                <button type="button" onClick={closeModals} className={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" className={styles.logoutButton}>
                  Add Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Edit Admin</h3>
              <button onClick={closeModals} className={styles.closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form onSubmit={handleEditAdmin}>
              <div className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label>Username</label>
                  <input
                    type="text"
                    value={editFormData.username}
                    onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                    required
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Role</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className={styles.formInput}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>
              </div>
              <div className={styles.modalButtons}>
                <button type="button" onClick={closeModals} className={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" className={styles.logoutButton}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Confirm Delete</h3>
              <button onClick={closeModals} className={styles.closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <p className={styles.modalText}>
              Are you sure you want to delete admin {selectedAdmin?.username}?
            </p>
            <div className={styles.modalButtons}>
              <button onClick={closeModals} className={styles.cancelButton}>
                Cancel
              </button>
              <button onClick={handleDeleteAdmin} className={styles.logoutButton}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAccounts;