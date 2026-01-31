import React from 'react';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      color: 'white',
      padding: '40px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <header style={{
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '24px',
          borderRadius: '16px',
          marginBottom: '32px',
          border: '1px solid rgba(71, 85, 105, 0.5)'
        }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            🎵 MUSE
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Multi-sensory Emotional Regulation System
          </p>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid rgba(71, 85, 105, 0.5)'
          }}>
            <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>
              Heart Rate (HR)
            </div>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#ef4444' }}>
              75
            </div>
            <div style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
              bpm - Normal Range
            </div>
          </div>

          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid rgba(71, 85, 105, 0.5)'
          }}>
            <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>
              Mental Workload (MWL)
            </div>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#8b5cf6' }}>
              50
            </div>
            <div style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
              % - Moderate Level
            </div>
          </div>

          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid rgba(71, 85, 105, 0.5)',
            borderLeft: '4px solid #4CAF50'
          }}>
            <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>
              Current State
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50' }}>
              😌 Calm
            </div>
            <div style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
              Confidence: 85%
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid rgba(71, 85, 105, 0.5)',
          marginTop: '32px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
            🎵 Now Playing
          </h2>
          <div style={{ color: '#94a3b8' }}>
            System ready. Please upload music files to get started.
          </div>
        </div>

        <div style={{
          marginTop: '32px',
          padding: '16px',
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#60a5fa'
        }}>
          <p style={{ fontSize: '14px' }}>
            ✅ System running normally | React + TypeScript + Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
