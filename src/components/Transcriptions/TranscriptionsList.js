import React, { useEffect, useState, useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import { Panel, PanelBody } from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import '../dataview.css';
import { ExternalLink } from '@wordpress/components';
import ManageTranscription from './ManageTranscriptions/ManageTranscription';
import { ConfirmDeleteTranscription } from '../ConfirmDelete';

const paginateArray = (array, page, perPage) => {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    return array.slice(startIndex, endIndex);
};

const TranscriptionsList = ( { transcriptions, onSavingTranscription, onDeletingTranscription }) => {

    const [ view, setView ] = useState( {
        type: 'list',
        perPage: 10,
        page: 1,
        sort: {},
        search: '',
        // filters: [
        //     { field: 'author', operator: 'is', value: 2 },
        //     { field: 'status', operator: 'isAny', value: [ 'publish', 'draft' ] }
        // ],
        hiddenFields: [],
        layout: {
            primaryField: 'videoTitle',
        },
    } );

    const [ selectedTranscription, setSelectedTranscription ] = useState(null);
    const [ paginatedTranscriptions, setPaginatedTranscriptions ] = useState(paginateArray(transcriptions, view.page, view.perPage));

    useEffect(() => {
        setPaginatedTranscriptions(paginateArray([...transcriptions], view.page, view.perPage));
    }, [transcriptions]);

    const paginationInfo = {
        totalItems: transcriptions.length,
        totalPages: Math.ceil(transcriptions.length / view.perPage)
    }
    
    const handleConfirmDelete = async (file_id, closeModal) => {
        onDeletingTranscription(file_id);
        closeModal();
    };

    const handleCancelDelete = (closeModal) => {
        //setFileNameToDelete(null);
        closeModal();
    };

    const handleSaveTranscription = (transcription) => {
        setSelectedTranscription(transcription);
        onSavingTranscription(transcription);
    };

    const actions=[
        {
          RenderModal: (item) => { 
            console.log('item:', item);
            return <ConfirmDeleteTranscription fileName={item.items[0].file_id} onConfirm={handleConfirmDelete} onCancel={handleCancelDelete} closeModal={item.closeModal} /> 
          },
          hideModalHeader: true,
          icon: <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd" d="M12 5.5A2.25 2.25 0 0 0 9.878 7h4.244A2.251 2.251 0 0 0 12 5.5ZM12 4a3.751 3.751 0 0 0-3.675 3H5v1.5h1.27l.818 8.997a2.75 2.75 0 0 0 2.739 2.501h4.347a2.75 2.75 0 0 0 2.738-2.5L17.73 8.5H19V7h-3.325A3.751 3.751 0 0 0 12 4Zm4.224 4.5H7.776l.806 8.861a1.25 1.25 0 0 0 1.245 1.137h4.347a1.25 1.25 0 0 0 1.245-1.137l.805-8.861Z" fillRule="evenodd"/></svg>,
          id: 'delete',
          isPrimary: true,
          label: 'Delete item'
        }
    ];

    const fields = [
        {
            id: 'videoTitle',
            header: 'Nome',
            enableHiding: false,
            render: ( { item } ) => {
                if(item.transcription !== null) {
                    return (
                        <>{ item.transcription.videoTitle }</>
                    );
                }
                else {
                    return (
                        <div>Non disponibile</div>
                    );
                }
            }
        },
        {
            id: 'videoHrefLink',
            header: 'Link',
            render: ( { item } ) => {
                if(item.transcription !== null) {
                    return (
                        <> { !item.transcription.videoHrefLink && <div className="badge badge-xs badge-error gap-1">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                className="inline-block h-3 w-3 stroke-current">
                                <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                            <div className="text-xs">No Link</div>
                            </div>}
                            <ExternalLink href={item.transcription.videoHrefLink} target="_blank">
                                {item.transcription.videoHrefLink}
                            </ExternalLink>
                        </>

                    );
                } else {
                    return (
                        <div>Non disponibile</div>
                    );
                }
            }
        }
    ] 

    const onViewChanged = (view) => {
        console.log('view changed', view);
        if(transcriptions.length > 0) {
            setPaginatedTranscriptions(paginateArray(transcriptions, view.page, view.perPage));
        }
        setView(view);
    };


    const geItemId = (item) => {
        return item.file_id;
    }

    return (
        <div className='fixed w-[calc(100%-12rem)] flex flex-row h-[92%] overflow-y-auto'>  
            <Panel header="Lista delle trascrizioni" className='flex-initial w-[20rem] h-full overflow-y-scroll mr-1'>
                 <PanelBody>
                    <DataViews
                        data={ paginatedTranscriptions }
                        fields={ fields }
                        view={ view }
                        onChangeView={ onViewChanged }
                        paginationInfo={ paginationInfo }
                        getItemId={ geItemId }
                        actions = {actions}
                        onSelectionChange={(items) => setSelectedTranscription(items[0])}
                    />
                </PanelBody>
            </Panel>
            <div className='relative flex flex-grow flex-1 flex-row h-7/12 w-full ml-1 max-h-full'>
                <ManageTranscription 
                    key={selectedTranscription?.file_id}
                    selectedTranscription={selectedTranscription} 
                    onTranscriptionSave={handleSaveTranscription}
                />
            </div>
        </div>
    );
};

export default TranscriptionsList;