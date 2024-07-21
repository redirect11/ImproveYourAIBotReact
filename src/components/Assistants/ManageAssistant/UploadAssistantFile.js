import React, { useEffect, useState } from 'react';
import { Button, Spinner } from '@wordpress/components';
import { FormFileUpload } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import AssistantFileForm from './AssistantFileForm';
import PropTypes from 'prop-types';
import useUploadFile from '../../../hooks/useUploadFile';
import FetchableAssistantFileForm from './FetchableAssistantFileForm';
import { useSelector } from 'react-redux';

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

const UploadAssistantFile = ({ assistant, shouldUpload, onUploadFinished }) => {

    const [fileInfo, setFileInfo] = useState({file_id: '', file_name: '', file_text: ''});
    const [dataChanged, setDataChanged] = useState(false);

    const checkCanUpload = () => {
        return shouldUpload && dataChanged;
    }

    const {data, error, isLoading} = useUploadFile({ file: fileInfo, shouldUpload: checkCanUpload() });

    let vector_store_ids = [];
    if(assistant && assistant.tool_resources && assistant.tool_resources.file_search && assistant.tool_resources.file_search.vector_store_ids) {
        vector_store_ids = assistant.tool_resources.file_search.vector_store_ids;           
        console.log('vector_store_ids', vector_store_ids);
    }

    let message = '';

    useEffect(() => {
        if(shouldUpload && !dataChanged) {
                onUploadFinished(null);
        }
    }, [shouldUpload, dataChanged]);

    if(data) {
        if(data.error) {
            message = `Error: ${data.error} message: ${data.message}`;
        } else {
            message = `File uploaded successfully. File ID: ${data.file_id}`;
        }
    } else if(error){
        message = `Error: ${error}`;
    }

    useEffect(() => {
        if(data){
            if(data.error) {
                onUploadFinished(null);
                return;
            } else {
                onUploadFinished(data.file_id);
            }
            setFileInfo({file_name: '', file_text: ''}); 
        } else if(error){
            onUploadFinished(null);
            setFileInfo({file_name: '', file_text: ''});
        }
    }, [data, error, isLoading]);


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
            setFileInfo(fileData)
            setDataChanged(true);
            console.log('after', fileData);
        };
    };

    return ( 
        <>
            <h3>Carica File Preventivi</h3>
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
                { __( 'Carica trascrizione', 'video-ai-chatbot') }
            </FormFileUpload>
            { !assistant && !isLoading &&
                <AssistantFileForm file_name={fileInfo.file_name} 
                               file_text={fileInfo.file_text} 
                               editable={true} 
                               onFileTextChange={(text) => { setFileInfo({...fileInfo, file_text: text}) }}/>
            } 
            { assistant && !isLoading && 
                <FetchableAssistantFileForm vector_stores_ids={vector_store_ids} 
                                            file_name={fileInfo.file_name} 
                                            file_text={fileInfo.file_text} 
                                            editable={true} 
                                            onFileDataFetched={(name, text, id) => { setFileInfo({file_id: id, file_name: name, file_text: text}) }}
                                            onFileTextChange={ (text) => { 
                                                console.log('text', text);
                                                setFileInfo({...fileInfo, file_text: text});
                                                setDataChanged(true);
                                            } } />
            }

            { isLoading ?  <Spinner style={{ height: 'calc(4px * 20)', width: 'calc(4px * 20)' }} /> :
                <>
                    { error ? <Result status="fail" /> : <Result status={data ? "success" : (isLoading ? "uploading" : "")} /> } 
                </>
            }
            {message && <p>{message}</p>}
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