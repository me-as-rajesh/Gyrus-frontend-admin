// Groupinfo.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbar/Navbar';
import styles from './Groupinfo.module.css';
import layoutStyles from '../../components/Layout.module.css';

const GroupPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [group, setGroup] = useState(location.state?.groupData || null);
  const [loading, setLoading] = useState(!location.state?.groupData);
  const [error, setError] = useState(null);
  const API_BASE_URL = 'https://gyrus-backend-admin.onrender.com';

  useEffect(() => {
    if (location.state?.groupData) return;

    const fetchGroupData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/info/group-with-tests/${id}`);
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load group data');
        setGroup(data.data);
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
  }, [id, navigate, location.state]);

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
                {/* <button onClick={() => navigate(-1)} className={styles.backButton}>
                  ← Back to Groups
                </button> */}
                <h1>{group.groupName} (Section {group.section})</h1>
                <button
                  onClick={() => navigate(`/edit-group/${id}`, { state: { groupData: group } })}
                  className={styles.editButton}
                >
                  Edit Group
                </button>
              </div>

              <div className={styles.statsGrid}>
                <StatCard title="Students" value={`${group.currentStudentCount}/${group.maxStudents}`} />
                <StatCard title="Tests" value={group.tests?.length || 0} />
                <StatCard title="Teacher" value={group.teacherEmail?.split('@')[0]} />
              </div>

              <Section title="Student Roster">
                {group.students?.length > 0 ? (
                  <div className={styles.studentsGrid}>
                    {group.students.map((student, index) => (
                      <StudentCard
                        key={student.regNo || index}
                        name={student.name}
                        regNo={student.regNo}
                        email={student.email}
                        gender={student.gender}
                        dob={student.dob}
                      />
                    ))}
                  </div>
                ) : (
                  <p className={styles.noData}>No students enrolled yet</p>
                )}
              </Section>

              <Section title="Tests">
                {group.tests?.length > 0 ? (
                  <div className={styles.testsGrid}>
                    {group.tests.map((test, index) => (
                      <TestCard
                        key={index}
                        title={test.testName}
                        date={new Date(test.date).toLocaleDateString()}
                        time={test.time}
                        subject={test.subject}
                        mcqs={test.mcqCount}
                      />
                    ))}
                  </div>
                ) : (
                  <p className={styles.noData}>No tests scheduled yet</p>
                )}
              </Section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className={styles.statCard}>
    <h3>{title}</h3>
    <p>{value}</p>
  </div>
);

const StudentCard = ({ name, regNo, email, gender, dob }) => (
  <div className={styles.studentCard}>
    <span className={styles.name}>{name}</span>
    <span className={styles.regNo}>{regNo}</span>
    <span className={styles.email}>Email: {email}</span>
    <span className={styles.gender}>Gender: {gender}</span>
    <span className={styles.dob}>DOB: {dob ? new Date(dob).toLocaleDateString() : '-'}</span>
  </div>
);

const TestCard = ({ title, date, time, subject, mcqs }) => (
  <div className={styles.testCard}>
    <h4>{title}</h4>
    <p>Date: {date}</p>
    <p>Time: {time}</p>
    <p>Subject: {subject}</p>
    <p>MCQs: {mcqs}</p>
  </div>
);

const Section = ({ title, children }) => (
  <section className={styles.section}>
    <h2>{title}</h2>
    {children}
  </section>
);

export default GroupPage;