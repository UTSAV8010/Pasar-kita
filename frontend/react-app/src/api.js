// Helper function to read a cookie by name
export function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Global fetch wrapper for API integration
export async function apiRequest(url, options = {}) {
  const defaults = {
    headers: {
      'Accept': 'application/json',
      'X-React-App': 'true',
    },
    credentials: 'include', // MUST be set to send Django session and CSRF cookies
  };

  // Merge headers
  const mergedHeaders = { ...defaults.headers, ...options.headers };
  
  // Set JSON content type if body is a plain object/array
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    defaults.body = JSON.stringify(options.body);
    mergedHeaders['Content-Type'] = 'application/json';
  }

  // Set CSRF token for mutating requests (POST, PUT, DELETE)
  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'DELETE'].includes(method)) {
    const csrftoken = getCookie('csrftoken');
    if (csrftoken) {
      mergedHeaders['X-CSRFToken'] = csrftoken;
    }
  }

  const finalOptions = {
    ...defaults,
    ...options,
    headers: mergedHeaders,
  };

  try {
    const response = await fetch(url, finalOptions);
    const data = await response.json();
    
    // Handle JSON redirect returned by JSONResponseMiddleware
    if (data && data.status === 'redirect' && data.redirect) {
      if (!options.skipRedirect) {
        window.location.href = data.redirect;
      }
      return data;
    }
    
    if (!response.ok) {
      throw new Error(data.message || `API error: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API Request Failed:', error);
    throw error;
  }
}
