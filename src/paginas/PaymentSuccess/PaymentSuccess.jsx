import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import styles from './PaymentSuccess.module.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('Processing your subscription...');
  const planName = searchParams.get('plan');

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 15; // Aumentado para 30 segundos

    const checkSubscriptionStatus = async () => {
      try {
        console.log('🔍 Checking subscription status... Attempt:', attempts + 1);
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('❌ User error:', userError);
          setStatus('error');
          setMessage('User not found. Please login again.');
          return;
        }

        console.log('✅ User found:', user.id);

        // Verificar o status da assinatura
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_subscribed, paypal_subscription_id')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('❌ Error fetching profile:', error);
          setStatus('error');
          setMessage('Error verifying subscription status.');
          return;
        }

        console.log('📋 Profile data:', profile);

        if (profile?.is_subscribed) {
          console.log('✅ Subscription is active!');
          setStatus('success');
          setMessage(`Your ${planName || ''} subscription is now active!`);
          
          // Redirecionar para o dashboard após 3 segundos
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          // Ainda não ativado, tentar novamente
          attempts++;
          
          if (attempts < maxAttempts) {
            setStatus('processing');
            setMessage(`Verifying your payment... (${attempts}/${maxAttempts})`);
            console.log(`⏳ Not active yet. Retrying in 2 seconds...`);
            
            // Tentar novamente em 2 segundos
            setTimeout(checkSubscriptionStatus, 2000);
          } else {
            // Excedeu o número de tentativas
            console.warn('⚠️ Max attempts reached');
            setStatus('error');
            setMessage('Payment verification is taking longer than expected. Your subscription may still be processing. Please check your email or contact support if you were charged.');
          }
        }
      } catch (error) {
        console.error('❌ Unexpected error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please contact support if you were charged.');
      }
    };

    // Aguardar 3 segundos antes de começar a verificar (dar tempo pro webhook)
    console.log('⏰ Starting verification in 3 seconds...');
    setTimeout(checkSubscriptionStatus, 3000);
  }, [planName, navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === 'checking' && (
          <>
            <div className={styles.spinner}></div>
            <h2>Processing Payment</h2>
            <p>{message}</p>
            <p className={styles.helpText}>Please wait while we confirm your payment with PayPal...</p>
          </>
        )}

        {status === 'processing' && (
          <>
            <div className={styles.spinner}></div>
            <h2>Almost There!</h2>
            <p>{message}</p>
            <p className={styles.helpText}>This usually takes just a few seconds.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className={styles.successIcon}>✓</div>
            <h2>Payment Successful!</h2>
            <p>{message}</p>
            <p className={styles.redirectText}>Redirecting to dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className={styles.errorIcon}>✕</div>
            <h2>Verification Issue</h2>
            <p>{message}</p>
            <div className={styles.buttonGroup}>
              <button 
                className={styles.button}
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </button>
              <button 
                className={styles.secondaryButton}
                onClick={() => navigate('/pricing')}
              >
                Back to Pricing
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;