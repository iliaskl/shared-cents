/**
 * GroupMenu.js
 * Component for the group settings dropdown menu
 * 
 * Created by: Ilias Kladakis
 * Date: May 2025
 */

import React, { useRef, useEffect } from 'react';
import { Users, UserPlus, UserMinus, Calendar, DollarSign } from 'lucide-react';
import './GroupMenu.css';

const GroupMenu = ({
    onViewMembers,
    onInviteMembers,
    onRemoveMembers,
    onSettleGroup,
    creationDate
}) => {
    const menuRef = useRef(null);

    // Handle clicks outside the menu to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                document.dispatchEvent(new CustomEvent('closeGroupMenu'));
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="group-menu" ref={menuRef}>
            <div className="menu-item" onClick={onViewMembers}>
                <Users size={18} />
                <span>View Members</span>
            </div>

            <div className="menu-item" onClick={onInviteMembers}>
                <UserPlus size={18} />
                <span>Invite Members</span>
            </div>

            {onRemoveMembers && (
                <div className="menu-item" onClick={onRemoveMembers}>
                    <UserMinus size={18} />
                    <span>Remove Members</span>
                </div>
            )}

            <div className="menu-divider"></div>

            <div className="menu-item creation-date">
                <Calendar size={18} />
                <div>
                    <span className="item-label">Created on</span>
                    <span className="creation-date-value">{formatDate(creationDate)}</span>
                </div>
            </div>

            <div className="menu-divider"></div>

            <div className="menu-item settle-group" onClick={onSettleGroup}>
                <DollarSign size={18} />
                <span>Settle Group</span>
            </div>
        </div>
    );
};

export default GroupMenu;