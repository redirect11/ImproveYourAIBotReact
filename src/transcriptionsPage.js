import React, { useState } from 'react';
import domReady from '@wordpress/dom-ready';
import { createRoot } from '@wordpress/element';
import { useSelector, useDispatch } from 'react-redux';
import store from './redux/store';
import { Provider } from 'react-redux';
import { __ } from '@wordpress/i18n';
import { Panel, PanelBody, Button } from '@wordpress/components';
import { Oval } from 'react-loader-spinner'
import { Presets } from "react-component-transition";
import  UploadTranscriptions  from './components/Transcriptions/UploadTranscriptions';
import './components/dataview.css';
import { setTranscriptions, updateTranscription, deleteTranscription } from './redux/slices/TranscriptionsSlice';
import TranscriptionsDataView from './components/Transcriptions/TranscriptionsDataView';
import Notices from './components/Notices';

const TranscriptionsPage = () => {

    const [ isLoading, setIsLoading ] = useState(false); 

    const dispatch = useDispatch();

    const allTranscriptions = useSelector((state) => { return state.rootReducer.transcriptions.transcriptions });

    // Funzione per sincronizzare le trascrizioni
    const syncTranscriptions = async () => {
        try {
            const response = await fetch('/wp-json/video-ai-chatbot/v1/sync-transcriptions/', {
                method: 'POST',
                headers: {
                    'X-WP-Nonce': window.adminData.nonce
                }
            });
            if (response.ok) {
                const data = await response.json();
                console.log(data.message);
                console.log(data.transcriptions)
                // Aggiorna lo stato o esegui altre azioni dopo la sincronizzazione
                //setPaginatedTranscriptions(paginateArray(data.transcriptions, view.page, view.perPage));
                dispatch(setTranscriptions(data.transcriptions));
            } else {
                const errorData = await response.json();
                console.error('Error:', errorData.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
        setIsLoading(false);
    };

    const handelTranscriptionSave = (newTranscription) => {
        dispatch(updateTranscription({ newTranscription: newTranscription }));
        console.log('handelTranscriptionSave:', allTranscriptions);
        
    };

    const handleTranscriptionDelete = async (file_id) => {
        console.log('handleTranscriptionDelete:', file_id);
        const response = await fetch(`/wp-json/myplugin/v1/delete-transcription/${file_id}`, {
            method: 'DELETE',
            headers: {
                'X-WP-Nonce': window.adminData.nonce
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data.message);
            // Aggiorna lo stato o esegui altre azioni dopo la cancellazione
            dispatch(deleteTranscription({ transcriptions: allTranscriptions, file_id: file_id }));
        } else {
            const errorData = await response.json();
            console.error('Error:', errorData.message);
        }
    };
        
    return (
        <>
            <>
            <Panel>
                <PanelBody>
                    <div>
                        <br />
                        <Button variant="secondary" onClick={ () => {
                            setIsLoading(true);
                            syncTranscriptions();
                        }}>
                            Sincronizza Trascrizioni
                        </Button>
                    </div>
                        <Presets.TransitionFade>
                        { isLoading && <Oval color="#00BFFF" height={100} width={100} /> }
                        { !isLoading && allTranscriptions.length === 0 && <p>Nessuna trascrizione disponibile</p>}
                        { !isLoading && allTranscriptions.length > 0 && (
                            <>
                                <TranscriptionsDataView 
                                transcriptions={allTranscriptions} 
                                onSavingTranscription={handelTranscriptionSave} 
                                onDeletingTranscription={handleTranscriptionDelete}
                                />
                            </>
                        )}
                    </Presets.TransitionFade>
                </PanelBody>
            </Panel>
            <Panel>
                <PanelBody
                    title={ __( 'Carica Trascrizioni', 'unadorned-announcement-bar' ) }
                    initialOpen={ false }
                >
                     <UploadTranscriptions />
                </PanelBody>
            </Panel>
            </>
        </>
    );
};

domReady( () => {
    const element = document.getElementById('react-transcriptions-page');
    if(!element) return;
    const root = createRoot(element)
    root.render(
        <Provider store={store}>
            <TranscriptionsPage />
        </Provider>
    );

    const noticesElement = document.getElementById('react-transcriptions-notices');
    if(noticesElement) {
        const noticesRoot = createRoot(noticesElement);
        noticesRoot.render(
                <Notices />
        );
    }
} );