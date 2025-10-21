import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../supabaseClient';
import styles from './Payment.module.css';
import payImage from '@/assets/pay.png';

const Payment = ({ plan }) => {
  const navigate = useNavigate();
  const paypalRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    const loadPayPalScript = () => {
      if (window.paypal) {
        console.log('✅ PayPal SDK já carregado');
        setSdkReady(true);
        return;
      }

      const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
      
      if (!clientId) {
        console.error('❌ VITE_PAYPAL_CLIENT_ID não encontrado no .env');
        setError('PayPal Client ID not configured');
        return;
      }

      const scriptUrl = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription&components=buttons&locale=en_US`;
      
      console.log('📦 Carregando PayPal SDK...');

      const script = document.createElement('script');
      script.src = scriptUrl;
      
      script.addEventListener('load', () => {
        console.log('✅ PayPal SDK carregado com sucesso!');
        setSdkReady(true);
      });
      
      script.addEventListener('error', (e) => {
        console.error('❌ Erro ao carregar PayPal SDK:', e);
        setError('Failed to load PayPal SDK');
      });
      
      document.body.appendChild(script);
    };

    loadPayPalScript();
  }, []);

  useEffect(() => {
    if (!sdkReady || !paypalRef.current) return;

    let planId;
    
    switch(plan.name) {
      case 'Weekly':
        planId = import.meta.env.VITE_PAYPAL_WEEKLY_PLAN_ID;
        break;
      case 'Monthly':
        planId = import.meta.env.VITE_PAYPAL_MONTHLY_PLAN_ID;
        break;
      case 'Quarterly':
        planId = import.meta.env.VITE_PAYPAL_QUARTERLY_PLAN_ID;
        break;
      default:
        planId = null;
    }

    console.log('📋 Plan:', plan.name);
    console.log('📋 Plan ID:', planId);

    if (!planId) {
      setError(`Plan ${plan.name} not configured in .env`);
      return;
    }

    paypalRef.current.innerHTML = '';

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'subscribe'
      },
      
      createSubscription: async (data, actions) => {
        setLoading(true);
        setError(null);

        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !session) {
            throw new Error('You must be logged in to subscribe');
          }

          console.log('🔄 Criando assinatura com Plan ID:', planId);

          return actions.subscription.create({
            'plan_id': planId,
            'custom_id': session.user.id,
            'subscriber': {
              'name': {
                'given_name': session.user.user_metadata?.full_name?.split(' ')[0] || 'Customer',
                'surname': session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 'User'
              },
              'email_address': session.user.email
            }
          });
        } catch (err) {
          console.error('❌ Erro criando assinatura:', err);
          setError(err.message);
          setLoading(false);
          throw err;
        }
      },
      
      onApprove: async (data) => {
        try {
          console.log('✅ Assinatura aprovada:', data.subscriptionID);

          const { data: { session } } = await supabase.auth.getSession();

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              paypal_subscription_id: data.subscriptionID,
            })
            .eq('id', session.user.id);

          if (updateError) throw updateError;

          navigate(`/payment-success?plan=${plan.name}`);
        } catch (err) {
          console.error('❌ Erro salvando assinatura:', err);
          setError('Subscription created but failed to save.');
          setLoading(false);
        }
      },
      
      onCancel: () => {
        console.log('⚠️ Pagamento cancelado');
        setLoading(false);
      },
      
      onError: (err) => {
        console.error('❌ Erro no botão PayPal:', err);
        setError('An error occurred with PayPal.');
        setLoading(false);
      }
    }).render(paypalRef.current);

  }, [sdkReady, plan.name, navigate]);

  return (
    <div className={styles.rightPanel} style={{ backgroundImage: `url(${payImage})` }}>
      <div className={styles.paymentForm}>
        <h1>Payment</h1>
        <p>Complete your subscription using PayPal or Credit/Debit Card.</p>
        
        <div className={styles.planInfo}>
          <h3>{plan.name} Plan</h3>
          <p className={styles.price}>US$ {plan.price.toFixed(2)}</p>
          <p className={styles.period}>per {plan.period}</p>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <div className={styles.paypalButtonContainer}>
          {!sdkReady ? (
            <div className={styles.loadingMessage}>
              <div className={styles.spinner}></div>
              <p>Loading payment options...</p>
            </div>
          ) : (
            <>
              <div ref={paypalRef} className={styles.paypalButtons}></div>
              
              <div className={styles.paymentInfo}>
                <div className={styles.infoItem}>
                  <span className={styles.bullet}></span>
                  <p>Pay with Credit/Debit Card</p>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.bullet}></span>
                  <p>Or use your PayPal account</p>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.bullet}></span>
                  <p>Secure payment by PayPal</p>
                </div>
              </div>
            </>
          )}
        </div>

        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
            <p>Processing...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;