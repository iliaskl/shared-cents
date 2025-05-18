'use client';

import { useState, useEffect } from 'react';
import { fetchUserProfile } from '@/components/pages/profile/profileService';

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchUserProfile();
        setDisplayName(data.displayName || '');
        setCurrency(data.currency || '');
        setEmail(data.email || '');
      } catch (error) {
        console.error('Failed to load profile:', error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSignOut = () => {
    alert('Signed out!');
    // Add actual sign-out logic
  };

  if (loading) {
    return <p style={{ padding: '2rem' }}>Loading profile...</p>;
  }

  return (
    <div style={{ /* ...your existing styles... */ }}>
      <h1>Profile</h1>
      <p>Hello, {displayName}.</p>
      <p style={{ color: '#666' }}>{email}</p>
      {/* ...rest of your JSX... */}
    </div>
  );
}
