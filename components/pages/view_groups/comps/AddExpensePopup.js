/**
 * AddExpensePopup.js
 * Component for adding a new group expense with percentage splits
 * 
 * Created by: Ilias Kladakis
 * Date: May 2025
 */

import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import './AddExpensePopup.css';

const AddExpensePopup = ({ onClose, onConfirm, members }) => {
    const today = new Date().toISOString().split('T')[0];

    // State for expense details
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(today);
    const [splits, setSplits] = useState([]);
    const [validationError, setValidationError] = useState('');

    // Initialize splits with equal percentage when members change
    useEffect(() => {
        if (members.length > 0) {
            const equalPercentage = (100 / members.length).toFixed(2);
            const initialSplits = members.map(member => ({
                userId: member.userId,
                name: member.name,
                avatar: member.avatar,
                percentage: parseFloat(equalPercentage),
                amount: 0,
                isAdjusted: false
            }));
            setSplits(initialSplits);
        }
    }, [members]);

    // Update split amounts when total amount changes
    useEffect(() => {
        if (amount && splits.length > 0) {
            const newSplits = splits.map(split => ({
                ...split,
                amount: parseFloat(((parseFloat(amount) * split.percentage) / 100).toFixed(2))
            }));
            setSplits(newSplits);
        }
    }, [amount, splits.length]);

    // Handle percentage change for a member
    const handlePercentageChange = (userId, newPercentage) => {
        // Get the member being changed
        const memberIndex = splits.findIndex(split => split.userId === userId);
        if (memberIndex === -1) return;

        const parsedPercentage = parseFloat(parseFloat(newPercentage).toFixed(2));
        if (isNaN(parsedPercentage)) return;

        // Create a copy of the splits array
        const updatedSplits = [...splits];

        // Update the percentage for the selected member
        updatedSplits[memberIndex] = {
            ...updatedSplits[memberIndex],
            percentage: parsedPercentage,
            isAdjusted: true
        };

        // Calculate the sum of all adjusted percentages
        const adjustedMembers = updatedSplits.filter(split => split.isAdjusted);
        const adjustedPercentageSum = adjustedMembers.reduce((sum, split) => sum + split.percentage, 0);

        // If adjusted percentages exceed 100%, show error and reset values
        if (adjustedPercentageSum > 100) {
            setValidationError('Total percentage cannot exceed 100%');

            // Reset all splits to equal percentages
            const equalPercentage = (100 / members.length).toFixed(2);
            const resetSplits = members.map(member => ({
                userId: member.userId,
                name: member.name,
                avatar: member.avatar,
                percentage: parseFloat(equalPercentage),
                amount: parseFloat(((parseFloat(amount || 0) * parseFloat(equalPercentage)) / 100).toFixed(2)),
                isAdjusted: false
            }));

            setSplits(resetSplits);
            return;
        }

        // Clear any previous error
        setValidationError('');

        // Calculate how much percentage is left to distribute
        const remainingPercentage = 100 - adjustedPercentageSum;

        // Get non-adjusted members
        const nonAdjustedMembers = updatedSplits.filter(split => !split.isAdjusted);

        // If there are non-adjusted members, distribute the remaining percentage equally
        if (nonAdjustedMembers.length > 0) {
            const equalRemainingPercentage = remainingPercentage / nonAdjustedMembers.length;

            // Update percentages for non-adjusted members
            updatedSplits.forEach(split => {
                if (!split.isAdjusted) {
                    split.percentage = parseFloat(equalRemainingPercentage.toFixed(2));
                }

                // Update amount based on new percentage
                if (amount) {
                    split.amount = parseFloat(((parseFloat(amount) * split.percentage) / 100).toFixed(2));
                }
            });
        }

        // Update state with the new splits
        setSplits(updatedSplits);
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate form
        if (!name.trim()) {
            setValidationError('Please enter an expense name');
            return;
        }

        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            setValidationError('Please enter a valid amount');
            return;
        }

        // Calculate total percentage to make sure it sums to 100%
        const totalPercentage = splits.reduce((sum, split) => sum + split.percentage, 0);
        if (Math.abs(totalPercentage - 100) > 0.1) { // Allow small floating-point errors
            setValidationError('Total percentage must equal 100%');
            return;
        }

        // Create expense data object
        const expenseData = {
            name: name.trim(),
            amount: parseFloat(amount),
            date,
            splits: splits.map(split => ({
                userId: split.userId,
                percentage: split.percentage,
                amount: split.amount
            }))
        };

        // Call the onConfirm callback with the expense data
        onConfirm(expenseData);
    };

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content add-expense-popup">
                <div className="popup-header">
                    <h2>Add Group Expense</h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="expenseName">Expense Name</label>
                        <input
                            type="text"
                            id="expenseName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter expense name"
                            maxLength={100}
                            required
                        />
                        <div className="char-counter">
                            {name.length}/100 characters
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="expenseAmount">Amount</label>
                        <div className="amount-input">
                            <span className="currency-symbol">$</span>
                            <input
                                type="number"
                                id="expenseAmount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                                min="0.01"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="expenseDate">Date</label>
                        <div className="date-input">
                            <input
                                type="date"
                                id="expenseDate"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                            <Calendar size={18} className="date-icon" />
                        </div>
                    </div>

                    <div className="splits-section">
                        <h3>Split Payment</h3>

                        {splits.map((split) => (
                            <div className="split-item" key={split.userId}>
                                <div className="member-info">
                                    {split.avatar ? (
                                        <img src={split.avatar} alt={split.name} className="member-avatar" />
                                    ) : (
                                        <div className="member-avatar-placeholder">
                                            {split.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="member-name">{split.name}</span>
                                </div>

                                <div className="split-input-group">
                                    <input
                                        type="number"
                                        value={split.percentage}
                                        onChange={(e) => handlePercentageChange(split.userId, e.target.value)}
                                        className="percentage-input"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                    />
                                    <span className="percentage-symbol">%</span>
                                    <span className="split-amount">
                                        {amount ? formatCurrency(split.amount) : '$0.00'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {validationError && (
                        <div className="error-message">{validationError}</div>
                    )}

                    <div className="popup-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="confirm-button">
                            Confirm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddExpensePopup;