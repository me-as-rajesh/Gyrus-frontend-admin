import React, { useState, useEffect } from 'react';
import styles from './AdminReports.module.css';

const API_BASE_URL = 'https://gyrus-backend-admin.onrender.com';

const AdminReports = () => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/admin/allstudents`).then(res => res.json()),
      fetch(`${API_BASE_URL}/api/teachers`).then(res => res.json())
    ])
      .then(([studentData, teacherData]) => {
        const formattedStudents = studentData.map((student, index) => ({
          id: index + 1,
          name: student.name,
          regNo: student.regNo,
          class: student.section,
          email: 'test@gmail.com',
          groupId: student.groupId,
          groupName: student.groupName
        }));
        setStudents(formattedStudents);
        setTeachers(teacherData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  const downloadStudentsExcel = () => {
    const csv = [
      ['ID', 'Name', 'Reg No', 'Class', 'Email', 'Group ID', 'Group Name'].join(','),
      ...students.map(row => [row.id, row.name, row.regNo, row.class, row.email, row.groupId, row.groupName].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admin_student_reports.csv';
    a.click();
  };

  const downloadTeachersExcel = () => {
    const csv = [
      ['Name', 'Email', 'Date of Birth', 'Department', 'Phone', 'School', 'Status'].join(','),
      ...teachers.map(row => [
        row.name,
        row.email,
        new Date(row.dob).toLocaleDateString(),
        row.department,
        row.phone || 'Not provided',
        row.school || 'Not provided',
        row.status
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admin_teacher_reports.csv';
    a.click();
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <h1>Admin Reports</h1>
      <div className={styles.tableSection}>
        <h2>Students</h2>
        <button onClick={downloadStudentsExcel} className={styles.downloadBtn}>Download Students Excel</button>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Reg No</th>
                <th>Class</th>
                <th>Email</th>
                <th>Group ID</th>
                <th>Group Name</th>
              </tr>
            </thead>
            <tbody>
              {students.map((row, index) => (
                <tr key={index}>
                  <td>{row.id}</td>
                  <td>{row.name}</td>
                  <td>{row.regNo}</td>
                  <td>{row.class}</td>
                  <td>{row.email}</td>
                  <td>{row.groupId}</td>
                  <td>{row.groupName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className={styles.tableSection}>
        <h2>Teachers</h2>
        <button onClick={downloadTeachersExcel} className={styles.downloadBtn}>Download Teachers Excel</button>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Date of Birth</th>
                <th>Department</th>
                <th>Phone</th>
                <th>School</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((row, index) => (
                <tr key={index}>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>{new Date(row.dob).toLocaleDateString()}</td>
                  <td>{row.department}</td>
                  <td>{row.phone || 'Not provided'}</td>
                  <td>{row.school || 'Not provided'}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;