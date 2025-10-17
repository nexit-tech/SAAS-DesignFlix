import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#141414',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{
        backgroundColor: '#1f1f1f',
        padding: '3rem',
        borderRadius: '12px',
        maxWidth: '500px'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>✓ Payment Successful!</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#b3b3b3' }}>
          Your subscription has been activated!
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{
            backgroundColor: '#e50914',
            color: 'white',
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '5px',
            fontSize: '1rem',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;