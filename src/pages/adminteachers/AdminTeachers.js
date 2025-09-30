import React, { useState, useEffect } from 'react';
import { getPendingJoinRequests, updateJoinRequestStatus, deleteTeacherProfile } from '../../services/mongoDbService';
import { Search } from 'lucide-react';
import styles from './AdminTeachers.module.css';

const API_BASE_URL = 'http://localhost:5000';

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

const AdminTeachers = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (activeTab === 'all') {
      fetchAllTeachers();
    } else {
      fetchPendingRequests();
    }
  }, [activeTab]);

  useEffect(() => {
    const filtered = requests.filter(request =>
      request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.school && request.school.toLowerCase().includes(searchQuery.toLowerCase()))
    ).filter(request =>
      activeTab === 'pending' ? request.status === 'pending' :
      activeTab === 'approvedRejected' ? request.status === 'approved' || request.status === 'rejected' :
      true
    );
    setFilteredRequests(filtered);
  }, [requests, searchQuery, activeTab]);

  const fetchPendingRequests = async () => {
    setIsLoading(true);
    try {
      const pendingRequests = await getPendingJoinRequests();
      setRequests(pendingRequests);
    } catch (err) {
      setError('Failed to load pending requests');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllTeachers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/teachers`);
      if (!response.ok) throw new Error('Failed to fetch all teachers');
      const allTeachers = await response.json();
      setRequests(allTeachers);
    } catch (err) {
      setError('Failed to load all teachers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await updateJoinRequestStatus(id, 'approved');
      if (activeTab === 'all') {
        await fetchAllTeachers();
      } else {
        await fetchPendingRequests();
      }
      closeModal();
    } catch (err) {
      setError('Failed to approve request');
    }
  };

  const handleReject = async (id) => {
    try {
      await deleteTeacherProfile(id);
      if (activeTab === 'all') {
        await fetchAllTeachers();
      } else {
        await fetchPendingRequests();
      }
      closeDeleteModal();
      closeModal();
    } catch (err) {
      setError('Failed to reject and delete request');
    }
  };

  const openModal = (teacher) => {
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTeacher(null);
  };

  const openDeleteModal = (teacher) => {
    setSelectedTeacher(teacher);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteInput('');
    setSelectedTeacher(null);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Get the first letter of the email for the avatar
  const getAvatarLetter = (email) => {
    return email ? email.charAt(0).toUpperCase() : 'T';
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Teacher Account Management</h1>
      <div className={styles.searchContainer}>
        <Search size={20} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search by name, email, department, or school..."
          value={searchQuery}
          onChange={handleSearch}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.tabContainer}>
        <button
          className={`${styles.tab} ${activeTab === 'pending' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Requests
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Teachers
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'approvedRejected' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('approvedRejected')}
        >
          Approved/Rejected
        </button>
      </div>

      {isLoading && <div className={styles.loading}>Loading...</div>}
      {error && <div className={styles.errorMessage}>{error}</div>}

      {!isLoading && filteredRequests.length === 0 && (
        <div className={styles.noResults}>No {activeTab === 'pending' ? 'pending requests' : 'teachers'} found</div>
      )}

      {!isLoading && filteredRequests.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>School</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr
                  key={request._id}
                  className={styles.tableRow}
                  onClick={() => openModal(request)}
                >
                  <td>{request.name}</td>
                  <td>{request.email}</td>
                  <td>{request.department}</td>
                  <td>{request.school || 'Not provided'}</td>
                  <td>{request.status}</td>
                  <td className={styles.actionButtons}>
                    {request.status === 'pending' ? (
                      <>
                        <button
                          className={styles.approveButton}
                          onClick={(e) => { e.stopPropagation(); handleAccept(request._id); }}
                        >
                          Approve
                        </button>
                        <button
                          className={styles.rejectButton}
                          onClick={(e) => { e.stopPropagation(); openDeleteModal(request); }}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        className={styles.deleteButton}
                        onClick={(e) => { e.stopPropagation(); openDeleteModal(request); }}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && selectedTeacher && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <span className={styles.close} onClick={closeModal}>×</span>
            <h2 className={styles.modalTitle}>{selectedTeacher.name}</h2>
            <div className={styles.profileImageContainer}>
              <div
                className={styles.profilePlaceholder}
                style={{ backgroundColor: getRandomColor(selectedTeacher.email) }}
              >
                <span className={styles.avatarLetter}>{getAvatarLetter(selectedTeacher.email)}</span>
              </div>
            </div>
            <p><strong>Email:</strong> {selectedTeacher.email}</p>
            <p><strong>Date of Birth:</strong> {new Date(selectedTeacher.dob).toLocaleDateString()}</p>
            <p><strong>Department:</strong> {selectedTeacher.department}</p>
            <p><strong>Phone:</strong> {selectedTeacher.phone || 'Not provided'}</p>
            <p><strong>School:</strong> {selectedTeacher.school || 'Not provided'}</p>
            <p><strong>Status:</strong> {selectedTeacher.status}</p>
            <div className={styles.actionButtons}>
              {selectedTeacher.status === 'pending' ? (
                <>
                  <button
                    className={styles.approveButton}
                    onClick={() => handleAccept(selectedTeacher._id)}
                  >
                    Approve
                  </button>
                  <button
                    className={styles.rejectButton}
                    onClick={() => openDeleteModal(selectedTeacher)}
                  >
                    Reject
                  </button>
                </>
              ) : (
                <button
                  className={styles.deleteButton}
                  onClick={() => openDeleteModal(selectedTeacher)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedTeacher && (
        <div className={styles.modal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <span className={styles.close} onClick={closeDeleteModal}>×</span>
            <h2 className={styles.modalTitle}>Confirm Deletion</h2>
            <p>Please type <strong>Delete</strong> to confirm deletion of {selectedTeacher.name}'s record.</p>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              className={styles.deleteInput}
              placeholder="Type 'Delete' here"
            />
            <div className={styles.actionButtons}>
              <button
                className={`${styles.deleteButton} ${deleteInput.toLowerCase() === 'delete' ? '' : styles.disabledButton}`}
                onClick={() => handleReject(selectedTeacher._id)}
                disabled={deleteInput.toLowerCase() !== 'delete'}
              >
                Confirm Delete
              </button>
              <button
                className={styles.cancelButton}
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeachers;