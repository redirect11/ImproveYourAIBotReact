import { uploadAuthFile, uploadFile } from './fetcher';
import useSWR from 'swr'
import useAuth from './useAuth';
import { config } from '../Constants';


const useUploadFile = ({ file, shouldUpload }) => {

  const { token, baseUrl } = useAuth();

  const handleUpload = async (url, token) => {
    const formData = new FormData();
      if(url && token){
        const updatedFile = new Blob([file.file_text], { type: "text/plain" });
        formData.append('file', new File([updatedFile], file.file_name));
        if(file.file_id){
          formData.append('file_id', file.file_id);
        }
      
      }
      return uploadAuthFile(url, token, formData);
  }

  const { data, error, isLoading, mutate } = useSWR(shouldUpload && token && baseUrl ? [
                                            `${baseUrl}/wp-json/video-ai-chatbot/v1/upload-file/`,
                                            token
                                            ] : null, 
                                            ([url, token]) => handleUpload(url, token),
                                            { revalidateOnFocus: false, revalidateOnReconnect: false, shouldRetryOnError: false, recalidateOnMount: true });


  console.log('useUploadFile data', data);            
  return { data, error, isLoading, mutate };
}

export default useUploadFile;