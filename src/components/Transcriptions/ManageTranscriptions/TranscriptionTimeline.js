import { Timeline, TimelineItem } from 'vertical-timeline-component-for-react';
import React, { useState, useEffect } from 'react';
import { TextControl, TextareaControl, Disabled } from '@wordpress/components';
import './TranscriptionTimeline.css';
import { size } from 'lodash';

const TranscriptionTimeline = ({ transcriptionData, onTextChanged }) => {
    const [transcriptions, setTranscriptions] = useState([]);

    console.log('transcriptionData', transcriptionData);

    useEffect(() => {
        console.log('transcriptionData changed', transcriptionData);
        if (transcriptionData && transcriptionData.transcription) {
            setTranscriptions([...transcriptionData.transcription]);
        }
    }, [transcriptionData]);

    const onTextChange = (index, text) => {
        console.log('onTextChange', index, text);
        const updatedTranscriptions = JSON.parse(JSON.stringify(transcriptions));
        updatedTranscriptions[index].text = text;
        const fullText = concatTranscriptions(updatedTranscriptions);
        const newTranscriptionData = { ...transcriptionData, transcription: updatedTranscriptions, videoText: fullText};
        setTranscriptions(newTranscriptionData.transcription);
        onTextChanged(newTranscriptionData);
    }

    const concatTranscriptions = (newTranscriptions) => {
        let fullText = '';
        if (newTranscriptions) {
            newTranscriptions.forEach(transcription => {
                fullText += transcription.text;
            });
        }
        //transcriptionData.videoText = fullText;
        return fullText;
    }

    const truncateText = (text) => {
        return text.substring(0, text.length -4);
    }

    return (
        <>
            <Timeline lineColor={'#ddd'} className="relative block">
                {transcriptions.map((transcription, index) => (
                    <TimelineItem
                        key={index}
                        dateText={`${truncateText(transcription.timestamps.from)} – ${truncateText(transcription.timestamps.to)}`}
                        style={{ color: '#e86971' }} 
                        dateInnerStyle={{ background: '#61b8ff', color: '#000', fontSize: '0.75rem', fontWeight: 'normal'}}
                        className="text-sm"
                        bodyContainerStyle={{
                            background: '#ddd',
                            padding: '2px',
                            borderRadius: '8px',
                            boxShadow: '0.5rem 0.5rem 2rem 0 rgba(0, 0, 0, 0.2)',
                        }}
                        // dateComponent={(
                        //     <div
                        //       style={{
                        //         display: 'block',
                        //         float: 'left',
                        //         padding: '10px',
                        //         background: 'rgb(150, 150, 150)',
                        //         color: '#fff',
                        //       }}
                        //     >
                        //       {`${truncateText(transcription.timestamps.from)} – ${truncateText(transcription.timestamps.to)}`}
                        //     </div>
                        //   )}
                    >
                        <TextareaControl
                            className="textarea-xs leading-snug"
                            value={transcription.text}
                            onChange={(value) => onTextChange(index, value)}/>
                    </TimelineItem>
                ))}
            </Timeline>
        </>
    );
};

export default TranscriptionTimeline;