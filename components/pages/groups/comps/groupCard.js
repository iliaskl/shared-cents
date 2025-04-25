/*
* groupCard.js
* Card component for displaying group information
* Created by: Ilias Kladakis
* Date: April 2025
*
* This component renders an individual group card with:
* - Color-coded visual status (owing, owed, settled)
* - Balance information and creation date
* - Action buttons for viewing, leaving, and archiving
* - Conditional display of leave button based on balance status
*/

"use client";

import styles from './groupCard.module.css';

/**
 * GroupCard Component
 * 
 * @param {Object} group - Group data object containing id, name, balance, creationDate, archived
 * @param {string} color - Color scheme for the card (red, blue, or green)
 * @param {Function} onView - Callback function for view group action
 * @param {Function} onLeave - Callback function for leave group action
 * @param {Function} onToggleArchive - Callback function for archive/unarchive toggle
 * @returns {JSX.Element} - Rendered card component
 */
const GroupCard = ({ group, color, onView, onLeave, onToggleArchive }) => {
    const { id, name, balance, creationDate, archived } = group;

    /**
     * Converts ISO date string to localized date format
     * 
     * @param {string} dateString - ISO date string
     * @returns {string} - Formatted date string (e.g., "Apr 15, 2025")
     */
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    /**
     * Formats balance amount with appropriate text based on value
     * 
     * @param {number} balance - Current balance amount
     * @returns {string} - Formatted balance string with appropriate context
     */
    const formatBalance = (balance) => {
        if (balance < 0) {
            return `You owe $${Math.abs(balance).toFixed(2)}`;
        } else if (balance > 0) {
            return `You are owed $${balance.toFixed(2)}`;
        } else {
            return 'Settled';
        }
    };

    // Determine if user can leave the group (only if balance is settled)
    const canLeaveGroup = balance === 0 && !archived;

    return (
        <div className={`${styles.card} ${styles[color]} ${archived ? styles.archived : ''}`}>
            <div className={styles.archiveButton} onClick={onToggleArchive} title={archived ? "Unarchive Group" : "Archive Group"}>
                {archived ? (
                    // Unarchive button (box with minus)
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                ) : (
                    // Archive button (box with plus)
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                )}
            </div>

            <div className={styles.header}>
                <h3 className={styles.groupName}>{name}</h3>
            </div>

            <div className={styles.dateInfo}>
                Created: {formatDate(creationDate)}
            </div>

            <div className={styles.balanceInfo}>
                {formatBalance(balance)}
            </div>

            <div className={styles.buttonsContainer}>
                <button
                    className={styles.viewButton}
                    onClick={onView}
                >
                    View Group
                </button>

                {canLeaveGroup && (
                    <button
                        className={styles.leaveButton}
                        onClick={onLeave}
                    >
                        Leave Group
                    </button>
                )}
            </div>
        </div>
    );
};

export default GroupCard;