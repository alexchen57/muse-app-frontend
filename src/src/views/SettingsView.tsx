import React from 'react';
import { Settings, User, Database, Info, Heart, Brain } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

export function SettingsView() {
  const {
    heartRateBaseline,
    mwlBaseline,
    setHeartRateBaseline,
    setMWLBaseline,
  } = useAppStore();

  const cardStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid var(--beige)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--beige-light)',
    border: '1px solid var(--beige)',
    borderRadius: '12px',
    color: 'var(--text-dark)',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.2s ease'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, var(--coral) 0%, var(--coral-light) 100%)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(224, 122, 95, 0.3)'
          }}>
            <Settings size={28} style={{ color: 'white' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-dark)' }}>
              Settings
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Configure system parameters and preferences
            </p>
          </div>
        </div>
      </div>

      {/* Baseline Settings */}
      <div style={cardStyle}>
        <h3 style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '18px', 
          fontWeight: '600', 
          color: 'var(--text-dark)', 
          marginBottom: '24px' 
        }}>
          <User size={20} style={{ color: 'var(--coral)' }} />
          Baseline Settings
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Heart Rate Baseline */}
          <div>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: 'var(--text-dark)', 
              marginBottom: '10px' 
            }}>
              <Heart size={16} style={{ color: 'var(--state-stressed)' }} />
              Heart Rate Baseline (bpm)
            </label>
            <input
              type="number"
              value={heartRateBaseline}
              onChange={(e) => setHeartRateBaseline(Number(e.target.value))}
              min="40"
              max="120"
              style={inputStyle}
            />
            <p style={{ 
              fontSize: '12px', 
              color: 'var(--text-muted)', 
              marginTop: '8px' 
            }}>
              Normal resting heart rate range: 60-80 bpm
            </p>
          </div>

          {/* MWL Baseline */}
          <div>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: 'var(--text-dark)', 
              marginBottom: '10px' 
            }}>
              <Brain size={16} style={{ color: 'var(--soft-blue-dark)' }} />
              MWL Baseline (0-1)
            </label>
            <input
              type="number"
              value={mwlBaseline}
              onChange={(e) => setMWLBaseline(Number(e.target.value))}
              min="0"
              max="1"
              step="0.1"
              style={inputStyle}
            />
            <p style={{ 
              fontSize: '12px', 
              color: 'var(--text-muted)', 
              marginTop: '8px' 
            }}>
              Recommended to set as your average daily work MWL level
            </p>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div style={cardStyle}>
        <h3 style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '18px', 
          fontWeight: '600', 
          color: 'var(--text-dark)', 
          marginBottom: '20px' 
        }}>
          <Database size={20} style={{ color: 'var(--coral)' }} />
          Data Management
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button style={{
            width: '100%',
            padding: '14px 20px',
            background: 'var(--beige-light)',
            border: '1px solid var(--beige)',
            borderRadius: '12px',
            color: 'var(--text-dark)',
            textAlign: 'left',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            Export History Data (JSON)
          </button>
          <button style={{
            width: '100%',
            padding: '14px 20px',
            background: 'var(--beige-light)',
            border: '1px solid var(--beige)',
            borderRadius: '12px',
            color: 'var(--state-stressed)',
            textAlign: 'left',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            Clear All Data
          </button>
        </div>
      </div>

      {/* About */}
      <div style={cardStyle}>
        <h3 style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '18px', 
          fontWeight: '600', 
          color: 'var(--text-dark)', 
          marginBottom: '20px' 
        }}>
          <Info size={20} style={{ color: 'var(--coral)' }} />
          About
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ 
              fontWeight: '500', 
              color: 'var(--text-dark)', 
              marginBottom: '6px' 
            }}>
              MUSE - Multi-sensory Emotional Regulation System
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Version: v1.0 (Prototype)
            </div>
          </div>
          
          <div>
            <div style={{ 
              fontWeight: '500', 
              color: 'var(--text-dark)', 
              marginBottom: '6px' 
            }}>
              Tech Stack
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              React 18 + TypeScript + Vite
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Zustand + IndexedDB + Tone.js
            </div>
          </div>
          
          <div>
            <div style={{ 
              fontWeight: '500', 
              color: 'var(--text-dark)', 
              marginBottom: '6px' 
            }}>
              Description
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: 'var(--text-muted)',
              lineHeight: '1.6'
            }}>
              This system provides personalized music intervention by real-time monitoring of heart rate and mental workload (MWL), helping users regulate work stress in a non-intrusive, low-disturbance manner.
            </div>
          </div>
          
          <div style={{ 
            paddingTop: '16px', 
            borderTop: '1px solid var(--beige)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              background: 'var(--coral-light)',
              borderRadius: '6px',
              fontSize: '12px'
            }}>⚠️</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Note: MWL data uses simulated data for proof of concept
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
