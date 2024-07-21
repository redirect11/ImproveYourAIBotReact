import useSWR from 'swr';
import { getAuthFetcher } from './fetcher';
import { config } from "../Constants";
import useAuth from './useAuth';

const useFetchData = (url) => {
    console.log('useFetchData', url);
    const { token, needsLogin, isLoading, baseUrl } = useAuth();
    const { data, error, mutate } = useSWR(token && baseUrl && url ? [`${baseUrl}${url}`,
                                            token,] : null, 
                                            ([url, token]) => getAuthFetcher(url, token),
                                            { revalidateOnFocus: false, revalidateOnReconnect: false });
                                            
    
    return {
        data,
        isLoading: !needsLogin && (isLoading || ((error === undefined || error === null) && (data === undefined || data === null))),
        error: error,
        needsLogin,
        mutate
    };
};

export default useFetchData;