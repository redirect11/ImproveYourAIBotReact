import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch as useDispatchWordpress } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { TextControl, TextareaControl, 
    Panel,
    PanelBody,
    SelectControl,
    CheckboxControl } from '@wordpress/components';
    
import TranscriptionSelector from './ManageAssistant/TranscriptionSelector';
import UploadAssistantFile from './ManageAssistant/UploadAssistantFile';
import useAuth from '../../hooks/useAuth';
import { more } from '@wordpress/icons';
import { useListener } from 'react-bus';
import { useDispatch } from 'react-redux';
import { setSelectedAssistant } from '../../redux/slices/AssistantsSlice';
import { useHeader } from '../HeaderContext';
import useGetGptModels from '../../hooks/useGetGptModels';

const ManageAssistant = ({assistant, mutateData}) => {

    const [name, setName] = useState(assistant ? assistant.name : '');
    const [prompt, setPrompt] = useState(assistant ? assistant.instructions : '');
    const [assistantType, setAssistantType] = useState(assistant ? assistant.metadata.type : 'trascrizioni');
    const [isPrivate, setIsPrivate] = useState(assistant?.metadata?.isPrivate && assistant.metadata.isPrivate === "true" ? true : false);
    const [selectedFileIds, setSelectedFileIds] = useState([]);
    const [roles, setRoles] = useState(assistant?.metadata?.roles ? assistant.metadata.roles : '');

    const { models, isLoading, isError } = useGetGptModels();
    const [selectedModel, setSelectedModel] = useState(assistant?.model || null);

    const rolesArray = roles ? roles.split('|').filter(Boolean) : [];

    const { token, baseUrl }  = useAuth();

    const dispatch = useDispatch();

    const { updateAssistantCreationStatus } = useHeader();

    console.log('selectedFileIds', selectedFileIds);
    console.log('name', name);
    console.log('prompt', prompt);
    console.log('assistantType', assistantType);
    console.log('isPrivate', isPrivate);
    console.log('roles', roles);


    const selectOptions = [
    {
        label: 'Assistente Trascrizioni',
        value: 'trascrizioni'
    },
    {
        label: 'Assistente Generico',
        value: 'preventivi'
    },
    ]

    let vector_store_ids = [];
    if(assistant && assistant.tool_resources && assistant.tool_resources.file_search && assistant.tool_resources.file_search.vector_store_ids) {
        vector_store_ids = assistant.tool_resources.file_search.vector_store_ids;           
    }

    const { createSuccessNotice, createErrorNotice, createInfoNotice } = useDispatchWordpress( noticesStore );

    useEffect(() => {
        if(!assistant) {
            setSelectedFileIds([]);
        }
        if (assistant && assistant.metadata && assistant.metadata.model) {
            setSelectedModel(assistant.metadata.model);
        }
    }, [assistant]);

    const callCreateAssistantApi = async (fileId) => {
        updateAssistantCreationStatus('creating');
        let mergedFiles = [...selectedFileIds];
    
        if (fileId && fileId !== '') {
            mergedFiles.push(fileId);
        }
    
        let request = {
            name: name,
            prompt: prompt,
            files: mergedFiles,
            type: assistantType,
            model: selectedModel,
            metadata: {
                roles: roles,
                isPrivate: isPrivate.toString()
            }
        };
    
        if (assistant) {
            request.id = assistant.id;
            request.vector_store_ids = vector_store_ids;
            console.log('handleUploadFinished request', request.files, request.vector_store_ids);
        }
    
        console.log('request', request);
        const response = await fetch(`${baseUrl}/wp-json/video-ai-chatbot/v1/` + (assistant ? 'update-assistant/' : 'create-assistant/'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,    
            },
            body: JSON.stringify(request),
        });
    
        console.log('response', response);
    
        if (response.ok) {
            createSuccessNotice(
                __('Settings saved.', 'video-ai-chatbot')
            );
    
            if (!assistant) {
                setName('');
                setPrompt('');
                setAssistantType('trascrizioni');
                setIsPrivate(false);
                setRoles('');
            }
            mutateData();
        } else {
            createErrorNotice(__('Errore nella creazione dell\'assistente.', 'video-ai-chatbot'));
        }
        setSelectedFileIds([]);
        dispatch(setSelectedAssistant(null));
        updateAssistantCreationStatus(null);
    };
    
    useListener('uploaded_file_id', callCreateAssistantApi);

    const handleSelectTranscriptions = useCallback((transcriptions) => {
        const files = transcriptions?.map(({ file_id }) => file_id);
        console.log('handleSelectTranscriptions files', files);
        setSelectedFileIds(files);
    }, [selectedFileIds, assistant, setSelectedFileIds]);


    const setAssistantMetadata = (roleName, value) => {
        let newRoles = rolesArray;
        if (value) {
            if (!newRoles.includes(roleName)) {
                newRoles.push(roleName);
            }
        } else {
            newRoles = newRoles.filter(role => role !== roleName);
        }
        console.log('newRoles', newRoles.join('|'));
        setRoles(newRoles.join('|'));
    };

    let header = assistant ? "Modifica Assistente" : "Nuovo Assistente";
    return (
    <>
    <Panel header={header} className='assistant flex-1 w-full mr-1 h-full overflow-y-auto text-black'>
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
                    className='text-black'
                    value={  name }
                    onChange={ (value) => setName(value) }
                />
                <br />
                <TextareaControl
                    label="Prompt"
                    className='text-black'
                    help="Inserisci le istruzioni per l'assistente."
                    value={ prompt }
                    onChange={ (value) => setPrompt(value) }
                />
                    {isLoading && <p>Caricamento modelli...</p>}
                    {isError && <p>Errore nel caricamento dei modelli.</p>}
                    {models && (
                        <>
                            <label className='text-xs font-medium leading-tight uppercase inline-block mb-2 p-0'>
                                Seleziona Modello GPT
                            </label>
                            <select
                                className='box-border w-full text-slate-600 bg-white border border-slate-300 appearance-none rounded-lg px-3.5 py-2.5 outline-none text-sm'
                                label="Seleziona Modello GPT"
                                onChange={e => setSelectedModel(e.target.value)}
                                value={selectedModel}
                            >
                                <option value="">Seleziona Modello GPT</option>
                                {models.map(model => (
                                    <option key={model.id} value={model.id}>
                                        {model.id}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}
                <br />
                {assistantType === 'trascrizioni' && (
                    <>
                        <h4>Associa ruoli utente:</h4>
                        <CheckboxControl
                            label="Non registrato"
                            checked={rolesArray.includes('non_registrato')}
                            onChange={(value) => setAssistantMetadata('non_registrato', value)}
                        />
                        <CheckboxControl
                            label="Registrato"
                            checked={rolesArray.includes('registrato')}
                            onChange={(value) => setAssistantMetadata('registrato', value)}
                        />
                        <CheckboxControl
                            label="Customer"
                            checked={rolesArray.includes('cliente')}
                            onChange={(value) => setAssistantMetadata('cliente', value)}
                        />
                        <CheckboxControl
                            label="Abbonato"
                            checked={rolesArray.includes('abbonato')}
                            onChange={(value) => setAssistantMetadata('abbonato', value)}
                        />
                    </>
                )}
                {assistantType === 'preventivi' && (
                    <CheckboxControl
                        label="Privato"
                        checked={isPrivate}
                        onChange={(value) => setIsPrivate(value)}
                    />
                )}
        </PanelBody>
    </Panel>

    {assistantType === 'preventivi' && (     
        <Panel className='flex-1 w-full mr-1 h-min overflow-y-auto'>
            <PanelBody>              
                <UploadAssistantFile assistant={assistant} />
            </PanelBody>
        </Panel>
    )}

    {assistantType === 'trascrizioni' && (

        <Panel className="flex-1 w-full h-min max-h-[48rem] mr-1 overflow-y-scroll">
            <PanelBody initialOpen={ true } title='Seleziona Trascrizioni'> 
                <TranscriptionSelector onSelectionChange={handleSelectTranscriptions} assistant={assistant} />
            </PanelBody>
            <PanelBody title="Carica file" icon={ more } > 
                <UploadAssistantFile assistant={assistant}  />
            </PanelBody>
        </Panel>

    )}

    </>
    );
};

ManageAssistant.propTypes = {
    assistant: PropTypes.object.isRequired
}

export default ManageAssistant;
