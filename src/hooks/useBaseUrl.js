import { useSelector } from 'react-redux';
import useSWR from 'swr';

// Definizione del fetcher che interagisce con QWebChannel
const fetchBaseUrl = () => {
  return new Promise((resolve, reject) => {
	if (!window.webViewManager) {
        reject();
      }
      else {
        window.webViewManager.getBaseUrl(function (baseUrl) {
          if (!baseUrl) {
            reject(new Error('No baseUrl found'));
          } else {
            resolve(baseUrl);
          }
        });
      }
  });
};

// Hook per recuperare il baseUrl
const useBaseUrl = () => {
  const baseUrl = useSelector(state => state.rootReducer.auth.baseUrl);
  const { data, error } = useSWR(!baseUrl ? 'baseUrl' : null, fetchBaseUrl, { suspense: true });

  return {
    baseUrl: baseUrl ? baseUrl : data,
    isLoading: !error && !data && !baseUrl,
    isError: error
  };
};

export default useBaseUrl;