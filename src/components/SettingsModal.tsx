import React from 'react';
import { type SettingsModalProps, type TimerSettings } from '../types';
import { useSettingsForm } from '../hooks/useSettingsForm';

const SETTING_FIELDS: { name: keyof TimerSettings; label: string }[] = [
  { name: 'work', label: 'Work (minutes)' },
  { name: 'shortBreak', label: 'Short Break (minutes)' },
  { name: 'longBreak', label: 'Long Break (minutes)' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, settings }) => {
  const { values, handleChange, handleBlur, toSecondsSettings } = useSettingsForm(settings, isOpen);

  if (!isOpen) return null;

  return (
    <div className="feedback-modal">
      <div className="settings-content">
        <h3>Timer Settings</h3>

        {SETTING_FIELDS.map(({ name, label }) => (
          <div className="settings-group" key={name}>
            <label htmlFor={name}>{label}</label>
            <input
              id={name}
              type="number"
              name={name}
              value={values[name] === 0 ? '' : values[name]}
              onChange={(e) => handleChange(name, e.target.value)}
              onBlur={() => handleBlur(name)}
              min="1"
            />
          </div>
        ))}

        <div className="action-buttons" style={{ marginTop: '1.5rem', justifyContent: 'flex-end' }}>
          <button className="action-button reset-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="action-button start-button"
            onClick={() => onSave(toSecondsSettings())}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
