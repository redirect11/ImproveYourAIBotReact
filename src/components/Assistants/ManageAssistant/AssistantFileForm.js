import React, { useEffect, useRef } from 'react';
import { TextControl, TextareaControl, Disabled } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

// const WithDisabled = ({ disabled, children }) => {
//     if(disabled) {
//         return (
//             <Disabled 
//             style={ { opacity: 0.5 } }>
//                     {children}
//             </Disabled>
//         );
//     }
//     return children;    
// }

const AssistantFileForm = ({ file_name, file_text, editable, onFileTextChange }) => {

    const handleTextChange = (value) => {
        if(editable && onFileTextChange) {
            console.log('AssistantFileForm - handleTextChange', value);
            onFileTextChange(value);
        }
    }

    return ( 
        <>
            <Disabled>
                <TextControl
                    label="File Name"
                    className="text-black"
                    value={file_name} 
                    style={ { opacity: 0.5 } }/>
            </Disabled>
            <br />
            <TextareaControl
                label="File Content"
                className="text-black"
                value={file_text}
                onChange={handleTextChange}
                rows={20}
                readOnly={!editable}/>                             
        </>
    );
};

export default AssistantFileForm;