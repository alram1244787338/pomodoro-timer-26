import React, { useState, useEffect } from 'react';
import { type TimerSettings } from '../types';

interface SettingsModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (settings: TimerSettings) => void;
  currentSettings: TimerSettings; // In minutes
}

const SettingsModal: React.FC<SettingsModalProps> = ({ show, onClose, onSave, currentSettings }) => {
  const [formData, setFormData] = useState<TimerSettings>(currentSettings);

  useEffect(() => {
    if (show) {
      setFormData(currentSettings);
    }
  }, [show, currentSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? 0 : Number(value)
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value} = e.target;
    const numValue = Number(value);

    if (numValue < 1){
      setFormData((prev) => ({
        ...prev,
        [name]: 1
      }));
    }
  }

  if (!show) return null;

  return (
    <div className="feedback-modal">
      <div className="settings-content">
        <h3>Timer Settings</h3>
        
        <div className="settings-group">
          <label htmlFor="work">Work (minutes)</label>
          <input 
            id="work"
            type="number" 
            name="work"
            value={formData.work === 0 ? '' : formData.work}
            onChange={handleChange}
            onBlur={handleBlur}
            min="1"
          />
        </div>

        <div className="settings-group">
          <label htmlFor="shortBreak">Short Break (minutes)</label>
          <input 
            id="shortBreak"
            type="number" 
            name="shortBreak"
            value={formData.shortBreak}
            onChange={handleChange}
            min="1"
          />
        </div>

        <div className="settings-group">
          <label htmlFor="longBreak">Long Break (minutes)</label>
          <input 
            id="longBreak"
            type="number" 
            name="longBreak"
            value={formData.longBreak}
            onChange={handleChange}
            min="1"
          />
        </div>

        <div className="action-buttons" style={{ marginTop: '1.5rem', justifyContent: 'flex-end' }}>
          <button className="action-button reset-button" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="action-button start-button" 
            onClick={() => onSave(formData)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;