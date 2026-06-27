import React from 'react';
import styles from './BusinessHub.module.css';

const promoText = {
  title: 'Upgrade to Business Pro',
  subtitle: 'Unlock verified badge, priority support & advanced analytics',
  button: 'Learn more',
};

type Row = { label: string; subtitle?: string; icon: string; state?: string };

const growItems: Row[] = [
  { label: 'Catalog', subtitle: 'List your products & services', icon: 'storefront' },
  { label: 'Broadcasts', subtitle: 'Send messages to multiple contacts', icon: 'send' },
];
const organizeItems: Row[] = [
  { label: 'Lists & Labels', subtitle: 'Organise contacts with lists & tags', icon: 'label', state: 'SOON' },
  { label: 'Greeting message', subtitle: "Auto-send a welcome to new contacts", icon: 'chat_bubble', state: 'SOON' },
  { label: 'Away message', subtitle: "Reply automatically when you're away", icon: 'access_time', state: 'SOON' },
  { label: 'Quick replies', subtitle: 'Shortcut templates for fast replies', icon: 'bookmark', state: 'Active' },
  { label: 'Connect Instagram & Facebook', subtitle: 'Sync messages from your social pages', icon: 'camera_alt', state: 'SOON' },
];
const manageItems: Row[] = [
  { label: 'Business Profile', subtitle: 'Edit name, category, hours, branding', icon: 'business' },
];

export default function BusinessHub() {
  const renderSection = (title: string, items: Row[]) => (
    <section className={styles.section}>
      <div className={styles.sectionLabel}>{title}</div>
      {items.map((item) => (
        <div key={item.label} className={styles.row}>
          <span className={`material-icons ${styles.icon}`}>{item.icon}</span>
          <div className={styles.texts}>
            <div className={styles.label}>{item.label}</div>
            {item.subtitle && <div className={styles.subtitle}>{item.subtitle}</div>}
          </div>
          {item.state && <div className={styles.state}>{item.state}</div>}
        </div>
      ))}
    </section>
  );

  return (
    <div className={styles.container}>
      <div className={styles.promoCard}>
        <h3 className={styles.promoTitle}>{promoText.title}</h3>
        <p className={styles.promoSubtitle}>{promoText.subtitle}</p>
        <button className={styles.learnButton}>{promoText.button}</button>
      </div>
      {renderSection('GROW', growItems)}
      {renderSection('ORGANIZE', organizeItems)}
      {renderSection('MANAGE', manageItems)}
    </div>
  );
}
