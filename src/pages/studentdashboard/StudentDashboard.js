import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearStudentSession } from '../../services/studentService'; 
import styles from './StudentDashboard.module.css';

const API_BASE_URL = 'https://gyrus-backend-admin.onrender.com/';

const StudentDashboard = () => {
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timers, setTimers] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                setLoading(true);
                // Get name and regNo from localStorage
                const localData = JSON.parse(localStorage.getItem('studentData'));
                if (!localData || !localData.student || !localData.student.name || !localData.student.regNo) {
                    throw new Error('Student data not found in localStorage');
                }
                const { name, regNo } = localData.student;

                // Fetch data from API
                const response = await fetch(`${API_BASE_URL}/api/student/student-data/${name}/${regNo}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch student data');
                }
                const data = await response.json();
                if (!data.success) {
                    throw new Error(data.message || 'Failed to load student data');
                }

                setStudentData(data.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
                console.error('Error:', err);
            }
        };

        fetchStudentData();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!studentData || !studentData.tests) return;

            const updatedTimers = {};
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            studentData.tests.forEach(test => {
                const testDate = new Date(test.date);
                const testDay = new Date(testDate.getFullYear(), testDate.getMonth(), testDate.getDate());

                if (testDay.getTime() > today.getTime()) {
                    updatedTimers[test._id] = {
                        status: 'upcoming',
                        timeLeft: '📅 Upcoming'
                    };
                } else if (testDay.getTime() === today.getTime()) {
                    updatedTimers[test._id] = {
                        status: 'available',
                        timeLeft: '✅ Available Today'
                    };
                } else {
                    updatedTimers[test._id] = {
                        status: 'expired',
                        timeLeft: '❌ Test Closed'
                    };
                }
            });

            setTimers(updatedTimers);
        }, 1000);

        return () => clearInterval(interval);
    }, [studentData]);

    const handleAttendTest = (test) => {
        if (timers[test._id]?.status === 'available') {
            navigate('/test-attend', { state: { test } });
        }
    };

    const handleLogout = () => {
        clearStudentSession();
        navigate('/student/login');
    };

    if (loading) return <div className={styles.container}>Loading...</div>;
    if (error) return <div className={styles.container}>Error: {error}</div>;
    if (!studentData) return <div className={styles.container}>No student data available</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.studentInfo}>
                    <h2>Welcome, {studentData.student.name}!</h2>
                    <p>Registration Number: {studentData.student.regNo}</p>
                    <p>Group: {studentData.group.name} (Section {studentData.group.section})</p>
                    <p>Teacher: {studentData.teacher.name}</p>
                </div>
                <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
            </div>

            <h1 className={styles.title}>Available Tests</h1>

            {studentData.tests && studentData.tests.length > 0 ? (
                <div className={styles.testList}>
                    {studentData.tests.map(test => {
                        const timerInfo = timers[test._id] || {};
                        const testDate = new Date(test.date);

                        return (
                            <div key={test._id} className={styles.testCard}>
                                <div className={styles.testInfo}>
                                    <h3>{test.testName}</h3>
                                    <p>Subject: {test.subject}</p>
                                    <p>Date: {testDate.toLocaleDateString()}</p>
                                    <p>Time: {test.time}</p>
                                    <p>MCQs: {test.mcqCount}</p>
                                    <p className={styles.timer}>{timerInfo.timeLeft || 'Loading...'}</p>
                                </div>
                                <button
                                    onClick={() => handleAttendTest(test)}
                                    className={styles.attendButton}
                                    disabled={timerInfo.status !== 'available'}
                                >
                                    {timerInfo.status === 'expired'
                                        ? 'Test Closed'
                                        : timerInfo.status === 'upcoming'
                                        ? 'Upcoming'
                                        : 'Attend Test'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className={styles.noTests}>No tests available at this time</div>
            )}
        </div>
    );
};

export default StudentDashboard;