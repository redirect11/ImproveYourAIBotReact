import React, { useEffect, useState } from 'react';
import { Button, CheckboxControl, TextControl, TextareaControl } from '@wordpress/components';
import { useDispatch } from 'react-redux';
import { setTitle } from '../../redux/slices/HeaderTitleSlice';
import useGetAllOptions from '../../hooks/useGetAllOptions';
import settings from './settings';
import DeleteUnusedVectorStoresButton from './DeleteUnusedVectorStoresButton';
import SettingsPanel from './SettingsPanel';
import { config } from '../../Constants';
import useAuth from '../../hooks/useAuth';
import { CircularProgress } from '@material-ui/core';
import { useDispatch as useDispatchWordpress } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import RemoteOperationButton from '../RemoteOperationButton';
import { setTranscriptions } from '../../redux/slices/TranscriptionsSlice';
import SettingsList from './SettingsList';



const SettingsPage = () => {
    const dispatch = useDispatch();

    const { token, baseUrl } = useAuth();

    const { isError, isLoading, options } = useGetAllOptions();
    const [formValues, setFormValues] = useState([]);
    const [isSaving, setIsSaving] = useState(false);   
    const [saveError, setSaveError] = useState('');

    console.log('isError', isError);
    console.log('isLoading', isLoading);
    console.log('options', options);

    const { createSuccessNotice, createErrorNotice } = useDispatchWordpress( noticesStore );

    useEffect(() => {
        dispatch(setTitle('Configura Chatbot'));
    }, [dispatch]);

    useEffect(() => {
        if (options) {
            const optsArray = Object.keys(settings).filter(settingKey => options.hasOwnProperty(settingKey)).map(settingKey => {
                const option = options[settingKey] || '';
                return { id: settingKey, value: option };
            });
            console.log('optsArray', optsArray);
            setFormValues(optsArray);
        }
    }, [options]);

    const handleChange = (id, value) => {
        console.log('handleChange id', id);
        console.log('handleChange value', value);

        if(id === 'video_ai_enable_chatbot_field') {
            value = value ? '1' : '0';
        }

        setFormValues(prevState => prevState.map(option => option.id === id ? { ...option, value } : option));
    };


    const handleSubmit = async () => {
        // Prepara i dati nel formato originale
        if(token && baseUrl) {
            setSaveError('');
            setIsSaving(true);
            const formData = new FormData();
            formValues.forEach(({ id, value }) => {
                formData.append(id, value);
            });
            try {
                const response = await fetch(`${baseUrl}/wp-json/video-ai-chatbot/v1/set-all-options`, {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                    body: formData
                });

                console.log('response', response.ok);

                if (!response.ok) {
                    setSaveError('Errore durante il salvataggio delle impostazioni' . response.statusText);
                    createErrorNotice('Errore durante il salvataggio delle impostazioni');
                } else {
                    createSuccessNotice('Impostazioni salvate con successo');
                }
                setIsSaving(false);
                console.log('Impostazioni salvate con successo');
            } catch (error) {
                console.error('Errore:', error);
                createErrorNotice('Errore:', error);
                setSaveError('Errore durante il salvataggio delle impostazioni', response.statusText);
            }
        } else {
            console.error('Errore:', 'Token o baseUrl non disponibili');
            createErrorNotice('Errore:', 'Token o baseUrl non disponibili');
            setSaveError('Errore:', 'Token o baseUrl non disponibili');
        }
    };

       // Funzione per sincronizzare le trascrizioni
       const syncTranscriptions = async () => { //TODO move this to a hook
        if(token && baseUrl) {
            try {
                const response = await fetch(`${baseUrl}/wp-json/video-ai-chatbot/v1/sync-transcriptions/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token,	
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log(data.message);
                    console.log(data.transcriptions)
                    // Aggiorna lo stato o esegui altre azioni dopo la sincronizzazione
                    //setPaginatedTranscriptions(paginateArray(data.transcriptions, view.page, view.perPage));
                    dispatch(setTranscriptions(data.transcriptions));
                    createSuccessNotice('Trascrizioni sincronizzate con successo');                    
                } else {
                    const errorData = await response.json();
                    console.error('Error:', errorData.message);
                    createErrorNotice('Errore durante la sincronizzazione delle trascrizioni');
                }
            } catch (error) {
                console.error('Error:', error);
            }
            //setIsLoading(false);
        }
    };

    return (
        <>
            <SettingsPanel title={'Cancella vector stores inutilizzati'} open={true}>
                {isLoading ? (
                    <CircularProgress size="5rem" color="inherit" className='justify-center items-center'/>
                ) : isError ? ( 
                    <p>Errore durante il caricamento delle impostazioni</p>
                ) : (
                    <>
                        <SettingsList options={formValues} handleChange={handleChange} />
                        <div>
                            <br />
                            <label>Sincronizza le trascrizioni con OpenAI</label>
                            <br />
                            <Button variant="secondary" onClick={ () => {
                                //setIsLoading(true);
                                syncTranscriptions();
                            }}>
                                Sincronizza Trascrizioni
                            </Button>
                        </div>
                    </>
                )}
                <br />
                <Button variant='primary' onClick={handleSubmit}>Salva Impostazioni</Button>
                {isSaving && <CircularProgress size="5rem" color="inherit"/>}
                {saveError && <p>{saveError}</p>}
                {/* <DeleteUnusedVectorStoresButton /> */}
            </SettingsPanel>
        </>
    );
};

export default SettingsPage;
