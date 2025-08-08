import React, { useEffect, useState } from 'react';
import './dashboard.css';

const API_BASE_URL = 'https://gyrus-backend-admin.onrender.com';

const Dashboard = () => {
  const [cardsData, setCardsData] = useState([
    { id: 1, title: 'Total Groups', value: 'Loading...', change: '', icon: '👥', color: '#1cc88a' },
    { id: 2, title: 'Total Students', value: 'Loading...', change: '', icon: '👨‍🎓', color: '#f6c23e' },
    { id: 3, title: 'Total Tests', value: 'Loading...', change: '', icon: '📊', color: '#4e73df' },
    { id: 4, title: 'Upcoming Tests', value: 'Loading...', change: '', icon: '📝', color: '#e74a3b' },
    { id: 5, title: 'Finished Tests', value: 'Loading...', change: '', icon: '✅', color: '#36b9cc' }
  ]);
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome back! Loading your data...');
  const [schoolName, setSchoolName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [testsByGroup, setTestsByGroup] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});

  const quickLinksData = [
    { name: 'NEET Syllabus', icon: '📑', url: `${API_BASE_URL}/api/questions/all-questions` },
    { name: 'Previous Papers', icon: '📂', url: `${API_BASE_URL}/api/questions/all-questions` },
    { name: 'Study Groups', icon: '👥', url: `${API_BASE_URL}/api/groups` },
    { name: 'Mock Tests', icon: '🧪', url: `${API_BASE_URL}/api/tests` },
    { name: 'Revision Notes', icon: '📝', url: `${API_BASE_URL}/api/questions/all-questions` },
    { name: 'Doubt Forum', icon: '💬', url: '#' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const teacherProfile = JSON.parse(localStorage.getItem('teacherProfile'));
        if (!teacherProfile?.email) {
          throw new Error('Teacher email not found');
        }

        // Set welcome message and school name
        // Option 1: Use teacherProfile from localStorage (as current)
        // setWelcomeMessage(`Welcome back, ${teacherProfile.name || 'Teacher'}!`);
        // setSchoolName(`School Name: ${teacherProfile.school || 'Unknown School'}`);

        // Option 2: Fetch teacher profile from backend (if available)
        // Uncomment below if you have an endpoint like /api/teachers/profile/:email
        
        const profileResponse = await fetch(`${API_BASE_URL}/api/teachers/profile/${teacherProfile.email}`);
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setWelcomeMessage(`Welcome back, ${profileData.name || 'Teacher'}!`);
          setSchoolName(`School Name: ${profileData.school || 'Unknown School'}`);
        } else {
          setWelcomeMessage(`Welcome back, ${teacherProfile.name || 'Teacher'}!`);
          setSchoolName(`School Name: ${teacherProfile.school || 'Unknown School'}`);
        }
        

        // Fetch groups and students data
        const groupsResponse = await fetch(`${API_BASE_URL}/api/groups/teacher/${teacherProfile.email}`);
        const groups = await groupsResponse.json();
        const totalGroups = groups.length;
        const totalStudents = groups.reduce((sum, group) => sum + (group.studentCount || group.students.length), 0);

        // Fetch all tests for the teacher
        const testsResponse = await fetch(`${API_BASE_URL}/api/tests/teacher-tests/${teacherProfile.email}`);
        const allTests = await testsResponse.json();
        const totalTests = allTests.length;

        // Calculate upcoming and finished tests
        const now = new Date();
        const upcomingTests = allTests.filter(test => {
          const testDate = new Date(test.date);
          const testTime = test.time.split(':');
          testDate.setHours(testTime[0], testTime[1]);
          return testDate > now;
        });

        const finishedTests = allTests.filter(test => {
          const testDate = new Date(test.date);
          const testTime = test.time.split(':');
          testDate.setHours(testTime[0], testTime[1]);
          return testDate <= now;
        });

        // Initialize tests by group with all groups, storing test names
        const groupedTests = {};
        groups.forEach(group => {
          groupedTests[group.groupName] = [];
        });

        // Map tests to groups
        allTests.forEach(test => {
          const groupName = groups.find(g => g._id === test.groupId)?.groupName || 'Unknown';
          if (groupName !== 'Unknown') {
            groupedTests[groupName].push(test.testName);
          }
        });

        // Update recent activities based on test data
        const activities = allTests
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 4)
          .map((test, index) => {
            const createdAt = new Date(test.createdAt);
            const now = new Date();
            const diffTime = Math.abs(now - createdAt);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

            let timeString;
            if (diffDays >= 1) {
              timeString = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            } else if (diffHours >= 1) {
              timeString = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            } else {
              timeString = 'Just now';
            }

            return {
              id: index + 1,
              activity: `Created test: ${test.testName}`,
              time: timeString
            };
          });
        setRecentActivities(activities);

        // Update cards data
        setCardsData([
          {
            id: 1,
            title: 'Total Groups',
            value: totalGroups,
            change: `Latest: ${groups[0]?.groupName || 'None'}`,
            icon: '👥',
            color: '#1cc88a'
          },
          {
            id: 2,
            title: 'Total Students',
            value: totalStudents,
            change: `Across ${totalGroups} groups`,
            icon: '👨‍🎓',
            color: '#f6c23e'
          },
          {
            id: 3,
            title: 'Total Tests',
            value: totalTests,
            change: `Across ${Object.keys(groupedTests).filter(g => groupedTests[g].length > 0).length} groups`,
            icon: '📊',
            color: '#4e73df'
          },
          {
            id: 4,
            title: 'Upcoming Tests',
            value: upcomingTests.length,
            change: upcomingTests.length > 0 ? `Next: ${upcomingTests[0].testName}` : 'No upcoming tests',
            icon: '📝',
            color: '#e74a3b'
          },
          {
            id: 5,
            title: 'Finished Tests',
            value: finishedTests.length,
            change: finishedTests.length > 0 ? `Latest: ${finishedTests[0].testName}` : 'No finished tests',
            icon: '✅',
            color: '#36b9cc'
          }
        ]);

        // Update tests by group
        setTestsByGroup(groupedTests);

        // Initialize expanded state for all groups
        const initialExpanded = {};
        Object.keys(groupedTests).forEach(group => {
          initialExpanded[group] = false;
        });
        setExpandedGroups(initialExpanded);

      } catch (error) {
        console.error('Error fetching data:', error);
        setWelcomeMessage('Welcome back! Error loading data.');
        setSchoolName('Error loading school');
        setRecentActivities([]);
        setCardsData(cardsData.map(card => ({ ...card, value: 'Error', change: 'Failed to load' })));
        setTestsByGroup({});
        setExpandedGroups({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Card animation
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('show');
      }, index * 100);
    });
  }, []);

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  return (
    <div className="dashboard-container">
      <div className="top-bar">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search topics, tests, resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button>🔍</button>
        </div>
        <div className="user-profile">
          <a href={`/student/login`}>👨‍🎓 Student</a>
        </div>
      </div>

      <div className="content-area">
        <h1>Teacher Dashboard</h1>
        <p className="welcome-message">{welcomeMessage}</p>
        <p className="school-name">{schoolName}</p>

        <div className="cards-container">
          {cardsData.map((card) => (
            <div key={card.id} className="card" style={{ background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}cc 100%)` }}>
              <div className="card-icon">{card.icon}</div>
              <div className="card-content">
                <h3>{card.title}</h3>
                <h2>{card.value}</h2>
                <p>{card.change}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="panels-container">
          <div className="panel quick-links">
            <h3>Quick Links</h3>
            <ul>
              {quickLinksData.map((link, index) => (
                <li key={index} className="quick-link-item">
                  <span className="link-icon">{link.icon}</span>
                  <a href={link.url}>{link.name}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel recent-activity">
            <h3>Recent Activity</h3>
            <ul>
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <li key={activity.id} className="activity-item">
                    <div className="activity-dot"></div>
                    <div>
                      <p>{activity.activity}</p>
                      <span>{activity.time}</span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="activity-item">
                  <p>No recent activities</p>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="tests-by-group">
          <h3>Tests by Group</h3>
          {isLoading ? (
            <p>Loading tests by group...</p>
          ) : Object.keys(testsByGroup).length > 0 ? (
            <div className="group-list">
              {Object.keys(testsByGroup)
                .sort((a, b) => a.localeCompare(b))
                .map(group => (
                  <div key={group} className="group-item">
                    <div className="group-header" onClick={() => toggleGroup(group)}>
                      <span>{group} ({testsByGroup[group].length} {testsByGroup[group].length === 1 ? 'Test' : 'Tests'})</span>
                      <span className={`toggle-icon ${expandedGroups[group] ? 'expanded' : ''}`}>▼</span>
                    </div>
                    <div className={`test-list ${expandedGroups[group] ? 'expanded' : ''}`}>
                      {testsByGroup[group].length > 0 ? (
                        <ul>
                          {testsByGroup[group].map((testName, index) => (
                            <li key={index}>{testName}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="no-tests">No tests available</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p>No groups found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;