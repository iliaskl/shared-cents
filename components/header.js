"use client";
import React from 'react';
import './header.css';
import Link from 'next/link';
import { getAuth, signOut } from "firebase/auth";

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
                    <Link href="/home">
                        <img
                            src="/images/logo.png"
                            alt="Logo"
                            className="logo"
                            style={{ width: "100px", height: "auto" }}
                        />
                    </Link>
                    <h1>Hi {name}</h1>
                </div>

                <nav>
                    <ul>
                        <li className="home">
                            <Link href="/home">Home</Link>
                        </li>
                        <li className="profile">
                            <Link href="/profile">Profile</Link>
                        </li>
                        <li className="about">
                            <Link href="/about">About Us</Link>
                        </li>
                        <li className="friends">
                            <Link href="/friends">Friends</Link>
                        </li>
                        <li className="groups">
                            <Link href="/groups">Groups</Link>
                        </li>
                        <li className="icon">
                            <div className="account-menu" onClick={toggleMenu}>
                                account icon
                                {menuOpen && (
                                    <ul className="dropdown">
                                        <li><Link href="/profile">Profile</Link></li>
                                        <li><button onClick={handleLogout}>Log Out</button></li>
                                    </ul>
                                )}
                            </div>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}