import useSWR from 'swr'
import { authFetcher } from './fetcher';
import  useAuth from './useAuth';
import { config } from '../Constants';

const useFetchAllVectorStoreFiles = (vectorStoreIds) => {

  const { token, baseUrl } = useAuth();

  const shoudlUpload = vectorStoreIds && vectorStoreIds.length > 0;

  const { data, error, isLoading, mutate } = useSWR(shoudlUpload && token && baseUrl ? [
                                              `${baseUrl}/wp-json/video-ai-chatbot/v1/vector-store-files?vector_store_id=${vectorStoreIds[0]}` , 
                                              token
                                            ] : null , 
                                            ([url, token]) => authFetcher(url, token),
                                            { revalidateOnFocus: false, revalidateOnReconnect: false });

  console.log('useFetchAllVectorStoreFiles data', data);
  return { 
           data: data?.data, 
           error: data && data.error ? data?.data : error, 
           isLoading,
           mutate
         };
}


export default useFetchAllVectorStoreFiles;