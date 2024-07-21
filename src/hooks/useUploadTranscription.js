import { useEffect, useState } from 'react';
import { uploadAuthFile } from './fetcher';
import useSWR from 'swr'
import useAuth from './useAuth';
import { config } from '../Constants';

const useUploadTranscription = () => {

  const [transcriptionToUpload, setTranscriptionToUpload] = useState(null);

  const {token, baseUrl} = useAuth();

  const handleUpload = async (url, token, transcription) => {
    const formData = new FormData();
      if(url && token){
        console.log('uploadFile', transcription);
        const updatedTranscription = JSON.stringify(transcription, null, 2);
        const updatedFile = new Blob([updatedTranscription], { type: "application/json" });
        const updatedFileName = transcription.file_name;
        formData.append('file', new File([updatedFile], updatedFileName));
        if(transcription.file_id){
            formData.append('file_id', transcription.file_id);
        }
      }
      return uploadAuthFile(url, token, formData);
  }

  const startUpload = (transcription) => {
    console.log('startUpload', transcription);
    setTranscriptionToUpload(transcription);
}

 
  const { data, error, isLoading, mutate } = useSWR(
    transcriptionToUpload && token && baseUrl ? [ 
        `${baseUrl}/wp-json/video-ai-chatbot/v1/upload-transcription/`,
         token, 
        transcriptionToUpload ? transcriptionToUpload : null
    ] : null, 
    ([url, token, transcription]) => handleUpload(url, token, transcription),
    { revalidateOnFocus: false, shouldRetryOnError: false}
  );

  useEffect(() => {
    if(data || error) {
      setTranscriptionToUpload(null);
    }
  } , [data, error, isLoading]);
               
  return { data, error, isLoading, startUpload, mutate};
}

export default useUploadTranscription;