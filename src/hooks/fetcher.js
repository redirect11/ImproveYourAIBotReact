export const fetcher = (url, token) => fetch(url, { 
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': token
    }
  }).then(res => res.json());

export const uploadFile = (url, token, formData) => fetch(url, {
    method: 'POST',
    body: formData,
    headers: {
      'X-WP-Nonce': token
    }
  }).then(res => res.json());

  export const deleteFetcher = (url, token) => fetch(url, { 
    method: 'DELETE',
    headers: {
      'X-WP-Nonce': token
    }
  }).then(res => res.json());

  export const getFetcher = (url, token) => fetch(url, { 
    method: 'GET',
    headers: {
      'X-WP-Nonce': token
    }
  }).then(res => res.json());
