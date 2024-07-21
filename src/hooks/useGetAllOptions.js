import useSWR from 'swr';
import { getAuthFetcher } from './fetcher';
import { config } from "../Constants";
import useAuth from './useAuth';

const useGetAllOptions = () => {
    const { token, baseUrl } = useAuth();
    const { data, error } = useSWR(token && baseUrl ? [`${baseUrl}/wp-json/video-ai-chatbot/v1/get-all-options`,
                                            token,] : null, 
                                            ([url, token]) => getAuthFetcher(url, token),
                                            { revalidateOnFocus: false, revalidateOnReconnect: false });

    return {
        options: data,
        isLoading: !error && !data,
        isError: error
    };
};

export default useGetAllOptions;