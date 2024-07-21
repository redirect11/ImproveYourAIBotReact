import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAssistants, setSelectedAssistant } from '../redux/slices/AssistantsSlice';
import { setTranscriptions, setSelectedTranscription } from '../redux/slices/TranscriptionsSlice';
import useFetchData from '../hooks/useFetchData';
import _ from 'lodash';
import { store as noticesStore } from '@wordpress/notices';
import { useDispatch as useDispatchWordpress } from '@wordpress/data';


const useAssistants = () => {

    const selectedAssistant = useSelector(state => state.rootReducer.assistants.selectedAssistant);
    const assistants = useSelector(state => state.rootReducer.assistants.assistants);
    
    const { 
        data, 
        error, 
        isLoading,
        mutate,
        needsLogin 
    } = useFetchData('/wp-json/video-ai-chatbot/v1/assistants');

    
    const dispatch = useDispatch();	// Redux store dispatch

    const {createErrorNotice} = useDispatchWordpress(noticesStore);

    useEffect(() => {
        if (data !== undefined && data !== null && !_.isEqual(data, assistants) && Array.isArray(data)) {
            dispatch(setAssistants(data))
            dispatch(setSelectedAssistant(selectedAssistant ? (data.find(assistant => assistant.id === selectedAssistant.id) || null) : null));
        } else if(!data?.success && data?.message) {
            console.log('useAssistants error', data.message);
            createErrorNotice(data.message);
        }
    }, [data, dispatch]);

    return {
        isLoading,
        error,
        data: assistants,
        needsLogin,
        mutate,
        needsOpenAiToken: !data?.success && data?.message === 'OpenAI client not initialized'
    }
    
};

export default useAssistants;