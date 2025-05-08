import React from 'react';
import './footer.css';

export default function Footer() {
    return (
        <footer>
            <div className="footer-container">
                <p>© {new Date().getFullYear()} SharedCents. All rights reserved.</p>
            </div>
        </footer>
    );
}