/**
 * Stripe client utilities
 * Shared across all Sailor Skills products
 */

let stripeInstance = null;
let elementsInstance = null;

/**
 * Initialize Stripe
 * @param {string} publishableKey - Stripe publishable key
 * @returns {object} Stripe instance
 */
export function initStripe(publishableKey) {
  if (!publishableKey) {
    console.error('Stripe publishable key is required');
    return null;
  }

  if (!stripeInstance) {
    if (typeof Stripe === 'undefined') {
      console.error('Stripe.js not loaded. Include <script src="https://js.stripe.com/v3/"></script>');
      return null;
    }
    stripeInstance = Stripe(publishableKey);
  }

  return stripeInstance;
}

/**
 * Get Stripe instance
 * @returns {object|null} Stripe instance or null if not initialized
 */
export function getStripe() {
  return stripeInstance;
}

/**
 * Create Stripe Elements instance
 * @param {object} options - Elements options
 * @returns {object} Elements instance
 */
export function createElements(options = {}) {
  if (!stripeInstance) {
    console.error('Stripe not initialized. Call initStripe() first.');
    return null;
  }

  elementsInstance = stripeInstance.elements(options);
  return elementsInstance;
}

/**
 * Create card element with default styling
 * @param {string} mountSelector - CSS selector for mount point
 * @param {object} customStyle - Custom style overrides
 * @returns {object} Card element
 */
export function createCardElement(mountSelector, customStyle = {}) {
  if (!elementsInstance) {
    elementsInstance = createElements();
  }

  const defaultStyle = {
    base: {
      fontSize: '16px',
      color: '#000',
      fontFamily: 'Arial, sans-serif',
      '::placeholder': {
        color: '#999'
      }
    },
    invalid: {
      color: '#d63031'
    }
  };

  const style = { ...defaultStyle, ...customStyle };
  const cardElement = elementsInstance.create('card', { style });

  if (mountSelector) {
    const mountPoint = document.querySelector(mountSelector);
    if (mountPoint) {
      cardElement.mount(mountSelector);
    } else {
      console.error(`Mount point ${mountSelector} not found`);
    }
  }

  return cardElement;
}

/**
 * Create payment intent
 * @param {string} endpointUrl - Payment intent endpoint URL
 * @param {object} data - Payment data
 * @returns {Promise<object>} Payment intent response
 */
export async function createPaymentIntent(endpointUrl, data) {
  try {
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

/**
 * Confirm card payment
 * @param {string} clientSecret - Payment intent client secret
 * @param {object} cardElement - Stripe card element
 * @param {object} billingDetails - Billing information
 * @returns {Promise<object>} Payment confirmation result
 */
export async function confirmCardPayment(clientSecret, cardElement, billingDetails = {}) {
  if (!stripeInstance) {
    throw new Error('Stripe not initialized');
  }

  const result = await stripeInstance.confirmCardPayment(clientSecret, {
    payment_method: {
      card: cardElement,
      billing_details: billingDetails,
    },
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result;
}

/**
 * Handle card element errors
 * @param {object} cardElement - Stripe card element
 * @param {HTMLElement} errorElement - Element to display errors
 * @returns {function} Event handler
 */
export function handleCardErrors(cardElement, errorElement) {
  return cardElement.on('change', (event) => {
    if (event.error) {
      errorElement.textContent = event.error.message;
    } else {
      errorElement.textContent = '';
    }
  });
}

/**
 * Format amount for Stripe (convert to cents)
 * @param {number} amount - Amount in dollars
 * @returns {number} Amount in cents
 */
export function formatAmountForStripe(amount) {
  return Math.round(amount * 100);
}

/**
 * Format amount from Stripe (convert to dollars)
 * @param {number} amount - Amount in cents
 * @returns {number} Amount in dollars
 */
export function formatAmountFromStripe(amount) {
  return amount / 100;
}
