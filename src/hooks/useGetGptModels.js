import useSWR from 'swr';
import useAuth from './useAuth';

const fetcher = (url, token) => fetch(url, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
}).then(res => res.json());

const useGetGptModels = () => {
    const { token, baseUrl } = useAuth();
    const { data, error } = useSWR(token && baseUrl ? 
                                    [`${baseUrl}/wp-json/video-ai-chatbot/v1/get-gpt-models`, token] : null, 
                                    ([url, token]) => fetcher(url, token),);

    return {
        models: data?.data,
        isLoading: !error && !data,
        isError: error
    };
};

export default useGetGptModels;