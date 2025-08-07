import React, { useState } from 'react';
import styles from './adminschools.module.css';

const schoolData = [
  {
    schoolName: 'Harvard University',
    teacherName: 'John Smith',
    department: 'Computer Science',
    plan: 'Paid',
  },
  {
    schoolName: 'Stanford University',
    teacherName: 'Alice Johnson',
    department: 'Engineering',
    plan: 'Paid',
  },
  {
    schoolName: 'MIT',
    teacherName: 'Bob Williams',
    department: 'Mathematics',
    plan: 'Free',
  },
  {
    schoolName: 'UCLA',
    teacherName: 'Emily Brown',
    department: 'Physics',
    plan: 'Free',
  },
];

const AdminSchools = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(null);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleRowClick = (school) => {
    setSelectedSchool(school);
  };

  const closeModal = () => {
    setSelectedSchool(null);
  };

  const filteredSchools = schoolData.filter(
    (school) =>
      school.schoolName.toLowerCase().includes(searchQuery) ||
      school.teacherName.toLowerCase().includes(searchQuery) ||
      school.department.toLowerCase().includes(searchQuery) ||
      school.plan.toLowerCase().includes(searchQuery)
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>School Information</h1>
      <div className={styles.searchBar}>
        <input
          type="text"
          id="searchInput"
          placeholder="Search schools..."
          value={searchQuery}
          onChange={handleSearch}
          className={styles.searchInput}
        />
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>School Name</th>
              <th>Teacher Name</th>
              <th>Department</th>
              <th>Plan</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchools.map((school, index) => (
              <tr
                key={index}
                onClick={() => handleRowClick(school)}
                className={styles.tableRow}
              >
                <td>{school.schoolName}</td>
                <td>{school.teacherName}</td>
                <td>{school.department}</td>
                <td>
                  <span
                    className={
                      school.plan === 'Free' ? styles.planFree : styles.planPaid
                    }
                  >
                    {school.plan}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedSchool && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal}>
            <button className={styles.closeButton} onClick={closeModal}>
              &times;
            </button>
            <h2>{selectedSchool.schoolName}</h2>
            <p>
              <strong>Teacher:</strong> {selectedSchool.teacherName}
            </p>
            <p>
              <strong>Department:</strong> {selectedSchool.department}
            </p>
            <p>
              <strong>Plan:</strong>{' '}
              <span
                className={
                  selectedSchool.plan === 'Free'
                    ? styles.planFree
                    : styles.planPaid
                }
              >
                {selectedSchool.plan}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchools;