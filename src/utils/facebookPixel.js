// src/utils/facebookPixel.js

/**
 * Inicializa o Facebook Pixel
 * Deve ser chamado uma vez quando o app carrega
 */
export const initFacebookPixel = () => {
  const pixelId = import.meta.env.VITE_FACEBOOK_PIXEL_ID;
  
  if (!pixelId) {
    console.warn('Facebook Pixel ID não configurado');
    return;
  }

  // Verifica se o pixel já foi inicializado
  if (window.fbq) {
    console.log('Facebook Pixel já inicializado');
    return;
  }

  // Código oficial do Facebook Pixel
  /* eslint-disable */
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  window.fbq('init', pixelId);
  console.log('✅ Facebook Pixel inicializado:', pixelId);
};

/**
 * Dispara evento de PageView
 * Usar quando o usuário visualiza uma página
 */
export const trackPageView = () => {
  if (!window.fbq) {
    console.warn('Facebook Pixel não inicializado');
    return;
  }
  
  window.fbq('track', 'PageView');
  console.log('📊 Facebook Pixel: PageView');
};

/**
 * Dispara evento de InitiateCheckout
 * Usar quando o usuário inicia o processo de pagamento
 * 
 * @param {Object} params - Parâmetros do evento
 * @param {string} params.planName - Nome do plano (Weekly, Monthly, Quarterly)
 * @param {number} params.value - Valor em USD
 * @param {string} params.currency - Moeda (padrão: USD)
 */
export const trackInitiateCheckout = ({ planName, value, currency = 'USD' }) => {
  if (!window.fbq) {
    console.warn('Facebook Pixel não inicializado');
    return;
  }
  
  window.fbq('track', 'InitiateCheckout', {
    content_name: planName,
    content_category: 'subscription',
    value: value,
    currency: currency
  });
  
  console.log('📊 Facebook Pixel: InitiateCheckout', { planName, value, currency });
};

/**
 * Dispara evento de Purchase
 * Usar quando o pagamento é concluído com sucesso
 * 
 * @param {Object} params - Parâmetros do evento
 * @param {string} params.planName - Nome do plano
 * @param {number} params.value - Valor pago em USD
 * @param {string} params.currency - Moeda (padrão: USD)
 * @param {string} params.transactionId - ID da transação (subscription ID do PayPal)
 */
export const trackPurchase = ({ planName, value, currency = 'USD', transactionId }) => {
  if (!window.fbq) {
    console.warn('Facebook Pixel não inicializado');
    return;
  }
  
  window.fbq('track', 'Purchase', {
    content_name: planName,
    content_type: 'product',
    value: value,
    currency: currency,
    transaction_id: transactionId
  });
  
  console.log('📊 Facebook Pixel: Purchase', { planName, value, currency, transactionId });
};