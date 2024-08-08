import useSWR from 'swr';
import { getAuthFetcher } from './fetcher';
import { config } from "../Constants";
import useAuth from './useAuth';

const useFetchData = (url, refreshInterval = 0) => {
    const { token, needsLogin, isLoading, baseUrl } = useAuth();
    const { data, error, mutate, isValidating, isLoading: dataLoading } = useSWR(token && baseUrl && url ? [`${baseUrl}${url}`,
                                            token,] : null, 
                                            ([url, token]) => getAuthFetcher(url, token),
                                            { revalidateOnFocus: false, revalidateOnReconnect: false, refreshInterval: refreshInterval });
                                            
    const loading = dataLoading || isLoading;
    const noError = error === undefined || error === null;
    const noData = data === undefined || data === null;
    const loadingData = loading || (noError && noData);
    const loadingDataWithUrl = loadingData && url !== null;

    return {
        data,
        isLoading: !needsLogin && loadingDataWithUrl,
        error: error,
        needsLogin,
        isValidating,
        mutate
    };
};

export default useFetchData;