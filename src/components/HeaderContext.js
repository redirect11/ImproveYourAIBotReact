// HeaderContext.js
import React, { createContext, useContext, useState } from 'react';

const HeaderContext = createContext();

export const useHeader = () => useContext(HeaderContext);

export const HeaderProvider = ({ children }) => {
    const [headerButtons, setHeaderButtons] = useState([]);
    const [transcriptionsUploadStatus, setTranscriptionsUploadStatus] = useState("");

    const addButton = (button) => {
        setHeaderButtons((prevButtons) => {
            const existingButton = prevButtons.find(b => b.label === button.label);
            if (existingButton) {
                return prevButtons.map(b => b.label === button.label ? { ...b, ...button, visible: true } : b);
            }
            return [...prevButtons, { ...button, visible: true }];
        });
    };

    const hideButton = (label) => {
        setHeaderButtons((prevButtons) =>
            prevButtons.map(b => b.label === label ? { ...b, visible: false } : b)
        );
    };

    const updateTranscriptionsUploadStatus = (status) => {
        setTranscriptionsUploadStatus(status);
    };

    return (
        <HeaderContext.Provider value={{ 
                headerButtons, 
                transcriptionsUploadStatus, 
                addButton, 
                hideButton, 
                updateTranscriptionsUploadStatus 
            }}>
            {children}
        </HeaderContext.Provider>
    );
};