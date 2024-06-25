import useSWR from 'swr'
import { fetcher } from './fetcher';

const useFetchVectorStoreFiles = (vectorStoreIds) => {

  const shoudlUpload = vectorStoreIds && vectorStoreIds.length > 0;

  console.log('useFetchVectorStoreFiles');


  const { data, error, isLoading } = useSWR(shoudlUpload ? [
                                              `/wp-json/video-ai-chatbot/v1/vector-store-files?vector_store_id=${vectorStoreIds[0]}` , 
                                              window.adminData.nonce
                                            ] : null , 
                                            ([url, token]) => fetcher(url, token),
                                            { revalidateOnFocus: false, revalidateOnReconnect: false });
  
  return { 
           file_name: data && data.length > 0 ? data[0].file_name : null, 
           file_content: data && data.length > 0 ? data[0].file_content: null, 
           file_id: data && data.length > 0 ? data[0].id : null,
           error: data && data.error ? data : error, 
           isLoading 
         };
}


export default useFetchVectorStoreFiles;