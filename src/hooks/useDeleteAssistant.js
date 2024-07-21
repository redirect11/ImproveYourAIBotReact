import useSWR from 'swr'
import { deleteAuthFetcher } from './fetcher';
import { useState } from 'react';
import useAuth from './useAuth';
import { config } from '../Constants';

const useDeleteAssistant = () => {

    const {token, baseUrl} = useAuth();

    const [assistantId, setAssistantId] = useState(null);

    const startDelete = (assistantId) => {
        setAssistantId(assistantId);
    }
    

    const { data, error, isLoading } = useSWR( assistantId && baseUrl && token ? [
                                                `${baseUrl}/wp-json/video-ai-chatbot/v1/delete-assistant/${assistantId}` , 
                                                token
                                                ] : null , 
                                                ([url, token]) => deleteAuthFetcher(url, token), 
                                                { onError: () => setAssistantId(null), onSuccess: () => setAssistantId(null),
                                                  revalidateOnFocus: false, revalidateOnReconnect: false, shouldRetryOnError: false
                                                 });
    
    return { 
            deleteAssistant: startDelete,
            data: data,
            error: data && data.error ? data : error, 
            isLoading 
            };
}


export default useDeleteAssistant;