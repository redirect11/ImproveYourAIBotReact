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
import UploadAssistantFile from './UploadAssistantFile';

const ManageQuoteAssistant = ({assistant}) => {

    console.log('ManageQuoteAssistant');
    const [name, setName] = useState(assistant ? assistant.name : '');
    const [prompt, setPrompt] = useState(assistant ? assistant.instructions : '');
    const [assistantType, setAssistantType] = useState('preventivi'); //TODO remove hardcoded value
    const [uploadStarted, setUploadStarted] = useState(false);
    const [selectedFileIds, setSelectedFileIds] = useState([]);

    const title = assistant ? __( 'Modifica Assistente', 'video-ai-chatbot' ) : __( 'Crea Assistente', 'video-ai-chatbot' );
    const initialOpen = assistant ? true : false;

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
                setAssistantType('preventivi');
            }
        }
        else {
            setAssistantType('preventivi');
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
                setAssistantType('preventivi');
            }
            //setTimeout(() => window.location.reload(), 2000);
        } else {
            createErrorNotice( __('Errore nella creazione dell\'assistente.', 'video-ai-chatbot'));
        }
    }

    const handleCreateAssistant = async () => {
        console.log('handleCreateAssistant');
            console.log('setUploadStarted'); 
            setUploadStarted(true);
    };

    const handleUploadFinished = (fileId) => {
        setUploadStarted(false);
        let fileIds = [];
        if(fileId) {
            console.log('handleUploadFinished', fileId);
            fileIds = [...selectedFileIds, fileId];
            setSelectedFileIds(fileIds);
        } 
        // else {
        //     createErrorNotice( __('Errore nel caricamento del file', 'video-ai-chatbot'));
        //     return;
        // }

        let request = {
            name: name,
            prompt: prompt,
            files: fileIds,
            type: assistantType
        }

        if(assistant) {
            request.id = assistant.id;
            request.vector_store_ids = vector_store_ids;
        }

        callCreateAssistantApi(request);
    };
    

    return (
        <PanelBody                    
            title={ title }
            initialOpen={ initialOpen }>
            <PanelRow> {/*TODO extract component*/}
                <div style={{ width: "100%", height: "100%", marginRight: "10px", position: "relative", top: "10px" }}>
                    <h3>Istruzioni per il chatbot</h3>
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
                        rows={20}
                    />
                    <Button variant="primary" onClick={() => { handleCreateAssistant() }}>Salva</Button>
                </div>
                <div style={{ width: "100%", height: "100%", marginLeft: "10px" }}>
                    <UploadAssistantFile assistant={assistant} shouldUpload={uploadStarted} onUploadFinished={handleUploadFinished} />
                </div>
            </PanelRow>
        </PanelBody>
    );
};
ManageQuoteAssistant.propTypes = {
    assistant: PropTypes.object.isRequired
  }

export default ManageQuoteAssistant;
