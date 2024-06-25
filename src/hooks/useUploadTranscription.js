import { useEffect, useState } from 'react';
import { uploadFile } from './fetcher';
import useSWR from 'swr'

const useUploadTranscription = () => {

  const [transcriptionToUpload, setTranscriptionToUpload] = useState(null);

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
      return uploadFile(url, token, formData);
  }

  const startUpload = (transcription) => {
    console.log('startUpload', transcription);
    setTranscriptionToUpload(transcription);
}

 
  const { data, error, isLoading, mutate } = useSWR(
    transcriptionToUpload ? [ 
        `/wp-json/video-ai-chatbot/v1/upload-transcription/`,
         window.adminData.nonce, 
        transcriptionToUpload ? transcriptionToUpload : null
    ] : null, 
    ([url, token, transcription]) => handleUpload(url, token, transcription),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    console.log('useUploadTranscription useEffect data error isLoading', data, error, isLoading);
    if(data || error) {
      console.log('RESET TO NULL');
      setTranscriptionToUpload(null);
    }
      console.log('useUploadTranscription useEffect data error isLoading EXIT', data, error, isLoading);
  } , [data, error, isLoading]);

  console.log('data', data);
  console.log('error', error);
  console.log('isLoading', isLoading);
               
  return { data, error, isLoading, startUpload, mutate};
}

export default useUploadTranscription;