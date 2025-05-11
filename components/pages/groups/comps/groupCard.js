/*
* groupCard.js
* Card component for displaying group information
* Created by: Ilias Kladakis
* Date: April 2025
* Updated: May 2025 - Modified archive button to work with confirmation dialog
*
* This component renders an individual group card with:
* - Color-coded visual status (owing, owed, settled)
* - Balance information with proper currency formatting
* - Creation date display
* - Action buttons for viewing and archiving
*/

"use client";

import { useState, useEffect } from 'react';
import styles from './groupCard.module.css';
import { useRouter } from 'next/navigation';

const GroupCard = ({ group, color, onToggleArchive, onBalanceUpdate }) => {
    const { id, name, balance: initialBalance, creationDate, archived, currency = 'USD', currencyLocale = 'en-US', currencySymbol = '$' } = group;
    const router = useRouter();

    // State to store the up-to-date balance
    const [balance, setBalance] = useState(initialBalance);
    // Loading state
    const [loading, setLoading] = useState(false);

    // Fetch live balance data when the component mounts
    useEffect(() => {
        // Only fetch for the roommates group
        if (name.toLowerCase() === 'roommates') {
            fetchLiveBalance();
        }
    }, [id, name]);

    // Function to fetch the live balance
    const fetchLiveBalance = async () => {
        try {
            setLoading(true);

            // Get current user ID (same as in ViewGroup.js)
            const currentUserId = localStorage.getItem('userId') || "John";

            // Fetch the roommates group data
            const response = await fetch('http://localhost:5000/api/groups/roommates');

            if (response.ok) {
                const groupData = await response.json();

                // Find the user in the members array
                if (groupData.members && Array.isArray(groupData.members)) {
                    const userMember = groupData.members.find(member => member.userId === currentUserId);

                    if (userMember) {
                        const newBalance = userMember.balance;
                        console.log(`Updated balance for ${currentUserId} in ${name} group:`, newBalance);

                        // Set local state
                        setBalance(newBalance);

                        // Notify parent component about the balance update
                        if (onBalanceUpdate && newBalance !== initialBalance) {
                            onBalanceUpdate(id, newBalance);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching live balance:', error);
            // In case of error, fall back to the initial balance
        } finally {
            setLoading(false);
        }
    };

    // Currency configuration with locales
    const currencyConfig = {
        'USD': { locale: 'en-US', currency: 'USD' },
        'EUR': { locale: 'de-DE', currency: 'EUR' },
        'GBP': { locale: 'en-GB', currency: 'GBP' },
        'JPY': { locale: 'ja-JP', currency: 'JPY' },
        'CAD': { locale: 'en-CA', currency: 'CAD' },
        'AUD': { locale: 'en-AU', currency: 'AUD' },
        'CHF': { locale: 'de-CH', currency: 'CHF' },
        'CNY': { locale: 'zh-CN', currency: 'CNY' },
        'INR': { locale: 'en-IN', currency: 'INR' },
        'MXN': { locale: 'es-MX', currency: 'MXN' },
        'BRL': { locale: 'pt-BR', currency: 'BRL' },
        'KRW': { locale: 'ko-KR', currency: 'KRW' },
    };

    // Format date to be more readable
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Format currency amount with proper locale
    const formatCurrency = (amount, currencyCode, locale) => {
        const config = currencyConfig[currencyCode] || currencyConfig['USD'];

        return new Intl.NumberFormat(config.locale, {
            style: 'currency',
            currency: config.currency,
            minimumFractionDigits: currencyCode === 'JPY' || currencyCode === 'KRW' ? 0 : 2,
            maximumFractionDigits: currencyCode === 'JPY' || currencyCode === 'KRW' ? 0 : 2
        }).format(Math.abs(amount));
    };

    // Format balance with appropriate text
    const formatBalance = (balance) => {
        const formattedAmount = formatCurrency(balance, currency, currencyLocale);

        if (balance < 0) {
            return `You owe ${formattedAmount}`;
        } else if (balance > 0) {
            return `You are owed ${formattedAmount}`;
        } else {
            return 'Settled';
        }
    };

    // Get the correct color class based on the balance
    const getColorClass = () => {
        if (balance < 0) {
            return 'red'; // Owing (red)
        } else if (balance > 0) {
            return 'blue'; // Owed (blue)
        } else {
            return 'green'; // Settled (green)
        }
    };

    // Handle view group click - navigate to the group view page with correct ID
    const handleViewGroup = () => {
        console.log('Navigating to group with ID:', id);
        router.push(`/group_view?id=${id}`);
    };

    // Handle archive button click - now just calls the parent handler
    const handleArchiveClick = (e) => {
        e.stopPropagation(); // Prevent click from bubbling to card
        // Send current balance to parent component for confirmation logic
        onToggleArchive();
    };

    return (
        <div className={`${styles.card} ${styles[getColorClass()]} ${archived ? styles.archived : ''}`}>
            <div
                className={styles.archiveButton}
                onClick={handleArchiveClick}
                title={archived ? "Unarchive Group" : "Archive Group"}
            >
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
                {loading ? 'Loading...' : formatBalance(balance)}
            </div>

            <div className={styles.buttonsContainer}>
                <button
                    className={styles.viewButton}
                    onClick={handleViewGroup}
                >
                    View Group
                </button>
            </div>
        </div>
    );
};

export default GroupCard;