import React, { useEffect, useRef } from 'react';
import { TextControl, TextareaControl, Disabled } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const WithDisabled = ({ disabled, children }) => {
    if(disabled) {
        return (
            <Disabled 
            style={ { opacity: 0.5 } }>
                    {children}
            </Disabled>
        );
    }
    return children;    
}

const AssistantFileForm = ({ file_name, file_text, editable, onFileTextChange }) => {

    // const textareaRef = useRef();

    // useEffect(() => {
    //     if (textareaRef.current) {
    //         textareaRef.current.style.height = 'auto';
    //         textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    //     }
    // }, [file_text]);

    const handleTextChange = (value) => {
        if(editable && onFileTextChange) {
            onFileTextChange(value);
        }
    }

    return ( 
        <>
            <Disabled>
                <TextControl
                    label="File Name"
                    value={file_name} 
                    style={ { opacity: 0.5 } }/>
            </Disabled>
            <br />
            <WithDisabled disabled={!editable}>
                <TextareaControl
                    label="File Content"
                    //ref={textareaRef}
                    value={file_text}
                    onChange={(value) => handleTextChange(value)}
                    rows={20}/>
                    
            </WithDisabled>                                
        </>
    );
};

export default AssistantFileForm;