import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit2, Trash2, Check, Upload, Download } from 'lucide-react';
import axios from 'axios';
import styles from './CreateGroup.module.css';
import Papa from 'papaparse';

const CreateGroup = () => {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [classSection, setClassSection] = useState('11');
  const [studentCount, setStudentCount] = useState(1);
  const [students, setStudents] = useState([{ name: '', regNo: '', email: '', gender: '', dob: '' }]);
  const [isCreated, setIsCreated] = useState(false);
  const [createdGroup, setCreatedGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const classOptions = ['11', '12'];
  const genderOptions = ['Male', 'Female', 'Other'];
  const maxStudents = 100;
  const minStudents = 1;

  const API_BASE_URL = 'https://gyrus-backend-admin.onrender.com';
  const getTeacherData = () => {
    const teacher = JSON.parse(localStorage.getItem('teacherProfile'));
    if (!teacher || !teacher.email) {
      navigate('/login');
      return null;
    }
    return teacher;
  };

  const handleStudentCountChange = (e) => {
    const count = Math.max(minStudents, Math.min(maxStudents, Number(e.target.value) || 1));
    setStudentCount(count);
    setStudents(
      Array(count).fill().map((_, i) => students[i] || { name: '', regNo: '', email: '', gender: '', dob: '' })
    );
  };

  const handleStudentChange = (index, field, value) => {
    const updatedStudents = [...students];
    updatedStudents[index][field] = value;
    setStudents(updatedStudents);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const importedStudents = result.data.map(row => ({
          name: row.name || '',
          regNo: row.regNo || '',
          email: row.email || '',
          gender: row.gender || '',
          dob: row.dob || ''
        })).slice(0, maxStudents);

        const validStudents = importedStudents.filter(s => 
          s.name.trim() && 
          s.regNo.trim() && 
          s.email.trim() && 
          s.gender && 
          ['Male', 'Female', 'Other'].includes(s.gender) && 
          s.dob
        );

        if (validStudents.length === 0) {
          setError('No valid student data found in CSV');
          return;
        }

        setStudents(validStudents);
        setStudentCount(validStudents.length);
      },
      error: () => {
        setError('Error parsing CSV file');
      }
    });
  };

  const handleExportCSV = () => {
    const validStudents = students.filter(s => 
      s.name.trim() && 
      s.regNo.trim() && 
      s.email.trim() && 
      s.gender && 
      s.dob
    );
    
    if (validStudents.length === 0) {
      setError('No valid students to export');
      return;
    }

    const csv = Papa.unparse(validStudents);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${groupName || 'students'}.csv`);
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const teacher = getTeacherData();
      if (!teacher) return;

      const validStudents = students.filter(s => 
        s.name.trim() && 
        s.regNo.trim() && 
        s.email.trim() && 
        s.gender && 
        s.dob
      );
      if (validStudents.length === 0) {
        throw new Error('Please add at least one student with all required fields');
      }

      const newGroup = {
        groupName: groupName.trim(),
        section: classSection,
        teacherEmail: teacher.email,
        students: validStudents,
        maxStudents
      };

      const response = await axios.post(`${API_BASE_URL}/api/groups`, newGroup);

      setCreatedGroup({
        ...response.data,
        totalStudents: response.data.students.length
      });
      setIsCreated(true);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
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

      <div className={styles.formSection}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
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

            <div className={styles.formGroup}>
              <label htmlFor="studentCount">Number of Students (1-100)</label>
              <input
                type="number"
                id="studentCount"
                min={minStudents}
                max={maxStudents}
                value={studentCount}
                onChange={handleStudentCountChange}
                required
              />
            </div>

            <div className={styles.studentCounter}>
              Students added: {students.filter(s => s.name && s.regNo && s.email && s.gender && s.dob).length} / {maxStudents}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              <Check size={18} /> {isLoading ? 'Creating...' : 'Create now'}
            </button>
            {error && <p className={styles.errorText}>{error}</p>}
          </div>
        </form>
      </div>

      <div className={styles.studentSection}>
        <div className={styles.studentSectionHeader}>
          <h3>List out number of Students</h3>
          <div className={styles.buttonGroup}>
            <label className={styles.importButton}>
              <Upload size={18} /> Import CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                style={{ display: 'none' }}
              />
            </label>
            <button
              type="button"
              className={styles.exportButton}
              onClick={handleExportCSV}
            >
              <Download size={18} /> Export CSV
            </button>
          </div>
        </div>
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
                <div className={styles.formGroup}>
                  <input
                    type="email"
                    placeholder="Email"
                    value={student.email}
                    onChange={(e) => handleStudentChange(index, 'email', e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <select
                    value={student.gender}
                    onChange={(e) => handleStudentChange(index, 'gender', e.target.value)}
                    required
                  >
                    <option value="" disabled>Select Gender</option>
                    {genderOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <input
                    type="date"
                    placeholder="Date of Birth"
                    value={student.dob}
                    onChange={(e) => handleStudentChange(index, 'dob', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAlert && (
        <div className={styles.successAlert}>
          <Check size={18} />
          Group created successfully!
        </div>
      )}
    </div>
  );
};

export default CreateGroup;