import React, { useCallback, useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import TranscriptionBaseData from './TranscriptionBaseData';
import TranscriptionTimeline from './TranscriptionTimeline';
import { Button, Panel, PanelBody } from '@wordpress/components'
import AssistantsGrid from './AssistantsGrid';
import useUploadTranscription from '../../../hooks/useUploadTranscription';
import { useDispatch as useDispatchWordpress } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import useAssistants from '../../../hooks/useAssistants';
import useTranscriptions from '../../../hooks/useTranscriptions';
import { useHeader } from '../../HeaderContext';
import { more } from '@wordpress/icons';


const ManageTranscription = ( { selectedTranscription, uploadEnabled, onTranscriptionSave  } ) => {
    console.log('selectedTranscription', selectedTranscription);

    const { createSuccessNotice, createErrorNotice } = useDispatchWordpress( noticesStore );

    const {data, error, isLoading, startUpload} = useUploadTranscription();

    const { mutate: mutateAssistants } = useAssistants();
    const { mutate: mutateTranscriptions } = useTranscriptions();

    useEffect(() => {
        if(!isLoading && (data || error) ) {
            startUpload(null);
            if(data) {
                createSuccessNotice('Trascrizione salvata con successo');
                mutateAssistants();
                mutateTranscriptions();
            } 
            if(error) createErrorNotice('Errore durante il salvataggio della trascrizione');
        }
    }, [data, error, isLoading]);


    const onVideoLinkChanged = useCallback((videoLink) => {
        const updatedTranscription = { ...selectedTranscription, transcription: {...selectedTranscription.transcription, videoHrefLink: videoLink }};
        onTranscriptionSave(updatedTranscription);
    }, [selectedTranscription]);

    const onVideoTitleChanged = useCallback((videoTitle) => {
        const updatedTranscription = { ...selectedTranscription, transcription: {...selectedTranscription.transcription, videoTitle: videoTitle }};
        onTranscriptionSave(updatedTranscription);
    },[selectedTranscription]);

    const onTextChanged = useCallback((transcriptionData) => {
        const updatedTranscription = { ...selectedTranscription, transcription: transcriptionData};
        onTranscriptionSave(updatedTranscription);
    }, [selectedTranscription]);
    
    const { addButton, hideButton } = useHeader();
    
    const saveButtonClickRef = useRef(null);

    useEffect(() => {
        if(selectedTranscription && uploadEnabled) {
            const saveButtonClassName = "btn btn-sm btn-accent btn-outline mx-1"
            saveButtonClickRef.current = () => { startUpload(selectedTranscription) };
            const button = {
                label: 'Salva Trascrizione Corrente',
                className: saveButtonClassName,
                onClick: saveButtonClickRef.current
            };
            addButton(button);
            return () => {
                hideButton(button.label);
            };
        }
    }, [selectedTranscription]);


    return (
        <>
            {selectedTranscription &&      
                <>
                    <Panel header="Modifica Trascrizione" className='flex-1 flex-shrink flex-grow h-full w-8/12 overflow-y-scroll text-justify p-2 mr-1'>
                        <PanelBody title="Timeline Trascrizione" icon={ more } initialOpen={ true } >
                            <TranscriptionTimeline transcriptionData={selectedTranscription.transcription} onTextChanged={onTextChanged} />
                        </PanelBody>
                    </Panel>
                    <Panel header="Review Trascrizione" className='transcription flex-none w-4/12 h-full mr-1 overflow-y-scroll '>
                        <PanelBody title="Info Trascrizione" icon={ more } initialOpen={ true } >
                            <TranscriptionBaseData 
                                fileName={selectedTranscription.file_name} 
                                fileText={selectedTranscription.transcription.videoText} 
                                videoTitle={selectedTranscription.transcription.videoTitle} 
                                videoLink={selectedTranscription.transcription.videoHrefLink}
                                onVideoLinkChanged={onVideoLinkChanged}
                                onVideoTitleChanged={onVideoTitleChanged}/>
                        </PanelBody>
                        <PanelBody title="Associa Assistenti" icon={ more } initialOpen={ false } >
                            <h2 >Seleziona Assistenti da associare</h2>
                            <AssistantsGrid transcription={selectedTranscription} onTranscriptionUpdated={onTranscriptionSave} />
                        </PanelBody>
                    </Panel>
                </>
            }
        </>
    );
};

export default ManageTranscription;