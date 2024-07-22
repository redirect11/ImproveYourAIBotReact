import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch as useDispatchWordpress } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { Button, 
         TextControl, 
         TextareaControl, 
         Panel,
         PanelBody,
         SelectControl } from '@wordpress/components';
import TranscriptionSelector from './ManageAssistant/TranscriptionSelector';
import UploadAssistantFile from './ManageAssistant/UploadAssistantFile';
import FetchableAssistantFileForm from './ManageAssistant/FetchableAssistantFileForm';
import useAuth from '../../hooks/useAuth';
import { useHeader } from '../HeaderContext';
import { setSelectedAssistant } from '../../redux/slices/AssistantsSlice';

const ManageAssistant = ({assistant, mutateData}) => {

    const [name, setName] = useState(assistant ? assistant.name : '');
    const [prompt, setPrompt] = useState(assistant ? assistant.instructions : '');
    const [assistantType, setAssistantType] = useState(assistant ? assistant.metadata.type : 'trascrizioni'); //TODO remove hardcoded value
    const [uploadStarted, setUploadStarted] = useState(false);
    const [selectedFileIds, setSelectedFileIds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    console.log('name', name);
    console.log('prompt', prompt);
    console.log('assistantType', assistantType);
    console.log('selectedFileIds', selectedFileIds);

    const { token, baseUrl }  = useAuth();

    const selectOptions = [ //TODO make it dynamic
        {
            label: 'Assistente Trascrizioni',
            value: 'trascrizioni'
        },
        {
            label: 'Assistente Preventivi',
            value: 'preventivi'
        },
    ]

    
    let vector_store_ids = [];
    if(assistant && assistant.tool_resources && assistant.tool_resources.file_search && assistant.tool_resources.file_search.vector_store_ids) {
        vector_store_ids = assistant.tool_resources.file_search.vector_store_ids;           
    }


    const { createSuccessNotice, createErrorNotice } = useDispatchWordpress( noticesStore );

    const { addButton, hideButton } = useHeader();

    const saveButtonClickRef = useRef(null);


    useEffect(() => {
        const saveButtonDisabled = !(prompt && name && selectedFileIds.length > 0) ? "disabled" : "";

        const saveButtonClassName = "btn btn-sm btn-accent btn-outline mx-1 " + saveButtonDisabled;
        saveButtonClickRef.current = handleCreateAssistant;
        console.log('saveButtonClassName', saveButtonClassName);
        const button = {
            label: 'Salva assistente corrente',
            className: saveButtonClassName,
            onClick: saveButtonClickRef.current
        };
        addButton(button);
        return () => {
            hideButton(button.label);
        };
    }, [assistant, name, prompt, selectedFileIds, assistantType]);

    const callCreateAssistantApi = async (request) => {
        const response = await fetch(`${baseUrl}/wp-json/video-ai-chatbot/v1/` + (assistant ? 'update-assistant/' : 'create-assistant/'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,	
            },
            body: JSON.stringify(request),
        });

        if (response.ok) {
            createSuccessNotice(
                __( 'Settings saved.', 'video-ai-chatbot' )
            );
            
            if(!assistant) {
                setName('');
                setPrompt('');
                setAssistantType('trascrizioni');
            }
            //setTimeout(() => window.location.reload(), 2000);
            mutateData();
        } else {
            createErrorNotice( __('Errore nella creazione dell\'assistente.', 'video-ai-chatbot'));
        }
    }

    const handleCreateAssistant = async () => {
        console.log('handleCreateAssistant', name, prompt, selectedFileIds, assistantType);
        if(assistant) {
            console.log('assistant', assistant);
            let request = {
                id: assistant.id,
                name: name,
                prompt: prompt,
                files: selectedFileIds,
                vector_store_ids: vector_store_ids,
                type: assistantType
            }

            callCreateAssistantApi(request);

        } else if (!assistant && assistantType === 'trascrizioni') {
            let request = {
                name: name,
                prompt: prompt,
                files: selectedFileIds,
                type: assistantType
            }

            console.log('request', request);

            callCreateAssistantApi(request);

        }  else {
            setUploadStarted(true);
        }

    };

    const handleUploadFinished = useCallback((fileId) => {
        let fileIds = [];
        if(fileId) {
            fileIds = [...selectedFileIds, fileId];
            setSelectedFileIds(fileIds);
        } else {
            createErrorNotice( __('Errore nel caricamento del file', 'video-ai-chatbot'));
            return;
        }
        let request = {
            name: name,
            prompt: prompt,
            files: fileIds,
            type: assistantType
        }
        setUploadStarted(false);
        callCreateAssistantApi(request);
    },[selectedFileIds, name, prompt, assistantType, assistant]);

    const handleSelectTranscriptions = useCallback((transcriptions) => {
        console.log('handleSelectTranscriptions transcriptions', transcriptions);
        const files = transcriptions?.map(({ file_id }) => file_id);
        console.log('handleSelectTranscriptions files', files);
        setSelectedFileIds(files || []);
    }, [selectedFileIds, assistant]);

    const handleFileDataFetched = useCallback((file_name, file_content, file_id) => {
        console.log('handleFileDataFetched', file_name, file_content, file_id);
        if(file_id === '') return;
        let fileIds = [...selectedFileIds, file_id];
        console.log('handleFileDataFetched fileIds', fileIds);  
        setSelectedFileIds([...selectedFileIds, file_id]);
    },[selectedFileIds, assistant]);
    
            // <PanelBody                    
        //     title={ title }
        //     initialOpen={ initialOpen }>
    let header = assistant ? "Modifica Assistente" : "Nuovo Assistente";
    return (
        <>
        <Panel header={header} className='assistant flex-1 w-full mr-1 h-full overflow-y-auto'>
            <PanelBody className='relative flex flex-col h-full'>
                { !assistant && (
                    <>
                        <SelectControl
                            label="Seleziona Tipo di Assistente"
                            options={ selectOptions } 
                            onChange={ setAssistantType }
                            value={ assistantType }
                        />
                    </>
                )}
                    <TextControl
                        label="Nome"
                        value={  name }
                        onChange={ (value) => setName(value) }
                    />
                    <br />
                    <TextareaControl
                        label="Prompt"
                        help="Inserisci le istruzioni per l'assistente."
                        value={ prompt }
                        onChange={ (value) => setPrompt(value) }
                    />
            </PanelBody>
        </Panel>
        <Panel className='flex-1 w-full mr-1 h-full overflow-y-auto'>
            <PanelBody> 
                <div >
                    {assistantType === 'preventivi' && (
                        <div>
                            { assistant && (
                                <FetchableAssistantFileForm vector_stores_ids={vector_store_ids} 
                                                            editable={false} 
                                                            onFileDataFetched={handleFileDataFetched}/>
                            )}
                            { !assistant && (
                                <UploadAssistantFile shouldUpload={uploadStarted} onUploadFinished={handleUploadFinished} />
                            )}
                        </div>
                    )}
                    {assistantType === 'trascrizioni' && (
                        <div >
                            <h2>Seleziona Trascrizioni</h2>
                            <TranscriptionSelector onSelectionChange={handleSelectTranscriptions} assistant={assistant} />
                        </div>
                    )}
                </div>
                </PanelBody>
                </Panel>
        </>
    );
};
ManageAssistant.propTypes = {
    assistant: PropTypes.object.isRequired
  }

export default ManageAssistant;
