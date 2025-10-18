import React, { useState, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import styles from './Report.module.css';

const Reports = () => {
    const [groups, setGroups] = useState([]);
    const [activeGroup, setActiveGroup] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_BASE_URL = 'http://localhost:5000';

    // (Optional) Add charts here later

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                const teacherData = JSON.parse(localStorage.getItem('teacherProfile'));
                if (!teacherData || !teacherData.email) {
                    setError('Teacher profile not found.');
                    setLoading(false);
                    return;
                }
                const response = await fetch(`${API_BASE_URL}/api/reports/teacher/${encodeURIComponent(teacherData.email)}`);
                const data = await response.json();

                // If backend returns { status, count, reports } format
                let reportsArr = Array.isArray(data) ? data : (data.reports || []);
                if (!Array.isArray(reportsArr) || reportsArr.length === 0) {
                    setGroups([]);
                    setActiveGroup(null);
                    setError(null);
                    setLoading(false);
                    return;
                }

                // Group by group name
                const groupedData = reportsArr.reduce((acc, item) => {
                    const groupName = item.groupName || item.group;
                    const studentName = item.studentName || item.student;
                    if (!groupName || !studentName || typeof item.score !== 'number') {
                        console.warn('Skipping invalid entry:', item);
                        return acc;
                    }
                    const studentObj = {
                        _id: item._id,
                        name: studentName,
                        score: item.score,
                        totalQuestions: item.totalQuestions,
                        answers: item.answers,
                        testName: item.testName,
                        subject: item.subject,
                        standard: item.standard,
                        timeTaken: item.timeTaken,
                        date: item.date,
                        teacherEmail: item.teacherEmail,
                        studentEmail: item.studentEmail
                    };
                    const group = acc.find(g => g.group === groupName);
                    if (group) {
                        group.students.push(studentObj);
                    } else {
                        acc.push({
                            group: groupName,
                            students: [studentObj]
                        });
                    }
                    return acc;
                }, []);

                setGroups(groupedData);
                if (groupedData.length > 0) {
                    setActiveGroup(groupedData[0].group);
                }
                setError(null);
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

    // Only show 'No reports found' if not loading, not error, and groups is empty
    if (!loading && !error && groups.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.noReportsFound}>
                    <h2>No reports found for this teacher.</h2>
                    <p>Please check back later or contact admin.</p>
                </div>
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
                <div className={styles.studentList}>
                    <h2 className={styles.sectionTitle}>Students</h2>
                    <div className={styles.studentTable}>
                        {getActiveGroupStudents().length > 0 ? (
                            getActiveGroupStudents().map(student => (
                                <div key={student._id} className={styles.studentRow}>
                                    <div className={styles.studentName}>{student.name}</div>
                                    <div className={styles.studentScore}>Score: {student.score}/{student.totalQuestions}</div>
                                    <button
                                        onClick={() => handleViewResult(student)}
                                        className={styles.resultButton}
                                    >
                                        Details
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
                <div className={styles.resultModal} onClick={closeResultView}>
                    <div className={styles.resultModalContent} onClick={(e) => e.stopPropagation()}>
                        <button onClick={closeResultView} className={styles.closeButton}>
                            <X size={24} />
                        </button>
                        
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalStudentName}>{selectedStudent.name}</h2>
                            <p className={styles.modalGroupName}>
                                Report for {selectedStudent.testName}
                            </p>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.mainStats}>
                                <div className={styles.statCard}>
                                    <span className={styles.statLabel}>Score</span>
                                    <span className={styles.statValue}>
                                        {selectedStudent.score} / {selectedStudent.totalQuestions}
                                    </span>
                                </div>
                                <div className={styles.statCard}>
                                    <span className={styles.statLabel}>Percentage</span>
                                    <span className={styles.statValue}>
                                        {Math.round((selectedStudent.score / selectedStudent.totalQuestions) * 100)}%
                                    </span>
                                </div>
                                <div className={styles.statCard}>
                                    <span className={styles.statLabel}>Time Taken</span>
                                    <span className={styles.statValue}>{selectedStudent.timeTaken}s</span>
                                </div>
                            </div>

                            <div className={styles.detailGrid}>
                                <p><strong>Student:</strong> {selectedStudent.name} {selectedStudent.studentEmail ? `(${selectedStudent.studentEmail})` : ''}</p>
                                <p><strong>Group:</strong> {activeGroup || 'N/A'}</p>
                                <p><strong>Subject:</strong> {selectedStudent.subject}</p>
                                <p><strong>Standard:</strong> {selectedStudent.standard}</p>
                                <p><strong>Date:</strong> {selectedStudent.date ? new Date(selectedStudent.date).toLocaleDateString() : 'N/A'}</p>
                                <p><strong>Teacher:</strong> {selectedStudent.teacherEmail || 'Unknown'}</p>
                            </div>

                            <div className={styles.answersSection}>
                                <h3 className={styles.answersTitle}>Answers</h3>
                                {Array.isArray(selectedStudent.answers) ? (
                                    <div className={styles.answersGrid}>
                                        {selectedStudent.answers.map((a, idx) => (
                                            <div key={idx} className={`${styles.answerCard} ${a.isCorrect ? styles.correct : styles.incorrect}`}>
                                                <div className={styles.answerQNo}>Q{a.qNo}</div>
                                                <div className={styles.answerBody}>
                                                    <p><strong>Selected:</strong> {a.selected ?? '-'}</p>
                                                    {!a.isCorrect && <p><strong>Correct:</strong> {a.correct ?? '-'}</p>}
                                                </div>
                                                <div className={styles.answerStatusIcon}>
                                                    {a.isCorrect ? '✔' : '✖'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <pre>{JSON.stringify(selectedStudent.answers, null, 2)}</pre>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;