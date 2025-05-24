
import React, { useState } from 'react';

export default function FriendCard({ name, email, onRemove }) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <li style={{
      position: 'relative',
      fontSize: '1rem',
      fontWeight: '500',
      color: '#333',
      marginBottom: '0.5rem',
      padding: '0.75rem 1rem',
      backgroundColor: '#f5f5f5',
      borderRadius: '6px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <span>{name || email}</span>

      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowOptions(prev => !prev)}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '1.25rem',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ⋯
        </button>

        {showOptions && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '0.5rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            zIndex: 1
          }}>
            <button
              onClick={onRemove}
              style={{
                backgroundColor: '#e53e3e',
                color: 'white',
                padding: '0.25rem 0.75rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Remove Friend
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
