import { useState, useEffect } from 'react';
import useFetchData from '../hooks/useFetchData';

const useGetNotificationPhoneNumbers = (refresh) => {
  const { 
    data, 
    error, 
    isLoading,
    isValidating,
    mutate,
    needsLogin 
  } = useFetchData('/wp-json/video-ai-chatbot/v1/get-handover-notification-numbers');

  return {
    isLoading,
    isValidating,
    error,
    phoneNumbers: data && !Array.isArray(data)? JSON.parse(data) : data,
    needsLogin,
    mutate
  };
};

export default useGetNotificationPhoneNumbers;