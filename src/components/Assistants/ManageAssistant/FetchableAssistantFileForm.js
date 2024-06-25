import React, { useEffect } from "react";
import useFetchVectorStoreFiles from "../../../hooks/useFetchVectorStoreFiles";
import { Spinner } from "@wordpress/components";
import AssistantFileForm from "./AssistantFileForm";

const FetchableAssistantFileForm = (props) => {
    const { vector_stores_ids, onFileDataFetched } = props;
    const { file_name, file_content, file_id, error, isLoading} = useFetchVectorStoreFiles(vector_stores_ids);

    useEffect(() => {
        console.log('FetchableAssistantFileForm', file_name, file_content, file_id);
        if(file_name && file_content && file_id){
            onFileDataFetched(file_name, file_content, file_id);
        } else {
            onFileDataFetched('', '', '');
        }
    }, [file_name, file_content, file_id]);

    return ( 
        <>
            { isLoading ?  <Spinner style={{ height: 'calc(4px * 20)', width: 'calc(4px * 20)' }} /> :
            <>
                { error ? <div>There was an error fetching the file</div> :
                    <AssistantFileForm {...props} />    
                }                         
            </>
            }
        </>
    );
}

export default FetchableAssistantFileForm;