import React, { useState } from 'react';
import styles from './ProfessionalTab.module.css';
import { useBusinessProfile } from '../../hooks/useBusinessProfile';

export default function ProfessionalTabWrapper() {
  const { profile, isLoading } = useBusinessProfile();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  let mode: 'entry' | 'setup' | 'hub' | 'settings';
  if (!profile) {
    mode = 'entry';
  } else if (!profile.isComplete) {
    mode = 'setup';
  } else {
    mode = 'hub';
  }

  return <ProfessionalTab mode={mode} setupStep={profile?.step} />;
}
