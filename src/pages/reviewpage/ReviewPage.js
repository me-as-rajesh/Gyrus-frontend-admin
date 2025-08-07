import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingJoinRequests, updateJoinRequestStatus, deleteTeacherProfile } from '../../services/mongoDbService';
import styles from './ReviewPage.module.css';

const ReviewPage = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    setIsLoading(true);
    try {
      const pendingRequests = await getPendingJoinRequests();
      setRequests(pendingRequests);
    } catch (err) {
      setAlert({ message: 'Failed to load pending requests', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await updateJoinRequestStatus(id, 'approved');
      setAlert({ message: 'Teacher approved successfully! Account created.', type: 'success' });
      await fetchPendingRequests();
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    } catch (err) {
      setAlert({ message: 'Failed to approve request', type: 'error' });
    }
  };

  const handleReject = async (id) => {
    try {
      await deleteTeacherProfile(id);
      setAlert({ message: 'Teacher request rejected and deleted.', type: 'error' });
      await fetchPendingRequests();
      setTimeout(() => {
        navigate('/signup');
      }, 2000);
    } catch (err) {
      setAlert({ message: 'Failed to reject and delete request', type: 'error' });
    }
  };

  return (
    <div className={styles.reviewContainer}>
      <h1 className={styles.title}>Teacher Join Requests</h1>
      {alert.message && (
        <div className={`${styles.alert} ${alert.type === 'success' ? styles.successAlert : styles.errorAlert}`}>
          {alert.message}
        </div>
      )}
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className={styles.requestList}>
          {requests.length === 0 ? (
            <p>No pending requests</p>
          ) : (
            requests.map(request => (
              <div key={request._id} className={styles.requestCard}>
                <div className={styles.requestDetails}>
                  <div className={styles.profileImage}>
                    {request.profileImage ? (
                      <img src={request.profileImage} alt="Profile" className={styles.profileImage} />
                    ) : (
                      <div className={styles.profilePlaceholder}>No Image</div>
                    )}
                  </div>
                  <div className={styles.info}>
                    <p><strong>Name:</strong> {request.name}</p>
                    <p><strong>Email:</strong> {request.email}</p>
                    <p><strong>Date of Birth:</strong> {new Date(request.dob).toLocaleDateString()}</p>
                    <p><strong>Department:</strong> {request.department}</p>
                    <p><strong>Phone:</strong> {request.phone || 'Not provided'}</p>
                    <p><strong>School:</strong> {request.school || 'Not provided'}</p>
                    <p><strong>Status:</strong> {request.status}</p>
                  </div>
                </div>
                <div className={styles.actions}>
                  <button
                    className={styles.acceptButton}
                    onClick={() => handleAccept(request._id)}
                  >
                    Accept
                  </button>
                  <button
                    className={styles.rejectButton}
                    onClick={() => handleReject(request._id)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewPage;