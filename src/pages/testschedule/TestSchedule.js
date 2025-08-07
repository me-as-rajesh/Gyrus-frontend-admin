import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, PlusCircle, X } from 'lucide-react';
import styles from './TestSchedule.module.css';

const TestSchedule = () => {
    const [showNewTest, setShowNewTest] = useState(false);
    const [activeTab, setActiveTab] = useState('Test History');
    const [activeGroup, setActiveGroup] = useState(null);
    const [groups, setGroups] = useState([]);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_BASE_URL = 'http://localhost:5000';

    const [formData, setFormData] = useState({
        testName: '',
        date: '',
        time: '',
        subject: 'All Subjects',
        mcqCount: 20,
        groupId: ''
    });

    const subjects = ['All Subjects', 'Physics', 'Chemistry', 'Botany', 'Zoology'];
    const mcqOptions = [20, 80, 100, "180 (NEET Pattern)"];

    useEffect(() => {
        const fetchTeacherGroups = async () => {
            try {
                setLoading(true);
                const teacherData = JSON.parse(localStorage.getItem('teacherProfile'));
                if (!teacherData?.email) {
                    throw new Error('Teacher email not found');
                }

                // Fetch groups
                const groupsResponse = await fetch(`${API_BASE_URL}/api/groups/teacher/${teacherData.email}`);
                if (!groupsResponse.ok) throw new Error('Failed to fetch groups');
                const groupsData = await groupsResponse.json();
                setGroups(groupsData);

                // Set first group as active if available
                if (groupsData.length > 0) {
                    setActiveGroup(groupsData[0]._id);
                    fetchTestsForGroup(groupsData[0]._id);
                }
            } catch (err) {
                setError(err.message);
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTeacherGroups();
    }, []);

    const fetchTestsForGroup = async (groupId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tests?groupId=${groupId}`);
            if (!response.ok) throw new Error('Failed to fetch tests');
            const data = await response.json();
            setTests(data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching tests:', err);
        }
    };

    const handleNewTestClick = () => {
        if (groups.length === 0) {
            alert('No groups available to create test');
            return;
        }
        setFormData(prev => ({
            ...prev,
            groupId: activeGroup || groups[0]?._id
        }));
        setShowNewTest(true);
    };

    const handleCloseDialog = () => {
        setShowNewTest(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleGroupChange = (groupId) => {
        setActiveGroup(groupId);
        fetchTestsForGroup(groupId);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/api/tests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    groupId: activeGroup
                })
            });

            if (!response.ok) throw new Error('Failed to create test');

            const newTest = await response.json();
            setTests(prev => [...prev, newTest]);
            setShowNewTest(false);
            setFormData({
                testName: '',
                date: '',
                time: '',
                subject: 'All Subjects',
                mcqCount: 20,
                groupId: ''
            });
        } catch (err) {
            setError(err.message);
            console.error('Error creating test:', err);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>Error: {error}</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Test Schedule</h1>
            </div>

            <div className={styles.tabsContainer}>
                <div className={styles.tabsLeft}>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'Test History' ? styles.active : ''}`}
                        onClick={() => setActiveTab('Test History')}
                    >
                        Test History
                    </button>
                </div>
                <button
                    className={styles.newTestButton}
                    onClick={handleNewTestClick}
                    disabled={groups.length === 0}
                >
                    <PlusCircle size={16} className={styles.newTestIcon} />
                    New Test
                </button>
            </div>

            <div className={styles.groupSelector}>
                {groups.length > 0 ? (
                    groups.map(group => (
                        <button
                            key={group._id}
                            className={`${styles.groupButton} ${activeGroup === group._id ? styles.active : ''}`}
                            onClick={() => handleGroupChange(group._id)}
                        >
                            {group.groupName}
                        </button>
                    ))
                ) : (
                    <div className={styles.noGroups}>No groups available</div>
                )}
            </div>

            {activeGroup && (
                <div className={styles.testList}>
                    <div className={styles.testHeader}>
                        <span>Test</span>
                        <span>Date</span>
                        <span>No. MCQ</span>
                        <span>Details</span>
                    </div>
                    {tests.length > 0 ? (
                        tests.map(test => (
                            <div key={test._id} className={styles.testItem}>
                                <div className={styles.testName}>{test.testName}</div>
                                <div className={styles.testDate}>
                                    <div>{new Date(test.date).toLocaleDateString()}</div>
                                    <div className={styles.testTime}>{test.time}</div>
                                </div>
                                <div className={styles.testMcq}>{test.mcqCount}</div>
                                <div className={styles.testActions}>
                                    <button className={styles.detailsButton}>Details</button>
                                    <button className={styles.attendButton}>Attend Students</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.noTests}>No tests scheduled for this group</div>
                    )}
                </div>
            )}

            {/* New Test Dialog */}
            {showNewTest && (
                <div className={styles.dialogBackdrop}>
                    <div className={styles.dialog}>
                        <button onClick={handleCloseDialog} className={styles.closeButton}>
                            <X size={20} />
                        </button>
                        <h2 className={styles.dialogTitle}>Create New Test</h2>

                        <form onSubmit={handleSubmit} className={styles.dialogForm}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Test Name</label>
                                    <input
                                        type="text"
                                        name="testName"
                                        value={formData.testName}
                                        onChange={handleInputChange}
                                        required
                                        className={styles.inputField}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Group</label>
                                    <select
                                        name="groupId"
                                        value={formData.groupId}
                                        onChange={handleInputChange}
                                        className={styles.selectField}
                                        required
                                    >
                                        {groups.map(group => (
                                            <option key={group._id} value={group._id}>
                                                {group.groupName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        required
                                        className={styles.inputField}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Subject</label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        className={styles.selectField}
                                    >
                                        {subjects.map(sub => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Time</label>
                                    <input
                                        type="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleInputChange}
                                        required
                                        className={styles.inputField}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>MCQ Count</label>
                                    <select
                                        name="mcqCount"
                                        value={formData.mcqCount}
                                        onChange={handleInputChange}
                                        className={styles.selectField}
                                    >
                                        {mcqOptions.map((count, index) => (
                                            <option key={index} value={count}>
                                                {count}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formActions}>
                                <button type="button" onClick={handleCloseDialog} className={styles.cancelButton}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitButton}>
                                    Create Test
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestSchedule;