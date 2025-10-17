import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ResetPasswordPage.module.css';
import backgroundImage from '@/assets/fundo.png';
import { supabase } from '../../supabaseClient';
import Toast from '../../componentes/Toast/Toast';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      setShowToast(true);
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showToast && (
        <Toast 
          message="Password updated successfully! You can now login."
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}

      <div className={styles.resetPage} style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className={styles.overlay}></div>
        <main className={styles.resetContainer}>
          <div className={styles.resetBox}>
            <h2>Reset Password</h2>
            <p className={styles.subtitle}>Enter your new password below</p>
            
            {error && <p style={{ color: '#ff6b6b', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
            
            <form className={styles.resetForm} onSubmit={handleResetPassword}>
              <input 
                type="password" 
                placeholder="New Password" 
                className={styles.inputField}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input 
                type="password" 
                placeholder="Confirm New Password" 
                className={styles.inputField}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button type="submit" className={styles.resetButton} disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </>
  );
};

export default ResetPasswordPage;