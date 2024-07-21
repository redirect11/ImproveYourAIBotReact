import useSWR from 'swr'
import { getAuthFetcher } from './fetcher';
import { useState } from 'react';
import useAuth from './useAuth';
import { config } from '../Constants';

const useDeleteUnusedVectorStores = () => {

    console.log('useDeleteUnusedVectorStores');

    const {token, baseUrl} = useAuth();

    const [started, setStarted] = useState(false);

    // const onError = (error) => {
    //     console.log('error', error);
    // }

    const startDelete = () => {
        console.log('startDelete');
        setStarted(true);
    };

    const stop = (data) => {
        console.log('STOP', data);
        console.log('error', error);
        console.log('isLoading', isLoading);
        console.log('reset assistantId');
        setStarted(false);
    }

    const { data, error, isLoading } = useSWR(  started && token && baseUrl ? [
                                                `${baseUrl}/wp-json/video-ai-chatbot/v1/delete-unused-vector-stores` , 
                                                token
                                                ] : null, 
                                                ([url, token]) => getAuthFetcher(url, token),
                                                { onError: stop, onSuccess: stop }
                                            );
    if((data || error) && started) {
        console.log('GOT DATA', data);

        //setStarted(false);
    }

    return { 
            deleteVectorStores: startDelete,
            data: data,
            error: data && data.error ? data : error, 
            isLoading 
            };
}


export default useDeleteUnusedVectorStores;