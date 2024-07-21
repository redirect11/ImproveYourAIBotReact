

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useSWR from 'swr';
import { setToken, setUserName, setBaseUrl } from '../redux/slices/AuthSlice'; // Assicurati di sostituire con il percorso corretto
import { getAuthDataFromQt } from '../hooks/fetcher'; // Assicurati di sostituire con il percorso corretto
import useBaseUrl from './useBaseUrl';

const qtAuth = () => getAuthDataFromQt();

const useAuth = () => {
    const token = useSelector(state => state.rootReducer.auth.token);	// Ottieni il token di autenticazione dallo store Redux

    const dispatch = useDispatch();

    const { baseUrl, isError: localBaseUrlError} = useBaseUrl();

    const { data: localAuthData, 
            error: localAuthError } = useSWR( !token || !baseUrl ? 'authToken' : null, qtAuth);


    useEffect(() => {
      if ((!token || !baseUrl) && localAuthData && localAuthData.token) {
        dispatch(setToken(localAuthData.token));
      }
    }, [localAuthData, dispatch]);

    useEffect(() => {
      if (baseUrl) {
        dispatch(setBaseUrl(baseUrl));
      }
    }, [baseUrl, localBaseUrlError]);


    let waitingWebChanel = (!localAuthData && localAuthError && !localAuthError?.message) 
                           || (!baseUrl && localBaseUrlError && !localBaseUrlError?.message);

    let hasError = (localAuthError?.message !== 'Error: No token found' && localBaseUrlError?.message !== 'Error: No baseUrl found') ? true : false;
    let needsLogin = (localAuthError?.message === 'Error: No token found') ? true : false;
    let hasNoBaseUrl = (localBaseUrlError?.message === 'Error: No baseUrl found') ? true : false;

    let error = hasNoBaseUrl ? localBaseUrlError : (hasError ? localAuthError : null);

    return {
      token: localAuthData?.token || token,
      loading: !needsLogin && ((!token || !baseUrl) && !localAuthData && !localAuthError?.message) || waitingWebChanel,
      error: error,
      needsLogin: needsLogin,
      baseUrl: baseUrl
    };
}; 

export default useAuth;