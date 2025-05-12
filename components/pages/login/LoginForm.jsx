"use client";
import React,{useState} from "react";
import Link from "next/link";

export default function LoginForm({ email, setEmail, password, setPassword, handleLogin }) {
    
    return (
    <div className="login-form-container">
        <div className="login-box">
        <div className="logo-wrapper">
            <img src="/images/Logo.png" alt="SharedCents Logo" width={120} height={120} className="landing-logo" />
        </div>
        <h2>User Login</h2>
        <form onSubmit={handleLogin} className="login-form">
        <input 
            type="email" 
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            required
        />
        <input 
            type="password" 
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required
        />
        <button type="submit">Login</button>
        </form>
        <p className="signup-link">
            Don't have an account? <Link href="/register">Sign up</Link>
        </p>
        </div>
    </div>
  );
}