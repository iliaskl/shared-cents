/*
* index.js
* Main component for the Groups page
* Created by: Ilias Kladakis
* Date: April 2025
*
* This component manages the display of all user groups including:
* - Filter functionality for viewing different group categories
* - Group card display in a responsive grid layout
* - Modals for creating new groups and confirming group deletion
* - Archive/unarchive functionality
*/

"use client";

import { useState, useEffect } from 'react';
import GroupCard from './comps/groupCard';
import CreateGroupModal from './comps/createGroupModal';
import LeaveGroupModal from './comps/leaveGroupModal';
import styles from './group.module.css';

export default function GroupsPage() {
    const [groups, setGroups] = useState([]);
    const [filterOption, setFilterOption] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [groupToLeave, setGroupToLeave] = useState(null);

    // Load mock group data for demonstration
    useEffect(() => {
        const mockGroups = [
            {
                id: 1,
                name: 'Roommates',
                balance: -30.50,
                creationDate: '2025-01-15',
                lastActivity: '2025-04-18',
                archived: false,
            },
            {
                id: 2,
                name: 'Trip to Spain',
                balance: 45.75,
                creationDate: '2025-02-10',
                lastActivity: '2025-04-20',
                archived: false,
            },
            {
                id: 3,
                name: 'Dinner Club',
                balance: 0.00,
                creationDate: '2025-03-05',
                lastActivity: '2025-04-15',
                archived: false,
            },
            {
                id: 4,
                name: 'Movie Night',
                balance: -15.25,
                creationDate: '2025-03-20',
                lastActivity: '2025-04-10',
                archived: false,
            },
            {
                id: 5,
                name: 'Book Club',
                balance: 25.99,
                creationDate: '2025-04-01',
                lastActivity: '2025-04-05',
                archived: false,
            },
            {
                id: 6,
                name: 'Gym Buddies',
                balance: 0.00,
                creationDate: '2025-04-10',
                lastActivity: '2025-04-01',
                archived: false,
            },
            {
                id: 7,
                name: 'Office Lunch',
                balance: -10.42,
                creationDate: '2025-04-15',
                lastActivity: '2025-03-25',
                archived: false,
            },
            {
                id: 8,
                name: 'Home Repairs',
                balance: 60.85,
                creationDate: '2025-04-18',
                lastActivity: '2025-03-15',
                archived: false,
            },
            {
                id: 9,
                name: 'Old Project',
                balance: 0.00,
                creationDate: '2024-12-15',
                lastActivity: '2025-01-10',
                archived: true,
            },
        ];

        setGroups(mockGroups);
    }, []);

    // Determine color coding based on balance
    const getGroupColor = (balance) => {
        if (balance < 0) return 'red';
        if (balance > 0) return 'blue';
        return 'green';
    };

    // Filter and sort groups based on selected filter option
    const filterGroups = () => {
        let filteredGroups = [...groups];

        switch (filterOption) {
            case 'all':
                return filteredGroups
                    .filter(group => !group.archived)
                    .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
            case 'owing':
                return filteredGroups
                    .filter(group => group.balance < 0 && !group.archived)
                    .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
            case 'owed':
                return filteredGroups
                    .filter(group => group.balance > 0 && !group.archived)
                    .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
            case 'settled':
                return filteredGroups
                    .filter(group => group.balance === 0 && !group.archived)
                    .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
            case 'archived':
                return filteredGroups
                    .filter(group => group.archived)
                    .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
            default:
                return filteredGroups
                    .filter(group => !group.archived)
                    .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
        }
    };

    // Navigate to group detail page
    const handleViewGroup = (groupId) => {
        console.log(`Viewing group ${groupId}`);
    };

    // Open confirmation modal for leaving a group
    const handleOpenLeaveModal = (group) => {
        setGroupToLeave(group);
        setIsLeaveModalOpen(true);
    };

    // Remove group from user's list after confirmation
    const handleLeaveGroup = (groupId) => {
        setGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));
        setIsLeaveModalOpen(false);
        setGroupToLeave(null);
    };

    // Process new group creation
    const handleCreateGroup = (groupData) => {
        console.log('Creating new group with data:', groupData);
        setIsModalOpen(false);
    };

    // Toggle group archived status
    const handleToggleArchive = (groupId) => {
        setGroups(prevGroups => prevGroups.map(group =>
            group.id === groupId
                ? { ...group, archived: !group.archived }
                : group
        ));
    };

    return (
        <div className={styles.groupsContainer}>
            <div className={styles.header}>
                <div className={styles.sortingContainer}>
                    <label htmlFor="filterDropdown">Filter by: </label>
                    <select
                        id="filterDropdown"
                        value={filterOption}
                        onChange={(e) => setFilterOption(e.target.value)}
                        className={styles.sortDropdown}
                    >
                        <option value="all">All Groups</option>
                        <option value="owing">Owing</option>
                        <option value="owed">Owed</option>
                        <option value="settled">Settled</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
                <button
                    className={styles.createButton}
                    onClick={() => setIsModalOpen(true)}
                >
                    + Create New Group
                </button>
            </div>

            <div className={styles.groupsGrid}>
                {filterGroups().map(group => (
                    <GroupCard
                        key={group.id}
                        group={group}
                        color={getGroupColor(group.balance)}
                        onView={() => handleViewGroup(group.id)}
                        onLeave={() => handleOpenLeaveModal(group)}
                        onToggleArchive={() => handleToggleArchive(group.id)}
                    />
                ))}
            </div>

            {filterGroups().length === 0 && (
                <div className={styles.noGroups}>
                    No groups found for the selected filter.
                </div>
            )}

            {isModalOpen && (
                <CreateGroupModal
                    onClose={() => setIsModalOpen(false)}
                    onCreate={handleCreateGroup}
                />
            )}

            {isLeaveModalOpen && groupToLeave && (
                <LeaveGroupModal
                    group={groupToLeave}
                    onCancel={() => setIsLeaveModalOpen(false)}
                    onConfirm={() => handleLeaveGroup(groupToLeave.id)}
                />
            )}
        </div>
    );
}