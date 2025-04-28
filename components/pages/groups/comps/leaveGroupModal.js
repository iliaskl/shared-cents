/*
* leaveGroupModal.js
* Modal component for group leave confirmation
* Created by: Ilias Kladakis
* Date: April 2025
*
* This component provides a confirmation dialog when a user attempts to leave a group:
* - Displays warning about the consequences of leaving
* - Provides options to cancel or confirm the leave action
* - Receives group data and callback functions as props
* - Uses consistent styling with other modal components
*/

"use client";

import styles from './leaveGroupModal.module.css';

/**
 * LeaveGroupModal Component
 * 
 * @param {Object} group - The group object containing group details (id, name, etc.)
 * @param {Function} onCancel - Callback function to handle modal cancellation
 * @param {Function} onConfirm - Callback function to execute when leave action is confirmed
 * @returns {JSX.Element} - Rendered modal component
 */
const LeaveGroupModal = ({ group, onCancel, onConfirm }) => {
    return (
        // Modal backdrop overlay that covers the entire screen
        <div className={styles.modalOverlay}>
            // Main modal container with appropriate styling
            <div className={styles.modalContent}>
                // Header section with title and close button
                <div className={styles.modalHeader}>
                    <h2>Leave Group</h2>
                    <button className={styles.closeButton} onClick={onCancel}>×</button>
                </div>

                // Body section containing confirmation text and warning
                <div className={styles.modalBody}>
                    <p className={styles.confirmText}>
                        Are you sure you want to leave the group <span className={styles.groupName}>{group.name}</span>?
                    </p>
                    <p className={styles.warningText}>
                        You won't be able to see this group anymore.
                    </p>
                </div>

                // Footer section with action buttons
                <div className={styles.buttonContainer}>
                    <button
                        className={styles.cancelButton}
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className={styles.confirmButton}
                        onClick={onConfirm}
                    >
                        Leave Group
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeaveGroupModal;