import useSWR from 'swr'
import { getFetcher } from './fetcher';
import { useState } from 'react';

const useDeleteUnusedVectorStores = () => {

    console.log('useDeleteUnusedVectorStores');

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

    const { data, error, isLoading } = useSWR(  started ? [
                                                `/wp-json/video-ai-chatbot/v1/delete-unused-vector-stores` , 
                                                window.adminData.nonce
                                                ] : null, 
                                                ([url, token]) => getFetcher(url, token),
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