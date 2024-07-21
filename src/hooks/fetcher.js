
export const fetcher = (url, token) => fetch(url, { 
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': token
    }
  }).then(res => res.json());

export const authFetcher = (url, token) => fetch(url, { 
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
  }
}).then(res => res.json());

export const uploadFile = (url, token, formData) => fetch(url, {
    method: 'POST',
    body: formData,
    headers: {
      'X-WP-Nonce': token
    }
  }).then(res => res.json());

  export const uploadAuthFile = (url, token, formData) => fetch(url, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': 'Bearer ' + token,	
    }
  }).then(res => res.json());

  export const deleteFetcher = (url, token, bearerToken) => fetch(url, { 
    method: 'DELETE',
    headers: {
      'X-WP-Nonce': token,
    }
  }).then(res => res.json());

  export const deleteAuthFetcher = (url, token, bearerToken) => fetch(url, { 
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer ' + token,	
    }
  }).then(res => res.json());

  export const getFetcher = (url, token) => fetch(url, { 
    method: 'GET',
    headers: {
      'X-WP-Nonce': token,					
    }
  }).then(res => res.json());

  export const getAuthFetcher = (url, token) => fetch(url, { 
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token,					
    }
  }).then(res => res.json())
    .then(data => {
      console.log('data', data);
      if(data?.success === false && data?.message) {
        if(data.message === "OpenAI client not initialized") {
          return data;
        } else  {
          throw new Error(data.message);
        }
      }
      return data;
  });

  export const getAuthDataFromQt = async () => {
    console.log('getAuthDataFromQt');
    try {
      
      // const username_1 = await new Promise((resolve, reject) => {
      //   if (!window.webViewManager) {
      //     console.log('rejecting username_1');
      //     reject();
      //   }
      //   else {
      //     window.webViewManager.getUserName(function (username) {
      //       console.log('USERNAME', username);
      //       if (!username) {
      //         reject(new Error('No username found'));
      //       } else {
      //         resolve(username);
      //       }
      //     });
      //   }
      // });

      const token_1 = await new Promise((resolve, reject) => {
        if (!window.webViewManager) {
          console.log('rejecting token_1');
          reject();
        }
        else {
          window.webViewManager.getAuthToken(function (token) {
            console.log('TOKEEEEEN', token);
            if (!token) {
              reject(new Error('No token found'));
            } else {
              resolve(token);
            }
          });
        }
      });
      
      return { token: token_1 }; 
    } catch (e) {
      throw new Error(e);
    }
  };

  export const getAuthenticatedTranscriptionsFetcher = (url, token) => fetch(url, { 
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + token	          
          }
        }).then(res => res.json());

  export const getAuthenticatedAssistantsFetcher = (url, token) => fetch(url, { 
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token				
    }
  }).then(res => res.json());
      
