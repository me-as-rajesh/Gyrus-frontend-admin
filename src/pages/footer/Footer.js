import React from 'react';
import styles from './Footer.module.css';

const Footer = () => (
  <footer className={styles.footer}>
    <div className={styles.container}>
      <span className={styles.text}>
        © {new Date().getFullYear()} Gyrus. All rights reserved.
      </span>
    </div>
  </footer>
);

export default Footer;