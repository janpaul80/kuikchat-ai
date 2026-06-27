import React from 'react';
import styles from './BusinessSettings.module.css';
import tokens from './designTokens.module.css';

export default function BusinessSettings() {
  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb}>
        <span>Business Hub</span> <span className={styles.separator}>›</span>{' '}
        <span>Profile</span>
      </nav>
      <div className={styles.contentGrid}>
        <div className={styles.leftColumn}>
          <h2 className={styles.sectionTitle}>Business Settings</h2>
          <form className={styles.form}>
            <label>
              Name*
              <input type="text" className={styles.input} />
            </label>
            <label>
              Category*
              <input type="text" className={styles.input} />
            </label>
            <label>
              Website
              <input type="url" className={styles.input} />
            </label>
            <label>
              Email
              <input type="email" className={styles.input} />
            </label>
            <label>
              Phone
              <input type="tel" className={styles.input} />
            </label>
            <label>
              Address
              <input type="text" className={styles.input} />
            </label>
            <label>
              About / Description
              <textarea rows={4} className={styles.textarea} />
            </label>
            <div className={styles.linkContainer}>
              <button type="button" className={styles.linkButton}>
                Re-run Setup Wizard
              </button>
            </div>
            <button type="submit" className={styles.saveButton}>
              Save Settings
            </button>
          </form>
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.brandingSection}>
            <h3 className={styles.subheading}>Branding</h3>
            <div className={styles.uploads}>
              <div>
                <label>Logo</label>
                <input type="file" accept="image/*" />
              </div>
              <div>
                <label>Cover / Banner</label>
                <input type="file" accept="image/*" />
              </div>
            </div>
          </div>
          <div className={styles.hoursSection}>
            <h3 className={styles.subheading}>Opening Hours</h3>
            {/* Reuse hours controls from setup wizard */}
            <div className={styles.hoursGrid}>
              {/* ... */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
