"use client";
import React, { useState, useEffect } from 'react';
import Header from "@/components/header";
import Footer from "@/components/footer";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";
import FriendsContent from '@/components/pages/friends/FriendsContent';
import FriendCard from '@/components/pages/friends/FriendCard';

/*export default function FriendsPage() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUsername(user.email.split("@")[0]);
      }
    });
    return () => unsubscribe();
  }, []);*/

const pendingRequests = ['alice@email.com', 'bob@email.com'];
const friendsList = ['John Doe', 'Jane Smith'];

export default function FriendsPage() {
  return (
    <>
      <Header />
      <main style={{
        display: 'flex',
        height: 'calc(100vh - 160px)', // adjust depending on header/footer height
        padding: '1rem',
        gap: '1rem'
      }}>
        {/* LEFT SIDE: Pending Requests + Add Friend */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Pending Requests */}
          <section style={{
            flex: 1,
            backgroundColor: '#f9f9f9',
            padding: '1rem',
            borderRadius: '8px',
            boxShadow: '0 0 8px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#333',
              marginBottom: '0.5rem'
            }}>
              Pending Friend Requests
            </h2>
            <ul>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ fontSize: '1rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>alice@email.com</li>
                <li style={{ fontSize: '1rem', fontWeight: '500', color: '#333' }}>bob@email.com</li>
              </ul>
              {/* Replace with dynamic content later */}
            </ul>
          </section>

          {/* Add Friend */}
          <section style={{
            flex: 1,
            backgroundColor: '#f1f1f1',
            padding: '1rem',
            borderRadius: '8px',
            boxShadow: '0 0 8px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#333',
              marginBottom: '0.5rem'
            }}>
              Add a Friend
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              alert("Friend request sent (placeholder)");
            }}>
              <input
                type="email"
                placeholder="Enter friend's email"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '0.75rem',
                  border: '2px solid #0070f3',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  outline: 'none',
                  color: '#333',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              />

              <button
                type="submit"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Send Request
              </button>
            </form>
          </section>
        </div>

        {/* RIGHT SIDE: Current Friends List */}
        <div style={{
          flex: 1,
          backgroundColor: '#fff',
          padding: '1rem',
          borderRadius: '8px',
          boxShadow: '0 0 8px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#333',
            marginBottom: '0.5rem'
          }}>
            Your Friends
          </h2>
          <ul>
            {pendingRequests.map((email, idx) => (
              <FriendCard key={idx} email={email} />
            ))}
          </ul>

          <ul>
            {friendsList.map((name, idx) => (
              <FriendCard key={idx} name={name} />
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
