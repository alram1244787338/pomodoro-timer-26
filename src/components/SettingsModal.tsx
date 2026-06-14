import React, { useState, useEffect } from 'react';
import { type SettingsModalProps, type TimerSettings, type Mode } from '../types';
import { MODE_LABELS, SETTINGS_FIELD_LABELS, SETTINGS_CONSTRAINTS } from '../constants';

const { min: MIN, max: MAX } = SETTINGS_CONSTRAINTS;
const clamp = (v: number) => Math.min(MAX, Math.max(MIN, Math.round(v)));

const SettingsModal: React.FC<SettingsModalProps> = ({ show, onClose, onSave, currentSettings }) => {
  const [formData, setFormData] = useState({ work: 0, shortBreak: 0, longBreak: 0 });

  // Reset form to minutes when modal opens or settings change
  useEffect(() => {
    if (show) {
      setFormData({
        work: currentSettings.work / 60,
        shortBreak: currentSettings.shortBreak / 60,
        longBreak: currentSettings.longBreak / 60,
      });
    }
  }, [show, currentSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? 0 : Math.round(Number(value)),
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: clamp(Number(value)),
    }));
  };

  const handleSave = () => {
    const validated: TimerSettings = {
      work: clamp(formData.work) * 60,
      shortBreak: clamp(formData.shortBreak) * 60,
      longBreak: clamp(formData.longBreak) * 60,
    };
    onSave(validated);
  };

  if (!show) return null;

  return (
    <div className="feedback-modal">
      <div className="settings-content">
        <h3>Timer Settings</h3>

        {(Object.keys(MODE_LABELS) as Mode[]).map(key => (
          <div className="settings-group" key={key}>
            <label htmlFor={key}>{SETTINGS_FIELD_LABELS[key]}</label>
            <input
              id={key}
              type="number"
              name={key}
              value={formData[key] === 0 ? '' : formData[key]}
              onChange={handleChange}
              onBlur={handleBlur}
              min={MIN}
              max={MAX}
            />
          </div>
        ))}

        <div className="action-buttons" style={{ marginTop: '1.5rem', justifyContent: 'flex-end' }}>
          <button className="action-button reset-button" onClick={onClose}>
            Cancel
          </button>
          <button className="action-button start-button" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
