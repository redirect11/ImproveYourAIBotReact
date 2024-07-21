import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Panel, PanelBody, Button } from '@wordpress/components';
import { Oval } from 'react-loader-spinner'
import { Presets } from "react-component-transition";
import  UploadTranscriptions  from './UploadTranscriptions';
import '../dataview.css';
import { setTranscriptions, updateTranscription, deleteTranscription } from '../../redux/slices/TranscriptionsSlice';
import TranscriptionsList from './TranscriptionsList';
import { setTitle } from '../../redux/slices/HeaderTitleSlice';
import useAuth from '../../hooks/useAuth';
import { config } from "../../Constants";
import { useDispatch as useDispatchWordpress } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import useTranscriptions from '../../hooks/useTranscriptions';
import useAssistants from '../../hooks/useAssistants';

const TranscriptionsPage = () => {

    const { token } = useAuth();

    const { createErrorNotice, createSuccessNotice } = useDispatchWordpress( noticesStore );

    const [ isLoading, setIsLoading ] = useState(false); 

    const dispatch = useDispatch();

    const { data: allTranscriptions, mutate: mutateTranscriptions } = useTranscriptions();
    const { mutate: mutateAssistants } = useAssistants();

    useEffect(() => {
        // Aggiorna il titolo della pagina
        dispatch(setTitle('Trascrizioni'));
    }, []);

 

    const handelTranscriptionSave = (newTranscription) => {
        dispatch(updateTranscription({ newTranscription: newTranscription }));
    };

    const handleTranscriptionDelete = async (file_id) => { //todo move this to a hook
        if(token) {
            console.log('handleTranscriptionDelete:', file_id);
            const response = await fetch(`${config.url.API_URL}/wp-json/myplugin/v1/delete-transcription/${file_id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + token,	
                  }
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log(data.message);
                // Aggiorna lo stato o esegui altre azioni dopo la cancellazione
                dispatch(deleteTranscription({ transcriptions: allTranscriptions, file_id: file_id }));
                createSuccessNotice('Trascrizione cancellata con successo');
                mutateTranscriptions();
                mutateAssistants();
            } else {
                const errorData = await response.json();
                console.error('Error:', errorData.message);
                createErrorNotice('Errore durante la cancellazione della trascrizione');
            }
        }
    };
        
    return (
        <>
            { isLoading && <Oval color="#00BFFF" height={100} width={100} /> }
            { !isLoading && allTranscriptions.length === 0 && <p>Nessuna trascrizione disponibile</p>}
            { !isLoading && allTranscriptions.length > 0 && (
                <>
                    <TranscriptionsList 
                        transcriptions={allTranscriptions} 
                        onSavingTranscription={handelTranscriptionSave} 
                        onDeletingTranscription={handleTranscriptionDelete}
                    />
                </>
            )}
        </>
    );
};

export default TranscriptionsPage;