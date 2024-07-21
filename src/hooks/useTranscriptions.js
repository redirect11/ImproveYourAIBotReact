import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAssistants, setSelectedAssistant } from '../redux/slices/AssistantsSlice';
import { setTranscriptions, setSelectedTranscription } from '../redux/slices/TranscriptionsSlice';
import useFetchData from '../hooks/useFetchData';
import _ from 'lodash';


const useTranscriptions = () => {

    const transcriptions = useSelector(state => state.rootReducer.transcriptions.transcriptions);

    const { 
        data, 
        error, 
        isLoading,
        mutate,
        needsLogin
    } = useFetchData('/wp-json/video-ai-chatbot/v1/transcriptions');

    const dispatch = useDispatch();	// Redux store dispatch

    useEffect(() => {
        if (data !== undefined && data !== null && !_.isEqual(data, transcriptions)) {
            // Aggiorna lo store Redux con i dati ottenuti
            dispatch(setTranscriptions(data));
        }
    }, [data, dispatch]);
    
    return {
        isLoading,
        error,
        data: transcriptions,
        needsLogin,
        mutate
    }
    
};

export default useTranscriptions;