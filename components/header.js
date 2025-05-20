/* React Component */
"use client";
import React from 'react';
import './header.css';
import Link from 'next/link';
import { getAuth, signOut } from "firebase/auth";
import { FaUserCircle } from "react-icons/fa";

export default function Header({ name }) {
    const [menuOpen, setMenuOpen] = React.useState(false);

    function toggleMenu() {
        setMenuOpen(prev => !prev);
    };

    function handleLogout() {
        const auth = getAuth();
        signOut(auth)
            .then(() => {
                console.log("Logged out");
                window.location.href = "/login";
            })
            .catch((error) => {
                console.error("Logout error:", error);
            });
    }

    return (
        <header>
            <div className="header-container">
                <div className="header-left">
                    <Link href="/home" className="logo-link">
                        <img
                            src="/images/logo.png"
                            alt="Logo"
                            className="logo"
                        />
                    </Link>
                    <h1>Hi {name},</h1>
                </div>

                <nav className="main-nav">
                    <ul>
                        <li className="nav-item">
                            <Link href="/home">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/friends">Friends</Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/groups">Groups</Link>
                        </li>
                    </ul>
                </nav>

                <div className="account-menu" onClick={toggleMenu}>
                    <FaUserCircle className="user-icon" />
                    {menuOpen && (
                        <ul className="dropdown">
                            <li><Link href="/profile">Profile</Link></li>
                            <li><button onClick={handleLogout}>Log Out</button></li>
                        </ul>
                    )}
                </div>
            </div>
        </header>
    );
}