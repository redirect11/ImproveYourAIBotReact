import React, { useState } from 'react';
import { Button } from '@wordpress/components';
import { CircularProgress } from '@material-ui/core';
import { useDispatch as useDispatchWordpress } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import useAuth from '../hooks/useAuth';



const RemoteOperationButton = ({callback, buttonText}) => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const {token, baseUrl} = useAuth();

    const {createErrorNotice, createSuccessNotice} = useDispatchWordpress(noticesStore);

    const onError = (error) => {
        setError(error);
        setLoading(false);
        createErrorNotice('Errore durante l\'operazione remota');
    }

    const onSuccess = (data) => {
        setLoading(false);
        createSuccessNotice('Operazione remota completata con successo');

    }

    const handleClick = () => {
        setLoading(true);
        callback(onError, onSuccess, token, baseUrl);
    }


    return (
        <>
            <Button variant='primary' onClick={handleClick}>
                {buttonText}
            </Button>
            {loading && <CircularProgress size="5rem" color="inherit"/>}
        </>
    );
}

export default RemoteOperationButton;