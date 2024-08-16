import useSWR from 'swr';
import { getAuthFetcher } from './fetcher';
import useAuth from './useAuth';

const useGetThemeOption = () => {
    const { token, baseUrl } = useAuth();
    const { data, error } = useSWR(token && baseUrl ? [`${baseUrl}/wp-json/video-ai-chatbot/v1/get-options/video_ai_chatbot_theme`,
                                            token] : null, 
                                            ([url, token]) => getAuthFetcher(url, token),
                                            { revalidateOnFocus: false, revalidateOnReconnect: false });

    return {
        options: data,
        isLoading: !error && !data,
        isError: error
    };
};

export default useGetThemeOption;