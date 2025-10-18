import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbar/Navbar';
import styles from './EditGroup.module.css';
import layoutStyles from '../../components/Layout.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';

const EditGroup = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [group, setGroup] = useState(location.state?.groupData || null);
  const [formData, setFormData] = useState({
  groupName: '',
  class: '',
  section: '',
  maxStudents: 20,
  students: [],
  });
  const [newStudent, setNewStudent] = useState({ name: '', regNo: '', email: '', gender: '', dob: '' });
  const [loading, setLoading] = useState(!location.state?.groupData);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showDeleteStudentModal, setShowDeleteStudentModal] = useState(null);
  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    if (group) {
      setFormData({
        groupName: group.groupName || '',
        class: group.class || '',
        section: group.section || '',
        maxStudents: group.maxStudents || 20,
        students: group.students || [],
      });
      return;
    }

    const fetchGroupData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/info/group-with-tests/${id}`);
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load group data');
        setGroup(data.data);
        setFormData({
          groupName: data.data.groupName || '',
          class: data.data.class || '',
          section: data.data.section || '',
          maxStudents: data.data.maxStudents || 20,
          students: data.data.students || [],
        });
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        if (err.message.includes('not found')) {
          navigate('/dashboard', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [id, navigate, group]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'maxStudents') {
      newValue = parseInt(value, 10);
    }
    if (name === 'section') {
      // Only allow a single uppercase letter
      newValue = value.replace(/[^A-Z]/g, '').slice(0, 1);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleStudentInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.regNo || !newStudent.email || !newStudent.gender || !newStudent.dob) {
      setSubmitError('Please fill all student fields.');
      return;
    }
    if (formData.students.length >= formData.maxStudents) {
      setSubmitError(`Cannot add more students. Maximum limit is ${formData.maxStudents}.`);
      return;
    }
    setFormData((prev) => ({
      ...prev,
      students: [...prev.students, { ...newStudent }],
    }));
    setNewStudent({ name: '', regNo: '', email: '', gender: '', dob: '' });
    setShowAddStudentModal(false);
  };

  const handleRemoveStudent = (index) => {
    setFormData((prev) => ({
      ...prev,
      students: prev.students.filter((_, i) => i !== index),
    }));
    setShowDeleteStudentModal(null);
  };

  const handleStudentEdit = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      students: prev.students.map((student, i) =>
        i === index ? { ...student, [field]: value } : student
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.students.length > formData.maxStudents) {
      setSubmitError(`Student count (${formData.students.length}) exceeds maximum allowed (${formData.maxStudents}).`);
      return;
    }
    try {
      setSubmitError(null);
      const res = await fetch(`${API_BASE_URL}/api/groups/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to update group');
      navigate(`/info/${id}`, { state: { groupData: { ...group, ...data } } });
    } catch (err) {
      console.error('Update error:', err);
      setSubmitError(err.message);
    }
  };

  if (loading) return (
    <div className={layoutStyles.appContainer}>
      <Sidebar />
      <div className={layoutStyles.mainContent}>
        <Navbar />
        <div className={styles.loading}>Loading group data...</div>
      </div>
    </div>
  );
  if (error) return (
    <div className={layoutStyles.appContainer}>
      <Sidebar />
      <div className={layoutStyles.mainContent}>
        <Navbar />
        <div className={styles.error}>Error: {error}</div>
      </div>
    </div>
  );
  if (!group) return null;

  return (
    <div className={layoutStyles.appContainer}>
      <Sidebar />
      <div className={layoutStyles.mainContent}>
        <Navbar />
        <div className={layoutStyles.contentWrapper}>
          <div className={styles.pageWrapper}>
            <div className={styles.pageContainer}>
              <div className={styles.header}>
                <button
                  onClick={() => navigate(`/info/${id}`, { state: { groupData: group } })}
                  className={styles.backButton}
                >
                  <FontAwesomeIcon icon={faArrowLeft} className={styles.backIcon} />
                  Back to Group
                </button>
                <h1 className={styles.headerTitle}>Edit Group: {group.groupName} (Section {group.section})</h1>
              </div>
              <div className={styles.formContainer}>
                {submitError && <div className={styles.error}>Error: {submitError}</div>}
                <div className={styles.section}>
                  <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                      <label htmlFor="groupName" className={styles.formLabel}>Group Name</label>
                      <input
                        type="text"
                        id="groupName"
                        name="groupName"
                        value={formData.groupName}
                        onChange={handleInputChange}
                        className={styles.formInput}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="class" className={styles.formLabel}>Class</label>
                      <input
                        type="text"
                        id="class"
                        name="class"
                        value={formData.class}
                        onChange={handleInputChange}
                        className={styles.formInput}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="section" className={styles.formLabel}>Section (A-Z)</label>
                      <input
                        type="text"
                        id="section"
                        name="section"
                        value={formData.section}
                        onChange={handleInputChange}
                        className={styles.formInput}
                        maxLength={1}
                        pattern="[A-Z]"
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="maxStudents" className={styles.formLabel}>Max Students</label>
                      <input
                        type="number"
                        id="maxStudents"
                        name="maxStudents"
                        value={formData.maxStudents}
                        onChange={handleInputChange}
                        min="1"
                        className={styles.formInput}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <h3 className={styles.formLabel}>Manage Students</h3>
                      <button
                        type="button"
                        onClick={() => setShowAddStudentModal(true)}
                        className={styles.addStudentButton}
                      >
                        <FontAwesomeIcon icon={faPlus} className={styles.buttonIcon} />
                        Add Student
                      </button>
                      {formData.students.length > 0 ? (
                        <div className={styles.studentList}>
                          {formData.students.map((student, index) => (
                            <div key={index} className={styles.studentItem}>
                              <input
                                type="text"
                                value={student.name}
                                onChange={(e) => handleStudentEdit(index, 'name', e.target.value)}
                                className={styles.formInput}
                                placeholder="Student Name"
                              />
                              <input
                                type="text"
                                value={student.regNo}
                                onChange={(e) => handleStudentEdit(index, 'regNo', e.target.value)}
                                className={styles.formInput}
                                placeholder="Registration Number"
                              />
                              <input
                                type="email"
                                value={student.email || ''}
                                onChange={(e) => handleStudentEdit(index, 'email', e.target.value)}
                                className={styles.formInput}
                                placeholder="Email"
                                required
                              />
                              <select
                                value={student.gender || ''}
                                onChange={(e) => handleStudentEdit(index, 'gender', e.target.value)}
                                className={styles.formInput}
                                required
                              >
                                <option value="">Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                              <input
                                type="date"
                                value={student.dob || ''}
                                onChange={(e) => handleStudentEdit(index, 'dob', e.target.value)}
                                className={styles.formInput}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowDeleteStudentModal(index)}
                                className={styles.deleteStudentButton}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={styles.noData}>No students added yet</p>
                      )}
                    </div>
                    <div className={styles.formButtons}>
                      <button
                        type="submit"
                        className={styles.submitButton}
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/info/${id}`, { state: { groupData: group } })}
                        className={styles.cancelButton}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showAddStudentModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Add New Student</h3>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className={styles.closeModal}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
            <div className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.formLabel}>Student Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newStudent.name}
                  onChange={handleStudentInputChange}
                  className={styles.formInput}
                  placeholder="Enter student name"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="regNo" className={styles.formLabel}>Registration Number</label>
                <input
                  type="text"
                  id="regNo"
                  name="regNo"
                  value={newStudent.regNo}
                  onChange={handleStudentInputChange}
                  className={styles.formInput}
                  placeholder="Enter registration number"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.formLabel}>Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newStudent.email}
                  onChange={handleStudentInputChange}
                  className={styles.formInput}
                  placeholder="Enter email"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="gender" className={styles.formLabel}>Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={newStudent.gender}
                  onChange={handleStudentInputChange}
                  className={styles.formInput}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="dob" className={styles.formLabel}>Date of Birth</label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={newStudent.dob}
                  onChange={handleStudentInputChange}
                  className={styles.formInput}
                  required
                />
              </div>
            </div>
            <div className={styles.modalButtons}>
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddStudent}
                className={styles.submitButton}
              >
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteStudentModal !== null && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Confirm Delete</h3>
              <button
                onClick={() => setShowDeleteStudentModal(null)}
                className={styles.closeModal}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
            <p className={styles.modalText}>
              Are you sure you want to remove {formData.students[showDeleteStudentModal]?.name} from the group?
            </p>
            <div className={styles.modalButtons}>
              <button
                type="button"
                onClick={() => setShowDeleteStudentModal(null)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRemoveStudent(showDeleteStudentModal)}
                className={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditGroup;