import useFetchData from '../hooks/useFetchData';
import _ from 'lodash';


const useGetCurrentUserThread = () => {
    
    const { 
        data, 
        error, 
        isLoading,
        isValidating,
        mutate,
        needsLogin 
    } = useFetchData('/wp-json/video-ai-chatbot/v1/get-current-user-thread-messages');	

    return {
        isLoading,
        isValidating,
        error,
        data: data ? data : [],
        needsLogin,
        mutate,
        needsOpenAiToken: !data?.success && data?.message === 'OpenAI client not initialized'
    }
    
};

export default useGetCurrentUserThread;