import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown } from 'lucide-react';
import styles from './StudentTable.module.css';

const StudentTable = () => {
    const [groups, setGroups] = useState([]);
    const [activeGroup, setActiveGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_BASE_URL = 'https://gyrus-backend-admin.onrender.com';

    useEffect(() => {
        const fetchTeacherGroups = async () => {
            try {
                setLoading(true);
                // Get teacher email from localStorage
                const teacherData = JSON.parse(localStorage.getItem('teacherProfile'));
                if (!teacherData?.email) {
                    throw new Error('Teacher email not found');
                }

                const response = await fetch(`${API_BASE_URL}/api/groups/teacher/${teacherData.email}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch groups');
                }
                const data = await response.json();
                setGroups(data);
                
                // Set the first group as active by default if available
                if (data.length > 0) {
                    setActiveGroup(data[0]._id);
                }
            } catch (err) {
                setError(err.message);
                console.error('Error fetching groups:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTeacherGroups();
    }, []);

    const handleGroupChange = (groupId) => {
        setActiveGroup(groupId);
    };

    const getActiveGroupStudents = () => {
        if (!activeGroup) return [];
        const group = groups.find(g => g._id === activeGroup);
        return group ? group.students : [];
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading groups...</div>
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
                <h1 className={styles.title}>Student Table</h1>
            </div>

            <div className={styles.groupSelectorContainer}>
                <div className={styles.customDropdown}>
                    <select
                        value={activeGroup || ''}
                        onChange={(e) => handleGroupChange(e.target.value)}
                        className={styles.groupDropdown}
                    >
                        {groups.map(group => (
                            <option key={group._id} value={group._id}>
                                {group.groupName} ({group.section})
                            </option>
                        ))}
                    </select>
                    <ChevronDown className={styles.dropdownIcon} />
                </div>
            </div>
            
            <div className={styles.studentTable}>
                <h2 className={styles.groupTitle}>
                    {groups.find(g => g._id === activeGroup)?.groupName || 'Select a group'}
                    {groups.find(g => g._id === activeGroup)?.section && (
                        <span className={styles.groupSection}>
                            {' : '}
                            {groups.find(g => g._id === activeGroup)?.currentStudentCount}
                            {' Members'}
                        </span>
                    )}
                </h2>

                {getActiveGroupStudents().length > 0 ? (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Register No</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getActiveGroupStudents().map((student, idx) => (
                                <tr key={student._id || student.registerNo}>
                                    <td>{idx + 1}</td>
                                    <td>{student.name}</td>
                                    <td>{student.registerNo || student.regNo}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className={styles.noStudents}>No students in this group</div>
                )}
            </div>
        </div>
    );
};

export default StudentTable;