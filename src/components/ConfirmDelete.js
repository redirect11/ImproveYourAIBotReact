import React from 'react';

export const ConfirmDeleteTranscription = ({ fileName, onConfirm, onCancel, closeModal }) => {
    return (
        <div>
            <p>Sei sicuro di voler cancellare la trascrizione {fileName}?</p>
            <button onClick={() => onConfirm(fileName, closeModal)}>Sì</button>
            <button onClick={() => onCancel(closeModal)}>No</button>
        </div>
    );
};

export const ConfirmDeleteAssistant = ({ assistant, onConfirm, onCancel, closeModal }) => {
    console.log('assistant:', assistant);
    return (
        <div>
            <p>Sei sicuro di voler cancellare l'assistente {assistant.name}?</p>
            <button className="btn" onClick={() => onConfirm(assistant.id, closeModal)}>Sì</button>
            <button className="btn right-0" onClick={() => onCancel(closeModal)}>No</button>
        </div>
    );
};
