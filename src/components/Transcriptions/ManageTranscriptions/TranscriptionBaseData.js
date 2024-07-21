import { PanelRow } from '@wordpress/components';
import React, { useEffect, useRef } from 'react';
import { TextControl, TextareaControl, Disabled } from '@wordpress/components';

const TranscriptionBaseData = ({ fileName, 
                                 fileText, 
                                 videoTitle, 
                                 videoLink, 
                                 onVideoTitleChanged, 
                                 onVideoLinkChanged  }) => {

    const textareaRef = useRef();

    useEffect(() => {
        console.log('fileText', fileText);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            let currentScrollHeight = textareaRef.current.scrollHeight >= 200 ? 200 : textareaRef.current.scrollHeight;
            textareaRef.current.style.height = currentScrollHeight + 'px';
        }
    }, [fileText]);


    return ( 
        <>
            <TextControl
                label="Video Title"
                value={videoTitle}
                onChange={onVideoTitleChanged}/>
            <TextControl
                label="Video Link"
                value={videoLink}
                onChange={onVideoLinkChanged}/>
            <Disabled> 
                <TextControl
                    label="File Name"
                    value={fileName} 
                    style={ { opacity: 0.5 } }/>
            </Disabled>
            <TextareaControl
                label="Transcription"
                ref={textareaRef}
                value={fileText}
                onChange={(value) => onTextChanged(value)}
                readOnly={true} />
        </>
    );
};

export default TranscriptionBaseData;