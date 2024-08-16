import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Button, Spinner } from '@wordpress/components';
import { FormFileUpload } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import AssistantFileForm from './AssistantFileForm';
import PropTypes from 'prop-types';
import useAuth from '../../../hooks/useAuth';
import { uploadAuthFile } from '../../../hooks/fetcher';
import { useHeader } from '../../HeaderContext';
import useGetFile from '../../../hooks/useGetFile';
import { useBus } from 'react-bus';

const Result = ({ status }) => {
        if (status === "success") {
            return <p>✅ File uploaded successfully!</p>;
        } else if (status === "fail") {
            return <p>❌ File upload failed!</p>;
        } else if (status === "uploading") {
            return <p>⏳ Uploading selected file...</p>;
        } else {
            return null;
        }
};

const UploadAssistantFile = ({ assistant }) => {

    const [fileInfo, setFileInfo] = useState({file_id: '', file_name: '', file_text: ''});
    const { token, baseUrl } = useAuth();
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);


    const bus = useBus();

    const { addButton, hideButton, updateAssistantCreationStatus } = useHeader();

    let vector_store_ids = [];
    if(assistant && assistant.tool_resources && assistant.tool_resources.file_search && assistant.tool_resources.file_search.vector_store_ids) {
        vector_store_ids = assistant.tool_resources.file_search.vector_store_ids;           
        console.log('vector_store_ids', vector_store_ids);
    }

    const { file_name, file_content, file_id, error: getFileError, isLoading: getFileLoading, mutate } = useGetFile(!isEditing && vector_store_ids?.length > 0 ? vector_store_ids[0] : null);

    const saveButtonClickRef = useRef(null);

    useEffect(() => {
        if(file_name && file_content && file_id){
            console.log('UploadAssistantFile - useEffect: file_name, file_id', file_name, file_id);
            setFileInfo({file_id, file_name, file_text: file_content});
        } else if(getFileError) {
            console.log('Error fetching file');
        }
    }, [file_name, file_content, file_id]);

    useEffect(() => {
        const saveButtonDisabled = (isLoading) ? "disabled" : "";
        const saveButtonClassName = "btn btn-sm btn-accent btn-outline mx-1 " + saveButtonDisabled;
        saveButtonClickRef.current = handleUploadStart;
        const button = {
            id: 'create',
            label: 'Salva assistente corrente',
            className: saveButtonClassName,
            onClick: saveButtonClickRef.current
        };
        
        addButton(button);

        return () => {
            hideButton(button.label);
        };
        
    }, [assistant, fileInfo, file_name, file_content, file_id, handleUploadStart]);

    useEffect(() => {
        setIsEditing(false);
    }, [assistant]);


    const handleUploadStart = useCallback(() => {
        console.log('handleUploadStart fileInfo', fileInfo);
        setIsLoading(true);
        if(isEditing) {
            updateAssistantCreationStatus('uploading');
            const formData = new FormData();
            if(baseUrl && token){
                const updatedFile = new Blob([fileInfo.file_text], { type: "text/plain" });
                formData.append('file', new File([updatedFile], fileInfo.file_name));
                if(fileInfo.file_id){
                    console.log('fileInfo.file_id', fileInfo.file_id);
                    formData.append('file_id', fileInfo.file_id);
                }
            }
            uploadAuthFile(`${baseUrl}/wp-json/video-ai-chatbot/v1/upload-file/`, token, formData).then(data => {
                console.log('data', data);
                if(data) {
                    if(data.error) {
                        setMessage(`Error: ${data.error} message: ${data.message}`);
                        bus.emit('uploaded_file_id', null);
                        setError('Error uploading file');  
                    } else {
                        bus.emit('uploaded_file_id', data.file_id);
                        setMessage(`File uploaded successfully. File ID: ${data.file_id}`);
                        setFileInfo({...fileInfo, file_id: data.file_id});
                    }
                } 
                setIsLoading(false);
            }).catch(error => {
                console.log('error', error);
                setError('Error uploading file');
                setIsLoading(false);
                setMessage(`Error: ${error} message: ${error}`);
                setIsEditing(false);
                bus.emit('uploaded_file_id', null);
                mutate();
            });
        } else {
            setMessage('No changes to upload');
            setIsLoading(false);
            bus.emit('uploaded_file_id', fileInfo.file_id === '' ? null : fileInfo.file_id);
        }
    }, [fileInfo, baseUrl, token]);



    const handleFileChange = (event) => {
        console.log(event.target.files);
        const file = event.target.files[0];
        const fileReader = new FileReader();
        fileReader.readAsText(file, "UTF-8");
        fileReader.onload = e => {
            const fileData = {
                file_name: file.name,
                file_text: e.target.result
            }
            console.log('before', fileData);
            setFileInfo({...fileInfo, file_text: fileData.file_text, file_name: fileData.file_name});
            setIsEditing(true);
            console.log('after', fileData);
        };
    };

    return ( 
        <>
            <FormFileUpload
                accept="application/JSON, text/*"
                onChange={ handleFileChange } 
                render={ ( { openFileDialog } ) => (
                    <div>
                        <Button variant="secondary" onClick={ openFileDialog }>
                            Scegli file
                        </Button>
                    </div>
                )}
            >
                { __( 'Carica file', 'video-ai-chatbot') }
            </FormFileUpload>
            {message && <p className='text-black'>{message}</p>}
            {!isLoading && !getFileLoading &&
                <AssistantFileForm file_name={fileInfo.file_name} 
                            file_text={fileInfo.file_text} 
                            editable={true} 
                            onFileTextChange={(text) => { 
                                setIsEditing(true);
                                setFileInfo({...fileInfo, file_text: text}) 
                            }}/>
            }
            { (isLoading || getFileLoading) && <Spinner style={{ height: 'calc(4px * 20)', width: 'calc(4px * 20)' }} /> }
            
        </>
    );
};

UploadAssistantFile.propTypes = {
    shouldUpload: PropTypes.bool.isRequired,
    onUploadFinished: PropTypes.func.isRequired,
    fileName: PropTypes.string,
    fileText: PropTypes.string
  };

export default UploadAssistantFile;