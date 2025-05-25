'use client';

import { useState, useEffect } from 'react';
import { fetchUserProfile } from '@/components/pages/profile/profileService';
import Header from "@/components/header";
import Footer from "@/components/footer";

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

  const handleSave = async () => {
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName,
          currency,
          password, // only if filled
        }),
      });

      if (!res.ok) throw new Error('Failed to update profile');
      alert('Profile updated!');
    } catch (error) {
      console.error('Error updating profile:', error.message);
      alert('Error saving changes.');
    }
  };

  const handleSignOut = () => {
    alert('Signed out!');
    // Add actual sign-out logic here
  };

  if (loading) {
    return <p style={{ padding: '2rem' }}>Loading profile...</p>;
  }

  return (
    <>
      <Header />
      <div
        style={{
          backgroundColor: 'white',
          color: '#333',
          minHeight: '100vh',
          padding: '2rem',
          fontFamily: 'sans-serif',
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        <h1>Profile</h1>

        <p>Hello, {displayName}.</p>
        <p style={{ color: '#666' }}>{email}</p>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter new display name"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          >
            <option value="">Select currency</option>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="JPY">JPY - Japanese Yen</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          style={{
            backgroundColor: '#5cb85c',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '1rem',
            marginRight: '1rem',
          }}
        >
          Save Changes
        </button>

        <button
          onClick={handleSignOut}
          style={{
            backgroundColor: '#d9534f',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '1rem',
          }}
        >
          Sign Out
        </button>
      </div>
      <Footer />
    </>
  );
}
