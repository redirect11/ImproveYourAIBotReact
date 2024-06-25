import { Panel, PanelBody, PanelRow } from '@wordpress/components';
import React, { useEffect, useState, useMemo } from 'react';
import { Button, TextControl, TextareaControl } from '@wordpress/components';
import { FormFileUpload } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import TranscriptionsDataView from './TranscriptionsDataView';
import useUploadTranscription from '../../hooks/useUploadTranscription';


const UploadButton = ( { onClick } ) => {
    return (
        <Button variant="primary" onClick={ onClick } __next40pxDefaultSize>
            { __( 'Upload', 'video-ai-chatbot' ) }
        </Button>
    );
};

const Result = ({ status }) => {
    console.log('Result', status);
        if (status === "success") {
            return <p>✅ Files uploaded successfully!</p>;
        } else if (status === "fail") {
            return <p>❌ Files upload failed!</p>;
        } else if (status === "uploading") {
            return <p>⏳ Uploading files...</p>;
        } else {
            return null;
        }
};

const UploadTranscriptions = () => {

    console.log('Start rendering UploadTranscriptions');
    const [files, setFiles] = useState([]);
    const [allTranscriptions, setAllTranscriptions] = useState([]);
    const [uploadCounter, setUploadCounter] = useState(0);
    const {data, error, isLoading, startUpload} = useUploadTranscription();
    console.log('useUploadTranscription', data, error, isLoading);

    const isUploading = () => {
        return isLoading || (uploadCounter > 0 && (uploadCounter < allTranscriptions.length - 1));
    }

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

    let status = getStatus();

    //const setTranscriptionUploaded = (transcription) => {

    useEffect(() => {
        console.log('useEffect data error isLoading', data, error, isLoading);
        if((data && data.error) || error) {
            console.log('Received data and counter is out of range', uploadCounter);

        } else if(data) {
            if( uploadCounter < allTranscriptions.length - 1) {
                console.log('Received data and counter is in range', uploadCounter);
                setUploadCounter(uploadCounter + 1);
                const updatedTranscriptions = allTranscriptions.map(transcription => {
                    if(transcription.file_id === allTranscriptions[uploadCounter].file_id) {
                        return {...transcription, uploaded: true};
                    }
                    return transcription;
                });
                setAllTranscriptions(updatedTranscriptions);
            } else if (uploadCounter === allTranscriptions.length - 1) {
                console.log('Received data and counter is out of range', uploadCounter);
                const updatedTranscriptions = allTranscriptions.map(transcription => {
                    if(transcription.file_id === allTranscriptions[uploadCounter].file_id) {
                        return {...transcription, uploaded: true};
                    }
                    return transcription;
                });
                setAllTranscriptions(updatedTranscriptions);
            }
            console.log('useEffect data error isLoading EXIT', data, error, isLoading);
        }

    }, [data,error]);

    useEffect(() => {
        console.log('useEffect uploadCounter', uploadCounter);
        if(uploadCounter > 0 && uploadCounter < allTranscriptions.length) {
            startUpload(allTranscriptions[uploadCounter]);
        } 
        console.log('useEffect uploadCounter EXIT', uploadCounter);
    }, [uploadCounter]);


    const handleFileChange = (event) => {
        console.log(event.target.files);
        setFiles(event.target.files);

        const transcriptionSize = allTranscriptions.length;

        for (let i = 0; i < event.target.files.length; i++) {
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
        }
    };        

    const handleUpload = async () => {
        // if (!files || files.length === 0) {
        //     setMessage('Please select a file and enter an assistant ID.');
        //     return;
        // }
        console.log('setUploadCounter');
        if(allTranscriptions[uploadCounter]) {
            setUploadCounter(0);
            const updatedTranscriptions = allTranscriptions.map(transcription => {
                return {...transcription, uploaded: false};
            });
            setAllTranscriptions(updatedTranscriptions);
            startUpload(allTranscriptions[0]);
        }
    };
    
    const handleSaveTranscription = (newTranscription) => {
        console.log('handleSaveTranscription', newTranscription, newTranscription.file_id);
        const updatedTranscriptions = allTranscriptions.map(transcription => {
            console.log('transcription.file_id', transcription.file_id);
            if(transcription.file_id === newTranscription.file_id) {
                return newTranscription;
            } 
            return transcription;
        });
      
        setAllTranscriptions(updatedTranscriptions);
        //setMessage('Transcription saved successfully.');
    };

    const handleDeleteTranscription = (file_id) => {
        const updatedTranscriptions = allTranscriptions.filter(transcription => transcription.file_id !== file_id);
        setAllTranscriptions(updatedTranscriptions);
    };

    console.log('End rendering UploadTranscriptions');

    return ( 
        <div>
            <Panel>
                <PanelBody>
                    <h3>Carica Trascrizioni</h3>
                    <FormFileUpload
                        multiple={true}
                        accept="application/JSON"
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
                    {files && files.length > 0 && 
                        <> 
                            <TranscriptionsDataView 
                                transcriptions={allTranscriptions} 
                                onSavingTranscription={handleSaveTranscription} 
                                onDeletingTranscription={handleDeleteTranscription} 
                            />
                            <UploadButton onClick={  handleUpload  } />
                            { status !== "" && <Result status={status} /> }
                            
                        </>
                    }
                </PanelBody>
            </Panel>
        </div>
    );
};

export default UploadTranscriptions;