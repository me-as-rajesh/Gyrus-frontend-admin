import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const API_BASE_URL = 'https://gyrus-backend-admin.onrender.com/';//new line

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    schoolCount: 0,
    teacherCount: 0,
    studentCount: 0,
    groupCount: 0,
    testCount: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {

        const studentsResponse = await fetch(`${API_BASE_URL}/api/admin/allstudents`);
        const studentsData = await studentsResponse.json();
        
        const teachersResponse = await fetch(`${API_BASE_URL}/api/teachers`);
        const teachersData = await teachersResponse.json();

        setStats({
          schoolCount: 5,
          teacherCount: teachersData.length,
          studentCount: studentsData.length,
          groupCount: new Set(studentsData.map(student => student.groupId)).size,
          testCount: 24,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container">
      <h1 className="title">Admin Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Schools</span>
          <span className="stat-value">{stats.schoolCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Teachers</span>
          <span className="stat-value">{stats.teacherCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Students</span>
          <span className="stat-value">{stats.studentCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Groups</span>
          <span className="stat-value">{stats.groupCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Tests</span>
          <span className="stat-value">{stats.testCount}</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;