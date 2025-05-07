/**
 * ViewGroup.js
 * Main component for the View Group page
 * 
 * Created by: Ilias Kladakis
 * Date: May 2025
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { MoreVertical, PlusCircle, Users, Calendar, DollarSign } from 'lucide-react';
import AddExpensePopup from './comps/AddExpensePopup';
import GroupHistory from './comps/GroupHistory';
import BalanceGraph from './comps/BalanceGraph';
import GroupMenu from './comps/GroupMenu';
import ViewMembersPopup from './comps/ViewMembersPopup';
import InviteMembersPopup from './comps/InviteMembersPopup';
import RemoveMembersPopup from './comps/RemoveMembersPopup';
import SettleGroupPopup from './comps/SettleGroupPopup';
import './ViewGroup.css';

const ViewGroup = () => {
    // Get groupId from URL parameters
    const router = useRouter();
    const searchParams = useSearchParams();
    const groupId = searchParams.get('id');

    // State variables
    const [group, setGroup] = useState(null);
    const [userBalance, setUserBalance] = useState(0);
    const [expenses, setExpenses] = useState([]);
    const [members, setMembers] = useState([]);
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [showGroupMenu, setShowGroupMenu] = useState(false);
    const [showViewMembers, setShowViewMembers] = useState(false);
    const [showInviteMembers, setShowInviteMembers] = useState(false);
    const [showRemoveMembers, setShowRemoveMembers] = useState(false);
    const [showSettleGroup, setShowSettleGroup] = useState(false);
    const [isCreator, setIsCreator] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch group data when component mounts or groupId changes
    useEffect(() => {
        const fetchGroupData = async () => {
            if (!groupId) {
                setError('No group ID provided');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                console.log('Fetching group with ID:', groupId);

                // Special case for "roommates" - try the roommates endpoint first
                if (groupId.toLowerCase() === 'roommates') {
                    console.log('Using roommates-specific endpoint');
                    const roommatesResponse = await fetch('http://localhost:5000/api/groups/roommates');

                    if (roommatesResponse.ok) {
                        console.log('Roommates endpoint successful, status:', roommatesResponse.status);
                        const groupData = await roommatesResponse.json();
                        console.log('Roommates data received:', groupData);

                        // Get current user ID - hardcoded to "John" for testing
                        // Change this to use your actual authentication method later
                        const userId = localStorage.getItem('userId') || "John";
                        console.log('Current user ID:', userId);
                        setCurrentUserId(userId);

                        // Set group info
                        setGroup({
                            id: groupData.id,
                            name: groupData.name,
                            createdAt: groupData.createdAt,
                            creatorId: groupData.creatorId || groupData.createdBy,
                            currency: groupData.currency || 'USD'
                        });

                        setIsCreator(groupData.createdBy === userId || groupData.creatorId === userId);
                        setMembers(groupData.members || []);
                        setExpenses(groupData.expenses || []);

                        // Find user's balance in members array
                        const userMember = (groupData.members || []).find(member => member.userId === userId);
                        if (userMember) {
                            console.log('Found user in members:', userMember);
                            setUserBalance(userMember.balance);
                        } else {
                            console.log('User not found in members array!');
                            setUserBalance(0);
                        }

                        setLoading(false);
                        return;
                    } else {
                        console.log('Roommates endpoint failed, falling back to standard endpoint');
                    }
                }

                // Try the direct API first
                let response = await fetch(`http://localhost:5000/api/groups/${groupId}`);
                console.log('Response status:', response.status);

                // If not found, try the roommates endpoint for backward compatibility
                if (!response.ok && groupId.toLowerCase() === 'roommates') {
                    console.log('Trying roommates-specific endpoint as fallback');
                    response = await fetch('http://localhost:5000/api/groups/roommates');
                    console.log('Roommates endpoint response status:', response.status);
                }

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Error response:', errorText);
                    throw new Error('Failed to fetch group data');
                }

                const groupData = await response.json();
                console.log('Group data received:', groupData);

                setGroup({
                    id: groupData.id,
                    name: groupData.name,
                    createdAt: groupData.createdAt,
                    creatorId: groupData.creatorId || groupData.createdBy,
                    currency: groupData.currency || 'USD'
                });

                // Get current user ID - hardcoded to "John" for testing
                // Change this to use your actual authentication method later
                const userId = localStorage.getItem('userId') || "John";
                console.log('Current user ID:', userId);
                setCurrentUserId(userId);
                setIsCreator(groupData.createdBy === userId || groupData.creatorId === userId);

                // Set members from the API response
                setMembers(groupData.members || []);

                // Set expenses from the API response
                setExpenses(groupData.expenses || []);

                // Get user balance from members
                const userMember = (groupData.members || []).find(member => member.userId === userId);
                if (userMember) {
                    console.log('Found user in members:', userMember);
                    setUserBalance(userMember.balance);
                } else {
                    console.log('User not found in members array!');
                    setUserBalance(0);
                }
            } catch (error) {
                console.error('Error fetching group data:', error);
                setError('Failed to load group data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchGroupData();
    }, [groupId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Get references to the menu button and menu
            const menuButton = document.querySelector('.menu-button');
            const menu = document.querySelector('.group-menu');

            // If the menu is open and the click is outside both the menu and the button
            if (
                showGroupMenu &&
                menu &&
                menuButton &&
                !menu.contains(event.target) &&
                !menuButton.contains(event.target)
            ) {
                setShowGroupMenu(false);
            }
        };

        // Add event listener
        document.addEventListener('mousedown', handleClickOutside);

        // Clean up
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showGroupMenu]);

    // Toggle popup visibility functions
    const toggleAddExpense = () => setShowAddExpense(!showAddExpense);
    const toggleGroupMenu = () => setShowGroupMenu(!showGroupMenu);
    const toggleViewMembers = () => setShowViewMembers(!showViewMembers);
    const toggleInviteMembers = () => setShowInviteMembers(!showInviteMembers);
    const toggleRemoveMembers = () => setShowRemoveMembers(!showRemoveMembers);
    const toggleSettleGroup = () => setShowSettleGroup(!showSettleGroup);

    // Function to refresh data after changes
    const refreshData = async () => {
        if (!groupId) return;

        try {
            const response = await fetch(`http://localhost:5000/api/groups/${groupId}`);

            if (!response.ok) {
                throw new Error('Failed to refresh data');
            }

            const groupData = await response.json();

            // Update members and balances
            setMembers(groupData.members || []);

            // Update user balance
            const userMember = (groupData.members || []).find(member => member.userId === currentUserId);
            if (userMember) {
                setUserBalance(userMember.balance);
            } else {
                setUserBalance(0);
            }

            // Update expenses
            setExpenses(groupData.expenses || []);
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    };

    // Handle adding a new expense
    const handleAddExpense = async (expenseData) => {
        try {
            // Prepare data for API
            const apiExpenseData = {
                name: expenseData.name,
                amount: expenseData.amount,
                date: expenseData.date,
                paidBy: currentUserId,
                splits: expenseData.splits
            };

            // API call to add expense
            const response = await fetch(`http://localhost:5000/api/groups/${groupId}/expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiExpenseData),
            });

            if (!response.ok) {
                throw new Error('Failed to add expense');
            }

            const newExpense = await response.json();

            // Update expenses list with the new expense
            setExpenses([newExpense, ...expenses]);

            // Refresh data to get updated balances
            await refreshData();

            // Close the popup
            toggleAddExpense();
        } catch (error) {
            console.error('Error adding expense:', error);
            setError('Failed to add expense. Please try again.');
        }
    };

    // Handle settling the group
    const handleSettleGroup = async (confirmation) => {
        if (confirmation) {
            try {
                // API call to settle group
                const response = await fetch(`http://localhost:5000/api/groups/${groupId}/settle`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: currentUserId }),
                });

                if (!response.ok) {
                    throw new Error('Failed to settle balance');
                }

                // Refresh data to get updated balances
                await refreshData();
            } catch (error) {
                console.error('Error settling group:', error);
                setError('Failed to settle group. Please try again.');
            }
        }

        toggleSettleGroup();
    };

    // Render loading state if group data is not yet loaded
    if (loading) {
        return <div className="loading">Loading group details...</div>;
    }

    // Render error state if there was an error
    if (error && !group) {
        return <div className="error">{error}</div>;
    }

    if (!group) {
        return <div className="error">Group not found</div>;
    }

    // Determine balance status class
    const getBalanceStatusClass = () => {
        if (userBalance === 0) return 'settled';
        return userBalance > 0 ? 'owed' : 'owing';
    };

    // Updated to use dynamic currency
    const formatCurrency = (amount) => {
        const currency = group?.currency || 'USD';

        // Map common currency codes to their locale
        const currencyMap = {
            'USD': 'en-US',
            'EUR': 'de-DE',
            'GBP': 'en-GB',
            'JPY': 'ja-JP',
            'CAD': 'en-CA',
            'AUD': 'en-AU',
            'CHF': 'de-CH',
            'CNY': 'zh-CN',
            'INR': 'en-IN',
            'MXN': 'es-MX',
            'BRL': 'pt-BR',
            'KRW': 'ko-KR',
        };

        const locale = currencyMap[currency] || 'en-US';

        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2,
            minimumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2,
        }).format(amount);
    };

    return (
        <div className="view-group-container">
            {/* Show error banner if there's an error but we still have data */}
            {error && (
                <div className="error-banner">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}>Dismiss</button>
                </div>
            )}

            <div className="group-header">
                <h1 className="group-name">{group.name}</h1>
                <button className="menu-button" onClick={toggleGroupMenu}>
                    <MoreVertical size={24} />
                </button>
                {showGroupMenu && (
                    <GroupMenu
                        onViewMembers={toggleViewMembers}
                        onInviteMembers={toggleInviteMembers}
                        onRemoveMembers={isCreator ? toggleRemoveMembers : null}
                        onSettleGroup={toggleSettleGroup}
                        creationDate={group.createdAt}
                    />
                )}
            </div>

            <div className="group-content">
                <div className="left-section">
                    <button className="add-expense-button" onClick={toggleAddExpense}>
                        <PlusCircle size={20} />
                        Add Group Expense
                    </button>

                    <div className="group-history-container">
                        <GroupHistory expenses={expenses} members={members} groupId={groupId} />
                    </div>
                </div>

                <div className="right-section">
                    <div className={`balance-info ${getBalanceStatusClass()}`}>
                        <h2>Your Balance</h2>
                        <div className="balance-amount">{formatCurrency(Math.abs(userBalance))}</div>
                        <div className="balance-status">
                            {userBalance === 0
                                ? 'Settled'
                                : userBalance > 0
                                    ? 'You are owed'
                                    : 'You owe'}
                        </div>
                    </div>

                    <div className="balance-graph-container">
                        <h2>Group Balances</h2>
                        <BalanceGraph
                            members={members}
                            currentUserId={currentUserId}
                            currency={group?.currency || 'USD'}
                        />
                    </div>
                </div>
            </div>

            {showAddExpense && (
                <AddExpensePopup
                    onClose={toggleAddExpense}
                    onConfirm={handleAddExpense}
                    members={members}
                />
            )}

            {showViewMembers && (
                <ViewMembersPopup
                    onClose={toggleViewMembers}
                    members={members}
                    currentUserId={currentUserId}
                    groupId={groupId}
                    onLeaveGroup={() => {
                        router.push('/groups');
                    }}
                />
            )}

            {showInviteMembers && (
                <InviteMembersPopup
                    onClose={toggleInviteMembers}
                    groupId={groupId}
                    currentMembers={members}
                />
            )}

            {showRemoveMembers && isCreator && (
                <RemoveMembersPopup
                    onClose={toggleRemoveMembers}
                    groupId={groupId}
                    members={members.filter(member => member.userId !== currentUserId)}
                    onMemberRemoved={(removedMemberId) => {
                        setMembers(members.filter(member => member.userId !== removedMemberId));
                    }}
                />
            )}

            {showSettleGroup && (
                <SettleGroupPopup
                    onClose={toggleSettleGroup}
                    onConfirm={handleSettleGroup}
                    userBalance={userBalance}
                />
            )}
        </div>
    );
};

export default ViewGroup;