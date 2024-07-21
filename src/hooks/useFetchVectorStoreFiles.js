import useSWR from 'swr'
import { authFetcher } from './fetcher';
import  useAuth from './useAuth';
import { config } from '../Constants';

const useFetchVectorStoreFiles = (vectorStoreIds) => {

  const { token, baseUrl } = useAuth();

  const shoudlUpload = vectorStoreIds && vectorStoreIds.length > 0;

  const { data, error, isLoading } = useSWR(shoudlUpload && token && baseUrl ? [
                                              `${baseUrl}/wp-json/video-ai-chatbot/v1/vector-store-files?vector_store_id=${vectorStoreIds[0]}` , 
                                              token
                                            ] : null , 
                                            ([url, token]) => authFetcher(url, token),
                                            { revalidateOnFocus: false, revalidateOnReconnect: false });

  const arrayData = data?.data;

  console.log('arrayData', arrayData);
  
  return { 
           file_name: arrayData && arrayData.length > 0 ? arrayData[0].file_name : null, 
           file_content: arrayData && arrayData.length > 0 ? arrayData[0].file_content: null, 
           file_id: arrayData && arrayData.length > 0 ? arrayData[0].id : null,
           error: data && data.error ? arrayData : error, 
           isLoading 
         };
}


export default useFetchVectorStoreFiles;