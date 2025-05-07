/**
 * SettleGroupPopup.js
 * Component for settling group balances
 * 
 * Created by: Ilias Kladakis
 * Date: May 2025
 */

import React from 'react';
import { X, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import './SettleGroupPopup.css';

const SettleGroupPopup = ({ onClose, onConfirm, userBalance }) => {
  // Determine if user has a balance that needs to be settled
  const hasBalance = userBalance !== 0;
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };
  
  // Handle confirm button click
  const handleConfirm = () => {
    onConfirm(true);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content settle-group-popup">
        <div className="popup-header">
          <h2>Settle Group</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="settle-icon">
          {hasBalance ? (
            <AlertCircle size={48} className="alert-icon" />
          ) : (
            <CheckCircle size={48} className="check-icon" />
          )}
        </div>
        
        <div className="settle-message">
          {hasBalance ? (
            <>
              <h3>You have an unsettled balance</h3>
              <p>
                {userBalance > 0 
                  ? `You are owed ${formatCurrency(userBalance)}`
                  : `You owe ${formatCurrency(userBalance)}`}
              </p>
              <p className="settle-instruction">
                Before settling, please ensure all financial transactions have been completed outside the app.
              </p>
            </>
          ) : (
            <>
              <h3>Your balance is settled</h3>
              <p>You don't have any outstanding balances in this group.</p>
            </>
          )}
        </div>
        
        <div className="settlement-note">
          <DollarSign size={18} />
          <p>
            By confirming, you're marking your balance as settled. All members must confirm for the group to be completely settled.
          </p>
        </div>
        
        <div className="popup-actions">
          <button type="button" className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="confirm-button" onClick={handleConfirm}>
            Confirm Settlement
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettleGroupPopup;