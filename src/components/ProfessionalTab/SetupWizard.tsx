import React from 'react';
import styles from './SetupWizard.module.css';
import tokens from './designTokens.module.css';

export interface SetupWizardProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<SetupWizardProps> = ({ currentStep, totalSteps }) => {
  const pct = (currentStep / totalSteps) * 100;
  return (
    <div className={styles.stepIndicator}>
      <span className={styles.stepText}>Step {currentStep} of {totalSteps}</span>
      <div className={styles.progressBarBackground}>
        <div
          className={styles.progressBarFill}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default function SetupWizard({ currentStep, totalSteps }: SetupWizardProps) {
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className={styles.stepContent}>
            <label>
              Business Name
              <input
                type="text"
                placeholder="Enter your business name"
                className={styles.inputField}
              />
            </label>
          </div>
        );
      case 2:
        return (
          <div className={styles.stepContent}>
            <label>Business Category (up to 3)</label>
            <div className={styles.chipsContainer}>
              {/* Chips and dropdown */}
              <div className={styles.chip}>Restaurant</div>
              <div className={styles.chip}>Retail</div>
              <div className={styles.chip}>Services</div>
              <button className={styles.linkButton}>See more categories</button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className={styles.stepContent}>
            <label>Business Hours</label>
            {/* Simplified hours control */}
            <div className={styles.hoursGrid}>
              <div>
                <input type="checkbox" id="always-open" />
                <label htmlFor="always-open">Always Open (24h)</label>
              </div>
              <div>
                <input type="checkbox" id="by-appointment" />
                <label htmlFor="by-appointment">By Appointment</label>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className={styles.stepContent}>
            <label>
              Upload Business Logo (256×256)
              <input type="file" accept="image/*" />
            </label>
            <label>
              Upload Cover/Banner (1200×400)
              <input type="file" accept="image/*" />
            </label>
          </div>
        );
      case 5:
        return (
          <div className={styles.stepContent}>
            <label>
              Website
              <input type="url" placeholder="https://example.com" />
            </label>
            <label>
              Business Email
              <input type="email" placeholder="email@business.com" />
            </label>
            <label>
              Phone Number
              <input type="tel" placeholder="(555) 555-5555" />
            </label>
            <label>
              Address
              <input type="text" placeholder="123 Market St" />
            </label>
          </div>
        );
      case 6:
        return (
          <div className={styles.stepContent}>
            <label>
              About / Description
              <textarea placeholder="Describe your business" rows={4} />
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.wizardContainer}>
      <h2 className={styles.title}>Create your business profile</h2>
      <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
      {renderStep()}
      <button className={styles.saveButton}>Save & Finish</button>
    </div>
  );
}