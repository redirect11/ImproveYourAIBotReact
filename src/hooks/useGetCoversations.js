import useFetchData from '../hooks/useFetchData';
import _ from 'lodash';


const useGetConversations = (refresh) => {
    
    const { 
        data, 
        error, 
        isLoading,
        isValidating,
        mutate,
        needsLogin 
    } = useFetchData('/wp-json/video-ai-chatbot/v1/get-all-thread-messages', refresh ? 5000 : 0);	

    return {
        isLoading,
        isValidating,
        error,
        data,
        needsLogin,
        mutate,
        needsOpenAiToken: !data?.success && data?.message === 'OpenAI client not initialized'
    }
    
};

export default useGetConversations;