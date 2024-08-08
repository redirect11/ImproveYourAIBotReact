import useFetchData from '../hooks/useFetchData';
import _ from 'lodash';


const useGetMessages = (thread_id) => {
    
    const { 
        data, 
        error, 
        isLoading,
        isValidating,
        mutate,
        needsLogin 
    } = useFetchData(thread_id ? `/wp-json/video-ai-chatbot/v1/get-thread-messages/${thread_id}` : null, 1000);	

    return {
        isLoading,
        isValidating,
        error,
        data: data ? data : null,
        needsLogin,
        mutate,
        needsOpenAiToken: !data?.success && data?.message === 'OpenAI client not initialized'
    }
    
};

export default useGetMessages;