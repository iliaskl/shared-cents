import React from 'react';
import './footer.css';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer>
            <div className="footer-container">
                <p>© {new Date().getFullYear()} SharedCents. All rights reserved. </p>
                <li className="about">
                    <Link href="/about">About Us</Link>
                 </li>
            </div>
        </footer>
    );
}