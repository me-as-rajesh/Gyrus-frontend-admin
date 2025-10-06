import React, { useState } from 'react';
import styles from './AdminContact.module.css';

const AdminContact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');
    try {
      const response = await fetch("https://gyrus-backend-admin.onrender.com/api/fetch/contact-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setStatus(data.message);

      if (data.success) {
        setFormData({ name: '', email: '', message: '' });
      }
    } catch (error) {
      setStatus("Error sending message!");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Contact Admin</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="message" className={styles.label}>Message</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            className={styles.textarea}
            rows="5"
            required
          ></textarea>
        </div>
        <button type="submit" className={styles.button}>Submit</button>
      </form>
      {status && <p className={styles.status}>{status}</p>}
    </div>
  );
};

export default AdminContact;
