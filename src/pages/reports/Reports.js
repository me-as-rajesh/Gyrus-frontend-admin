import React, { useState, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import styles from './Report.module.css';

const Reports = () => {
    const [groups, setGroups] = useState([]);
    const [activeGroup, setActiveGroup] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_BASE_URL = 'http://localhost:5000';

    // Calculate grade based on score
    const calculateGrade = (score) => {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B+';
        if (score >= 60) return 'B';
        if (score >= 50) return 'C';
        return 'F';
    };

    // Calculate pie chart data based on average scores for the active group
    const getPieData = () => {
        if (!activeGroup) return [];
        const groupData = groups.filter(g => g.group === activeGroup);
        if (groupData.length === 0) return [];

        const subjects = ['physics', 'chemistry', 'zoology', 'botany'];
        return subjects.map(subject => {
            // Filter valid students with results
            const validStudents = groupData[0].students.filter(
                student => student.results && typeof student.results[subject] === 'number'
            );
            if (validStudents.length === 0) {
                return { name: subject.charAt(0).toUpperCase() + subject.slice(1), value: 0 };
            }
            const totalScore = validStudents.reduce((sum, student) => sum + (student.results[subject] || 0), 0);
            const averageScore = totalScore / validStudents.length;
            return { name: subject.charAt(0).toUpperCase() + subject.slice(1), value: Math.round(averageScore) };
        });
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                const teacherData = JSON.parse(localStorage.getItem('teacherProfile'));
                // if (!teacherData?.email || teacherData.email !== 'arun@gmail.com') {
                //     throw new Error('Invalid or unauthorized teacher email');
                // }

                const response = await fetch(`${API_BASE_URL}/api/reports/${teacherData.email}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch reports');
                }
                const data = await response.json();

                // Group data by group name, filter out invalid entries
                const groupedData = data.reduce((acc, item) => {
                    // Skip entries with missing or invalid results
                    if (!item.group || !item.student || !item.results || typeof item.results !== 'object') {
                        console.warn('Skipping invalid entry:', item);
                        return acc;
                    }

                    const group = acc.find(g => g.group === item.group);
                    if (group) {
                        group.students.push({
                            _id: item._id,
                            name: item.student,
                            results: item.results
                        });
                    } else {
                        acc.push({
                            group: item.group,
                            students: [{
                                _id: item._id,
                                name: item.student,
                                results: item.results
                            }]
                        });
                    }
                    return acc;
                }, []);

                setGroups(groupedData);
                if (groupedData.length > 0) {
                    setActiveGroup(groupedData[0].group);
                }
            } catch (err) {
                setError(err.message);
                console.error('Error fetching reports:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const handleGroupChange = (groupName) => {
        setActiveGroup(groupName);
        setSelectedStudent(null); // Reset selected student when group changes
    };

    const getActiveGroupStudents = () => {
        if (!activeGroup) return [];
        const group = groups.find(g => g.group === activeGroup);
        return group ? group.students : [];
    };

    const handleViewResult = (student) => {
        setSelectedStudent(student);
    };

    const closeResultView = () => {
        setSelectedStudent(null);
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading reports...</div>
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

    if (groups.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.noGroups}>No groups found</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Reports</h1>
            </div>
            
            <div className={styles.groupSelectorContainer}>
                <div className={styles.customDropdown}>
                    <select
                        value={activeGroup || ''}
                        onChange={(e) => handleGroupChange(e.target.value)}
                        className={styles.groupDropdown}
                    >
                        {groups.map(group => (
                            <option key={group.group} value={group.group}>
                                {group.group}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className={styles.dropdownIcon} />
                </div>
            </div>

            <div className={styles.reportContent}>
                <div className={styles.pieChartContainer}>
                    <h2 className={styles.sectionTitle}>
                        {activeGroup || 'Select a group'}
                    </h2>
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={getPieData()}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {getPieData().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={styles.studentList}>
                    <h2 className={styles.sectionTitle}>Students</h2>
                    <div className={styles.studentTable}>
                        {getActiveGroupStudents().length > 0 ? (
                            getActiveGroupStudents().map(student => (
                                <div key={student._id} className={styles.studentRow}>
                                    <div className={styles.studentName}>{student.name}</div>
                                    <button 
                                        onClick={() => handleViewResult(student)}
                                        className={styles.resultButton}
                                    >
                                        Result
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className={styles.noStudents}>No students in this group</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Result Modal */}
            {selectedStudent && (
                <div className={styles.resultModal}>
                    <div className={styles.resultModalContent}>
                        <button onClick={closeResultView} className={styles.closeButton}>
                            <X size={20} />
                        </button>
                        <h2 className={styles.studentName}>{selectedStudent.name}</h2>
                        <p className={styles.groupName}>
                            Group: {activeGroup || 'N/A'}
                        </p>
                        
                        <div className={styles.resultDetails}>
                            {selectedStudent.results && Object.entries(selectedStudent.results).map(([subject, score]) => (
                                <div key={subject} className={styles.resultCard}>
                                    <h3>{subject.charAt(0).toUpperCase() + subject.slice(1)}</h3>
                                    <p>Score: {score}/100</p>
                                    <p>Grade: {calculateGrade(score)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;