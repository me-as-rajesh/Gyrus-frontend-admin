import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit2, Trash2, Check } from 'lucide-react';
import axios from 'axios';
import styles from './CreateGroup.module.css';

const CreateGroup = () => {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [classSection, setClassSection] = useState('11');
  const [students, setStudents] = useState([
    { name: '', regNo: '' },
    { name: '', regNo: '' },
  ]);
  const [isCreated, setIsCreated] = useState(false);
  const [createdGroup, setCreatedGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const classOptions = ['11', '12'];
  const maxStudents = 20;

  const API_BASE_URL = 'http://localhost:5000';
  const getTeacherData = () => {
    const teacher = JSON.parse(localStorage.getItem('teacherProfile'));
    if (!teacher || !teacher.email) {
      navigate('/login');
      return null;
    }
    return teacher;
  };

  const handleStudentChange = (index, field, value) => {
    const updatedStudents = [...students];
    updatedStudents[index][field] = value;
    setStudents(updatedStudents);
  };

  const addStudentField = () => {
    if (students.length < maxStudents) {
      setStudents([...students, { name: '', regNo: '' }]);
    }
  };

  const removeStudent = (index) => {
    if (students.length > 2) {
      const updatedStudents = students.filter((_, i) => i !== index);
      setStudents(updatedStudents);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const teacher = getTeacherData();
      if (!teacher) return;

      // Validate at least one student
      const validStudents = students.filter(s => s.name.trim() && s.regNo.trim());
      if (validStudents.length === 0) {
        throw new Error('Please add at least one student');
      }

      const newGroup = {
        groupName: groupName.trim(),
        section: classSection,
        teacherEmail: teacher.email, // Using email instead of _id
        students: validStudents,
        maxStudents
      };

      const response = await axios.post(`${API_BASE_URL}/api/groups`, newGroup);

      setCreatedGroup({
        ...response.data,
        totalStudents: response.data.students.length
      });
      setIsCreated(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Create Group</h2>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.formSection}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="groupName">Enter Group Name</label>
              <input
                type="text"
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="classSection">Class and Section</label>
              <select
                id="classSection"
                value={classSection}
                onChange={(e) => setClassSection(e.target.value)}
                required
              >
                {classOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className={styles.studentCounter}>
              Students added: {students.filter(s => s.name && s.regNo).length} / {maxStudents}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              <Check size={18} /> {isLoading ? 'Creating...' : 'Create now'}
            </button>
            {error && <p className={styles.errorText}>{error}</p>}
          </form>
        </div>

        <div className={styles.studentSection}>
          <h3>List out number of Students</h3>
          <div className={styles.studentList}>
            {students.map((student, index) => (
              <div key={index} className={styles.studentRow}>
                <div className={styles.studentNumber}>{index + 1}.</div>
                <div className={styles.studentInputs}>
                  <div className={styles.formGroup}>
                    <input
                      type="text"
                      placeholder="Student Name"
                      value={student.name}
                      onChange={(e) => handleStudentChange(index, 'name', e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <input
                      type="text"
                      placeholder="Register No"
                      value={student.regNo}
                      onChange={(e) => handleStudentChange(index, 'regNo', e.target.value)}
                      required
                    />
                  </div>
                </div>
                {students.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeStudent(index)}
                    className={styles.removeButton}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}

            {students.length < maxStudents && (
              <button
                type="button"
                onClick={addStudentField}
                className={styles.addButton}
              >
                + Add Student
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;