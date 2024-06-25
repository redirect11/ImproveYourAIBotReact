import React, { useEffect, useMemo, useState } from 'react';
import { CheckboxControl } from '@wordpress/components';
import './AssistantsGrid.css';

const AssistantsGrid = ({transcription, onTranscriptionUpdated}) => {

    const assistants = useMemo(() => {
        console.log('window.adminData', window.adminData);
        let assistants = window.adminData.assistants ? window.adminData.assistants.data.data : [];
        return assistants.filter((assistant) => assistant.metadata.type === 'trascrizioni');
    }, [transcription]);

    const [isChecked, setIsChecked] = useState([]);

    console.log('AssistantGrid');

    useEffect(() => {
        console.log('transcription changed', transcription);
        if (transcription.assistant_id && assistants.length > 0) {
            setIsChecked(assistants.map((assistant) => transcription.assistant_id.includes(assistant.id)));
        } else if(assistants.length > 0) {
            setIsChecked(assistants.map(() => false));
        }
    }, [transcription]);

    const handleCheck = (checked, assistant_id) => {
        console.log('assistant', assistant_id);
        console.log('checked', checked);
        let tempTranscription = { ...transcription };
        if(checked && transcription.assistant_id) {
            if (!tempTranscription.assistant_id.includes(assistant_id)) {
                tempTranscription = { ...transcription, assistant_id: [...transcription.assistant_id, assistant_id ]};
            } else {
                console.log("This item already exists");
            }
        } else if(checked) {	
            console.log('CHECKED ONLY');
            tempTranscription = { ...transcription, assistant_id: [assistant_id] };
        } else if(transcription.assistant_id){
            tempTranscription = { ...transcription, assistant_id: transcription.assistant_id.filter((el) => el !== assistant_id)};
            console.log('tempTranscription', tempTranscription);
        }
        const updatedTranscription = { ...tempTranscription };
        console.log('updatedTranscription', updatedTranscription);
        onTranscriptionUpdated(updatedTranscription);
    }

    const check = (assistant_id, index) => (e) => {
        handleCheck(e, assistant_id);
        setIsChecked((isChecked) =>
          isChecked.map((el, i) => (i === index ? e : el))
        );
      };


    return (
        <div className='assistants-list'>
            {assistants && assistants.map((assistant, i) => (
                <CheckboxControl 
                    key={assistant.id}
                    className='assistant' 
                    label={assistant.name} 
                    checked={ isChecked[i] }
                    onChange={check(assistant.id, i)} 
                />
            ))}
        </div>
    );
}

export default AssistantsGrid;