import React from 'react';

export const ConfirmDeleteTranscription = ({ fileName, onConfirm, onCancel, closeModal, videoTitle }) => {
    console.log('fileName:', fileName);
    console.log('videoTitle:', videoTitle);
    
    return (
        <div>
            <p>Sei sicuro di voler cancellare la trascrizione "{videoTitle}"?</p>
            <button className="btn btn-primary" 
                    onClick={() => { 
                        closeModal();
                        onConfirm(fileName, closeModal);
                    }}>Sì</button>
            <button className="btn btn-secondary mr-0" onClick={() => onCancel(closeModal)}>No</button>
        </div>
    );
};

export const ConfirmDeleteAssistant = ({ assistant, onConfirm, onCancel, closeModal }) => {
    console.log('assistant:', assistant);
    return (
        <div>
            <p>Sei sicuro di voler cancellare l'assistente "{assistant.name}"?</p>
            <button className="btn btn-primary" onClick={() => onConfirm(assistant.id, closeModal)}>Sì</button>
            <button className="btn btn-secondary mr-0" onClick={() => onCancel(closeModal)}>No</button>
        </div>
    );
};
