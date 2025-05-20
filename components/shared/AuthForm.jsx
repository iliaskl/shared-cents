// components/shared/AuthForm.jsx
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AuthForm({
    title,
    email,
    setEmail,
    password,
    setPassword,
    handleSubmit,
    buttonText,
    alternateText,
    alternatePath,
    errorMessage
}) {
    const [logoLoaded, setLogoLoaded] = useState(false);

    // Check if logo file exists
    useEffect(() => {
        const img = new Image();
        img.src = '/images/Logo_White.png';
        img.onload = () => setLogoLoaded(true);
        img.onerror = () => {
            console.error('Logo image not found at /images/Logo_White.png');
            setLogoLoaded(false);
        };
    }, []);

    return (
        <div className="auth-container" style={{
            width: '500px',
            maxWidth: '90%',
            padding: '30px',
            borderRadius: '8px',
            backgroundColor: 'white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            {logoLoaded ? (
                <div className="logo-container" style={{ marginBottom: '20px' }}>
                    {/* Replaced Next.js Image with standard img tag */}
                    <img
                        src="/images/Logo_White.png"
                        alt="SharedCents Logo"
                        width={200}
                        height={80}
                        style={{ objectFit: 'contain' }}
                    />
                </div>
            ) : (
                <div className="logo-placeholder" style={{
                    marginBottom: '20px',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#333'
                }}>
                    SharedCents
                </div>
            )}

            <h2 style={{
                fontSize: '24px',
                marginBottom: '30px',
                fontWeight: '500',
                color: '#333'
            }}>{title}</h2>

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <div style={{ marginBottom: '16px', width: '100%' }}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '16px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '25px', width: '100%' }}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '16px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {errorMessage && (
                    <div style={{
                        color: 'red',
                        marginBottom: '16px',
                        fontSize: '14px',
                        textAlign: 'center'
                    }}>
                        {errorMessage}
                    </div>
                )}

                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: 'black',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        marginBottom: '25px'
                    }}
                >
                    {buttonText}
                </button>

                <div style={{
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#555'
                }}>
                    {alternateText.includes("Sign up") ? (
                        <span>
                            Don't have an account? <Link
                                href={alternatePath}
                                style={{
                                    color: '#555',
                                    textDecoration: 'underline',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Sign up
                            </Link>
                        </span>
                    ) : (
                        <span>
                            Already have an account? <Link
                                href={alternatePath}
                                style={{
                                    color: '#555',
                                    textDecoration: 'underline',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Log in
                            </Link>
                        </span>
                    )}
                </div>
            </form>
        </div>
    );
}