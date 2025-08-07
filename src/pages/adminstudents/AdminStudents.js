import React, { useState, useEffect } from 'react';
import styles from './AdminStudents.module.css';

const API_BASE_URL = 'https://gyrus-backend-admin.onrender.com/';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/allstudents`)
      .then(response => response.json())
      .then(data => {
        const formattedStudents = data.map((student, index) => ({
          id: index + 1,
          name: student.name,
          regNo: student.regNo,
          class: student.section,
          email: 'test@gmail.com',
          groupId: student.groupId,
          groupName: student.groupName
        }));
        setStudents(formattedStudents);
      })
      .catch(error => console.error('Error fetching students:', error));
  }, []);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRowClick = (student) => {
    setSelectedStudent(student);
  };

  const closePopup = () => {
    setSelectedStudent(null);
  };

  return (
    <div className={styles.container}>
      <h1>Student Management</h1>
      <div className={styles['search-container']}>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles['search-input']}
        />
      </div>
      <table className={styles['student-table']}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Reg No</th>
            <th>Class</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map(student => (
            <tr key={student.id} onClick={() => handleRowClick(student)} className={styles['table-row']}>
              <td>{student.id}</td>
              <td>{student.name}</td>
              <td>{student.regNo}</td>
              <td>{student.class}</td>
              <td>{student.email}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedStudent && (
        <div className={styles.popup} onClick={closePopup}>
          <div className={styles['popup-content']}>
            <h2>Student Details</h2>
            <p><strong>ID:</strong> {selectedStudent.id}</p>
            <p><strong>Name:</strong> {selectedStudent.name}</p>
            <p><strong>Reg No:</strong> {selectedStudent.regNo}</p>
            <p><strong>Class:</strong> {selectedStudent.class}</p>
            <p><strong>Email:</strong> {selectedStudent.email}</p>
            <p><strong>Group ID:</strong> {selectedStudent.groupId}</p>
            <p><strong>Group Name:</strong> {selectedStudent.groupName}</p>
            <button onClick={closePopup} className={styles['close-button']}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;