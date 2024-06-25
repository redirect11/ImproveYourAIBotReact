import useSWR from 'swr'
import { deleteFetcher } from './fetcher';
import { useState } from 'react';

const useDeleteAssistant = () => {

    const [assistantId, setAssistantId] = useState(null);

    console.log('useDeleteAssistant');

    const startDelete = (assistantId) => {
        setAssistantId(assistantId);
    }
    
    if((data || error) && assistantId ) {
        console.log('data', data);
        console.log('error', error);
        console.log('isLoading', isLoading);
        console.log('reset assistantId');
        setAssistantId(null);
    }

    const { data, error, isLoading } = useSWR( assistantId ? [
                                                `/wp-json/video-ai-chatbot/v1/delete-assistant/${assistantId}` , 
                                                window.adminData.nonce
                                                ] : null , 
                                                ([url, token]) => deleteFetcher(url, token));
    
    return { 
            deleteAssistant: startDelete,
            data: data,
            error: data && data.error ? data : error, 
            isLoading 
            };
}


export default useDeleteAssistant;