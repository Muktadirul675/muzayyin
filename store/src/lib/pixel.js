// src/utils/pixel.js
export function loadFacebookPixel(pixelId) {
  if (window.fbq) return; // Already loaded
  
  // Load Facebook Pixel script
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  
  // Initialize Pixel
  fbq('init', pixelId);
}

export function trackPageView(pageData = {}) {
  if (typeof fbq !== 'undefined') {
    fbq('track', 'PageView', pageData);
  }
}

export function trackViewContent(contentData) {
  if (typeof fbq !== 'undefined') {
    fbq('track', 'ViewContent', contentData);
  }
}

export function trackViewCategory(categoryData) {
  if (typeof fbq !== 'undefined') {
    fbq('track', 'ViewCategory', categoryData);
  }
}

export function trackAddToCart(productData) {
  if (typeof fbq !== 'undefined') {
    fbq('track', 'AddToCart', productData);
  }
}

export function trackPurchase(orderData) {
  if (typeof fbq !== 'undefined') {
    fbq('track', 'Purchase', orderData);
  }
}

export function trackInitiateCheckout(checkoutData) {
  if (typeof fbq !== 'undefined') {
    fbq('track', 'InitiateCheckout', checkoutData);
  }
}