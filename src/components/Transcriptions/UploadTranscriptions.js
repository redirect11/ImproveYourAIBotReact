import { Panel, PanelBody} from '@wordpress/components';
import React, { useEffect, useRef, useState, forwardRef } from 'react';
import { Button } from '@wordpress/components';
import { FormFileUpload } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import TranscriptionsDataView from './TranscriptionsDataView';
import useUploadTranscription from '../../hooks/useUploadTranscription';
import { useDispatch as useDispatchWordpress } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { useHeader } from '../HeaderContext';


const UploadButton = ( { onClick } ) => {
    return (
        <Button variant="primary" onClick={ onClick } __next40pxDefaultSize>
            { __( 'Upload', 'video-ai-chatbot' ) }
        </Button>
    );
};

const UploadTranscriptions = ( { mutateTranscriptions }) => {
    const { createSuccessNotice, createErrorNotice } = useDispatchWordpress( noticesStore );
    const [files, setFiles] = useState([]);
    const [allTranscriptions, setAllTranscriptions] = useState([]);
    const [uploadCounter, setUploadCounter] = useState(0);
    const {data, error, isLoading, startUpload} = useUploadTranscription();
    
    const { addButton, hideButton, updateTranscriptionsUploadStatus } = useHeader();
    
    const uploadButtonClickRef = useRef(null);
    const addFilesButtonClickRef = useRef(null);

    const isUploading = () => {
        return isLoading || (uploadCounter > 0 && (uploadCounter < allTranscriptions.length));
    }

    useEffect(() => {
        let uploadButtonClassName = "btn btn-sm btn-accent btn-outline mx-1"
        if(isUploading()) {
            uploadButtonClassName = "btn btn-sm btn-disabled mx-1 text-gray-500";
        }
        console.log("uploadButtonClassName", uploadButtonClassName);
        uploadButtonClickRef.current =  handleUpload;
        const button = {
            id: 'upload',
            label: 'Upload di tutte le trascrizioni',
            className: uploadButtonClassName,
            onClick: uploadButtonClickRef.current
        };
        const addFilesButton = {
            label: 'Aggiungi altri file',
            className: "btn btn-sm btn-accent btn-outline mx-1",
            onClick: () => { addFilesButtonClickRef.current.click() }
        };
        if(allTranscriptions && allTranscriptions.length > 0) {
            addButton(button);
            addButton(addFilesButton);
        } 
        return () => {
            hideButton(button.label);
            hideButton(addFilesButton.label);
        };
    }, [allTranscriptions, uploadCounter. data, error, mutateTranscriptions, files]);


    const getStatus = () => {
        if(isUploading()) {
            return "uploading";
        } else if((data && data.error) || error) {
            return "fail";
        } else if(uploadCounter > 0 && !isUploading()) {
            return "success";
        }
        return "";
    };

    //updateTranscriptionsUploadStatus(getStatus());

    useEffect(() => {
        if((data && data.error) || error) {
            createErrorNotice('Error: ' + (data ? data.error : error.message));
        } else if(data) {
            if( uploadCounter <= allTranscriptions.length - 1) {
                const updatedTranscriptions = allTranscriptions.map(transcription => {
                    if(transcription.file_id === allTranscriptions[uploadCounter].file_id) {
                        return {...transcription, uploaded: true};
                    }
                    return transcription;
                });
                setAllTranscriptions(updatedTranscriptions);
                setUploadCounter(uploadCounter + 1);
            } 
            createSuccessNotice('Trascrizione caricata');
        }

    }, [data,error]);

    useEffect(() => {
        if(uploadCounter > 0 && uploadCounter < allTranscriptions.length) {
            startUpload(allTranscriptions[uploadCounter]);
        } else if(uploadCounter === allTranscriptions.length && allTranscriptions.length > 0) {
            createSuccessNotice('Tutte le trascrizioni caricate.');
            mutateTranscriptions();
        }
        updateTranscriptionsUploadStatus(getStatus());
    }, [uploadCounter]);


    const handleFileChange = (event) => {
        setFiles(event.target.files);

        const transcriptionSize = allTranscriptions.length;

        for (let i = 0; i < event.target.files.length; i++) {
            try {
                const file = event.target.files[i];
                const fileReader = new FileReader();
                fileReader.readAsText(file, "UTF-8");
                fileReader.onload = e => {
                    const fullTranscription = {
                        file_name: file.name,
                        transcription: JSON.parse(e.target.result),
                        file_id: transcriptionSize + i + 1,
                        assistant_id: [],
                        assistant_name: null,
                        uploaded: false,
                    };

                    setAllTranscriptions(prevTranscriptions => [...prevTranscriptions, fullTranscription]);
                };
            } catch (error) {
                createErrorNotice('Error: ' + error.message);
            }
        }
    };        

    const handleUpload = async () => {
        if(!isUploading()) {
            setUploadCounter(0);
            const updatedTranscriptions = allTranscriptions.map(transcription => {
                return {...transcription, uploaded: false};
            });
            setAllTranscriptions(updatedTranscriptions);
            startUpload(allTranscriptions[0]);
            updateTranscriptionsUploadStatus('uploading');
        }
    };

    // const handleAddOtherFiles = () => {
    //     inputFileRef.current.click();
    // };
    
    const handleSaveTranscription = (newTranscription) => {
        const updatedTranscriptions = allTranscriptions.map(transcription => {
            if(transcription.file_id === newTranscription.file_id) {
                return newTranscription;
            } 
            return transcription;
        });
      
        setAllTranscriptions(updatedTranscriptions);
    };

    const handleDeleteTranscription = (file_id) => {
        const updatedTranscriptions = allTranscriptions.filter(transcription => transcription.file_id !== file_id);
        setAllTranscriptions(updatedTranscriptions);
    };


    return ( 
        <>
            {!files || files.length === 0 &&
            <div className="flex justify-center items-center w-full h-full">
                <div className="bg-white p-6 rounded-lg shadow-lg text-center flex-1 flex-shrink mx-2 max-w-[97%] max-h-[97%]">
                    <h2 className="mb-4 text-xl font-semibold text-gray-700">Scegli le trascrizioni da caricare</h2>
                    <label className="inline-block mb-2 text-gray-500">File Upload</label>
                    <div className="flex justify-center items-center w-full">
                        <label className="flex flex-col w-full h-32 border-4 border-dashed hover:bg-gray-100 hover:border-gray-300 rounded-md">
                        <div className="flex flex-col items-center justify-center pt-7">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V8m4 8V8m4 8V8M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">Seleziona un file</p>
                        </div>
                        <input 
                            type="file" 
                            hidden id="file"                         
                            className="opacity-0" 
                            multiple 
                            ref={addFilesButtonClickRef}
                            onChange={ handleFileChange } 
                            onClick={(event) => { event.target.value = null; }}
                            accept="application/JSON" /> 
                        </label>
                    </div>
                </div>
            </div>}

            {files && files.length > 0 && 
                <div className="relative flex flex-col h-fit w-full justify-center">
                    <TranscriptionsDataView 
                        transcriptions={allTranscriptions} 
                        onSavingTranscription={handleSaveTranscription} 
                        onDeletingTranscription={handleDeleteTranscription} 
                    />
                    <input 
                        type="file" 
                        hidden id="otherFile" 
                        className="opacity-0" 
                        multiple 
                        ref={addFilesButtonClickRef}
                        onChange={ handleFileChange } 
                        onClick={(event) => { event.target.value = null; }}
                        accept="application/JSON" />
                </div>
            }
        </>
    );
};

export default UploadTranscriptions;