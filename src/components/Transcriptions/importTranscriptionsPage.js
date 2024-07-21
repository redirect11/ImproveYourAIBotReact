import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import  UploadTranscriptions  from './UploadTranscriptions';
import '../dataview.css';
import { setTitle } from '../../redux/slices/HeaderTitleSlice';
import useTranscriptions from '../../hooks/useTranscriptions';

const ImportTranscriptionsPage = () => {

    const dispatch = useDispatch();

    const { mutate: mutateTranscriptions } = useTranscriptions();

    useEffect(() => {
        // Aggiorna il titolo della pagina
        dispatch(setTitle('Importa Trascrizioni'));
    }, []);
        
    return (<UploadTranscriptions mutateTranscriptions={mutateTranscriptions} />);
};

export default ImportTranscriptionsPage;