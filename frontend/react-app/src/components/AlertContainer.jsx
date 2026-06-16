import React from 'react';
import { useApp } from '../AppContext';

export default function AlertContainer() {
  const { alerts } = useApp();

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '350px',
      width: '100%',
    }}>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="fade-in-up"
          style={{
            padding: '12px 20px',
            borderRadius: '12px',
            fontSize: '0.9rem',
            fontWeight: '600',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: alert.type === 'success' ? '#22c55e' : 
                        alert.type === 'warning' ? '#eab308' : 
                        alert.type === 'danger' ? '#ef4444' : '#3b82f6',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            transition: 'all 0.3s ease',
          }}
        >
          <span>{alert.message}</span>
        </div>
      ))}
    </div>
  );
}
