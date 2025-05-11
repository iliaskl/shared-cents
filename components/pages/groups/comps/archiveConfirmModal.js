/*
* archiveConfirmModal.js
* Modal component for confirming group archiving
* Created by: Based on CreateGroupModal pattern
* Date: May 2025
*
* This component displays a confirmation dialog before archiving a group:
* - Shows warning for unsettled groups
* - Provides immediate archiving for settled groups
* - Allows users to cancel the operation
*/

"use client";

import { useState, useEffect } from 'react';
import styles from './archiveConfirmModal.module.css';

const ArchiveConfirmModal = ({ onClose, onConfirm, group }) => {
    const { name, balance } = group;
    const isSettled = balance === 0;

    // Get the appropriate color for status icon
    const getStatusColor = () => {
        if (balance < 0) return '#A63A50';
        if (balance > 0) return '#34558B';
        return '#93AD70';
    };

    // Close the modal when Escape key is pressed
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [onClose]);

    // Stop propagation to prevent closing when clicking inside the modal
    const handleModalClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={handleModalClick}>
                <div className={styles.modalHeader}>
                    <h2>Archive "{name}"</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        &times;
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {isSettled ? (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#93AD70" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <path d="M16 8v8M8 8v8M12 8v8" />
                                </svg>
                                <span style={{ color: '#93AD70', fontWeight: 'bold' }}>Settled Group</span>
                            </div>
                            <p>
                                Are you sure you want to archive this group?
                                Archived groups will still be accessible from the "Archived" filter.
                            </p>
                        </div>
                    ) : (
                        <div className={styles.warningMessage}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                            <div>
                                <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                                    This group has an unsettled balance
                                </p>
                                <p>
                                    Archiving will preserve all transactions, but the group will
                                    be moved to your archived list. You will still be able to
                                    view the group's history.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.cancelButton} onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className={`${styles.confirmButton} ${!isSettled ? styles.warningButton : ''}`}
                        onClick={() => onConfirm(group.id)}
                    >
                        {isSettled ? 'Archive Group' : 'Archive Anyway'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArchiveConfirmModal;