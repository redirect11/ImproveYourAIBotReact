import useSWR from 'swr'
import { authFetcher } from './fetcher';
import  useAuth from './useAuth';

const useGetfile = (vectorStoreId) => {
    console.log('useGetfile', vectorStoreId);

  const { token, baseUrl } = useAuth();

  const { data, error, isLoading, mutate } = useSWR(token && baseUrl && vectorStoreId? [
                                              `${baseUrl}/wp-json/video-ai-chatbot/v1/get-file/${vectorStoreId}` , 
                                              token
                                            ] : null , 
                                            ([url, token]) => authFetcher(url, token),
                                            { revalidateOnFocus: false, revalidateOnReconnect: false });

  console.log('useGetfile data', data);
  
  return { 
           file_name: data?.file_name,
           file_content: data?.file_content, 
           file_id: data?.id,
           error: data && data.error ? data : error, 
           isLoading,
            mutate
         };
}


export default useGetfile;