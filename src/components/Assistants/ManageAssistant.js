import React, { useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import { useDispatch as useDispatchWordpress } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { Button, 
         TextControl, 
         TextareaControl, 
         PanelRow,
         PanelBody,
         SelectControl } from '@wordpress/components';
import TranscriptionSelector from './ManageAssistant/TranscriptionSelector';
import UploadAssistantFile from './ManageAssistant/UploadAssistantFile';
import FetchableAssistantFileForm from './ManageAssistant/FetchableAssistantFileForm';

const ManageAssistant = ({assistant}) => {

    console.log('ManageAssistant');
    const [name, setName] = useState(assistant ? assistant.name : '');
    const [prompt, setPrompt] = useState(assistant ? assistant.instructions : '');
    const [assistantType, setAssistantType] = useState(assistant ? assistant.metadata.type : 'trascrizioni'); //TODO remove hardcoded value
    const [uploadStarted, setUploadStarted] = useState(false);
    const [selectedFileIds, setSelectedFileIds] = useState([]);

    const title = assistant ? __( 'Modifica Assistente', 'video-ai-chatbot' ) : __( 'Crea Assistente', 'video-ai-chatbot' );
    const initialOpen = assistant ? true : false;

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

    useEffect(() => {
        console.log('ManageAssistant useEffect');
        if(assistant) {
            setName(assistant.name);
            setPrompt(assistant.instructions);
            if(assistant.metadata && assistant.metadata.type) {
                setAssistantType(assistant.metadata.type);

            } else {
                setAssistantType('trascrizioni');
            }
        }
        else {
            setAssistantType('trascrizioni');
        }
        console.log('ManageAssistant useEffect END');
    }, [assistant]);

    const { createSuccessNotice, createErrorNotice } = useDispatchWordpress( noticesStore );

    const callCreateAssistantApi = async (request) => {
        const response = await fetch('/wp-json/video-ai-chatbot/v1/' + (assistant ? 'update-assistant/' : 'create-assistant/'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': window.adminData.nonce
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
        } else {
            createErrorNotice( __('Errore nella creazione dell\'assistente.', 'video-ai-chatbot'));
        }
    }

    const handleCreateAssistant = async () => {
        console.log('handleCreateAssistant');
        if(assistant) {

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

            callCreateAssistantApi(request);

        }  else {
            console.log('setUploadStarted'); 
            setUploadStarted(true);
        }

    };

    const handleUploadFinished = (fileId) => {
        if(fileId) {
            console.log('handleUploadFinished', fileId);
            setSelectedFileIds([...selectedFileIds, fileId]);
        } else {
            createErrorNotice( __('Errore nel caricamento del file', 'video-ai-chatbot'));
            return;
        }
        setUploadStarted(false);

        let request = {
            name: name,
            prompt: prompt,
            files: selectedFileIds,
            type: assistantType
        }
        callCreateAssistantApi(request);
    };

    const handleSelectTranscriptions = (transcriptions) => {
        console.log('transcriptions', transcriptions);
        const files = transcriptions.map(({ file_id }) => file_id);
        setSelectedFileIds(files);
    };

    const handleFileDataFetched = (file_name, file_content, file_id) => {
        console.log('handleFileDataFetched', file_name, file_content, file_id);
        setSelectedFileIds([...selectedFileIds, file_id]);
    };
    

    return (
        <PanelBody                    
            title={ title }
            initialOpen={ initialOpen }>
            <PanelRow> {/*TODO extract component*/}
                <div style={{ width: "100%", height: "100%", marginRight: "10px" }}>
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
                    <Button variant="primary" onClick={() => { handleCreateAssistant() }}>Salva</Button>
                </div>
                <div style={{ width: "100%", height: "100%", marginLeft: "10px" }}>
                    { !assistant && (
                        <SelectControl
                            label="Seleziona Tipo di Assistente"
                            options={ selectOptions } 
                            onChange={ setAssistantType }
                            value={ assistantType }
                        />
                    )}
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
                        <div>
                            <h3>Seleziona Trascrizioni</h3>
                            <TranscriptionSelector onSelectionChange={(transcription) => { return handleSelectTranscriptions(transcription)}} assistant={assistant} />
                        </div>
                    )}
                </div>
            </PanelRow>
        </PanelBody>
    );
};
ManageAssistant.propTypes = {
    assistant: PropTypes.object.isRequired
  }

export default ManageAssistant;
