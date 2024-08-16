import React, { useEffect, useState } from 'react';
import { Button } from '@wordpress/components';
import { useDispatch } from 'react-redux';
import { setTitle } from '../../redux/slices/HeaderTitleSlice';
import useGetAllOptions from '../../hooks/useGetAllOptions';
import settings from './settings';
import SettingsList from './SettingsList';
import SettingsPanel from './SettingsPanel';
import useAuth from '../../hooks/useAuth';
import { CircularProgress } from '@material-ui/core';
import { useDispatch as useDispatchWordpress } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import WhatsappAssistantsSettings from './WhatsappAssistantsSettings';
import { setTranscriptions } from '../../redux/slices/TranscriptionsSlice';
import RemoteOperationButton from '../RemoteOperationButton';
import AddHandoverNumbers from './AddHandoverNumbers';

const SettingsPage = () => {
    const dispatch = useDispatch();

    const { token, baseUrl } = useAuth();

    const { isError, isLoading, options } = useGetAllOptions();
    const [formValues, setFormValues] = useState([]);
    const [isSaving, setIsSaving] = useState(false);   
    const [saveError, setSaveError] = useState('');
    const [associations, setAssociations] = useState(null);

    console.log('options', options);
    console.log('formValues', formValues);

    const { createSuccessNotice, createErrorNotice } = useDispatchWordpress( noticesStore );

    useEffect(() => {
        dispatch(setTitle('Configura Chatbot'));
    }, [dispatch]);

    useEffect(() => {
        if (options) {
            const optsArray = Object.keys(options).map(settingKey => {
                const option = options[settingKey] || '';
                if (settings.has(settingKey)) {
                    return { id: settingKey, value: option };
                }
                return null;
            }).filter(option => option !== null);
            setFormValues(optsArray);
            if(options['video_ai_whatsapp_assistants']) {
                console.log('video_ai_whatsapp_assistants', options['video_ai_whatsapp_assistants']);
                setAssociations(options['video_ai_whatsapp_assistants']);
            }
        }
    }, [options]);

    const handleChange = (id, value) => {
        console.log('handleChange id', id);
        console.log('handleChange value', value);

        if(id === 'video_ai_enable_chatbot_field') {
            value = value ? '1' : '0';
        }

        if(id === 'video_ai_whatsapp_assistants') {
            setAssociations(value);
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
                if(id === 'video_ai_whatsapp_assistants') {
                    value = JSON.stringify(value);
                }
                console.log('append', id, value);   
                formData.append(id, value);
            });
            try {
                console.log('formData', formData);
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

    const cancelAllRuns = async (onError, onSuccess, token, baseUrl) => {
        try {
            const response = await fetch(`${baseUrl}/wp-json/video-ai-chatbot/v1/cancel-all-users-runs/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                }
            });
            if (response.ok) {
                const data = await response.json();
                console.log(data.message);
                onSuccess(data);
            } else {
                const errorData = await response.json();
                console.error('Error:', errorData.message);
                onError(errorData);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const deleteAllThreads = async (onError, onSuccess, token, baseUrl) => {
        try {
            const response = await fetch(`${baseUrl}/wp-json/video-ai-chatbot/v1/delete-all-threads/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                }
            });
            if (response.ok) {
                const data = await response.json();
                console.log(data.message);
                onSuccess(data);
            } else {
                const errorData = await response.json();
                console.error('Error:', errorData.message);
                onError(errorData);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    return (
        <div className="flex flex-col w-full min-w-max h-[95%]">
            <div className="w-full">
                {isLoading ? (
                    <CircularProgress size="5rem" color="inherit" className='justify-center items-center'/>
                ) : isError ? ( 
                    <p>Errore durante il caricamento delle impostazioni</p>
                ) : (
                    <>
                        <SettingsPanel title={'Chatbot Settings'} open={true} className="h-full">
                            <SettingsList options={formValues} handleChange={handleChange} />
                        </SettingsPanel>
                    </>
                )}
            </div>
            {associations && 
                <div className="w-full flex-1 max-w-full">
                    <SettingsPanel title={'Whatsapp Settings'} open={true}>
                        <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
                            <WhatsappAssistantsSettings associations={associations} handleChange={handleChange} />
                        </div>
                    </SettingsPanel>
                </div>
            }
            <div className="w-full flex-1 max-w-full">
                <SettingsPanel>
                    <Button variant='primary' onClick={handleSubmit}>Salva Impostazioni</Button>
                    {isSaving && <CircularProgress size="5rem" color="inherit"/>}
                    {saveError && <p>{saveError}</p>}
                </SettingsPanel>
            </div>
            <div className="w-full flex-1 max-w-full">
                <SettingsPanel title={'Handover Notification Numbers'} open={true}>
                <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
                            <AddHandoverNumbers/>
                        </div>
                </SettingsPanel>
            </div>
            <div className="w-full flex-1 max-w-full">
                <SettingsPanel title={'Debugging'} open={false}>
                    <br />
                    <label>Sincronizza le trascrizioni con OpenAI</label>
                    <br />
                    <Button variant="secondary" onClick={ syncTranscriptions }>
                        Sincronizza Trascrizioni
                    </Button>
                    <RemoteOperationButton buttonText="Cancel all runs" callback={cancelAllRuns}/>
                    <RemoteOperationButton buttonText="Delete all threads" callback={deleteAllThreads}/>
                </SettingsPanel>
            </div>

        </div>
    );
};

export default SettingsPage;
