import useSWR from 'swr';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setToken, setUserName } from '../redux/slices/AuthSlice';

// Hook personalizzato per il login
const useLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    let token = useSelector(state => state.rootReducer.auth.token);
    let baseUrl = useSelector(state => state.rootReducer.auth.baseUrl);

    const dispatch = useDispatch();

    console.log('useLogin token', token);
    console.log('useLogin error', error);
    console.log('useLogin isLoading', isLoading);

    const login = (username, password) => {
        setIsLoading(true);
        console.log('login', username, password);
        if(username && password && !token) { //TODO validate username and password
            //validate username and password
            fetch(`${baseUrl}/?rest_route=/simple-jwt-login/v1/auth&username=${username}&password=${password}`, {
                method: 'POST'
            })
            .then(res => { 
                setIsLoading(false);
                if(!res.ok) {
                    res.json().then(err => {
                        setError(err);
                    });
                } else {
                    res.json().then(data => {
                        console.log('data', data);
                        if (data && data.data && data.data.jwt) {
                            window.webViewManager.handleAuthToken(data.data.jwt);
                            console.log('username', username);
                            window.webViewManager.handleUserName(username);
                            dispatch(setToken(data.data.jwt));
                            dispatch(setUserName(username));
                        }
                    });
                }
            })
        }
    };
    
    const logout = () => {
        dispatch(setToken(null));
    };

    return {
        login,
        logout,
         token,
         isLoading,
         error,
    };
  };
  
  export default useLogin;