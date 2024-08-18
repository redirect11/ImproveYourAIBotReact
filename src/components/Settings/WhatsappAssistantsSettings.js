import React, { useEffect, useState } from 'react';
import useAssistants from '../../hooks/useAssistants';
import useBaseUrl from '../../hooks/useBaseUrl';
import { useDispatch as useDispatchWordpress } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices'; 

const WhatsappAssistantsSettings = ({ associations, handleChange }) => {
    console.log('intialAssociations', associations);

    const [assistant, setAssistant] = useState('');
    const [token, setToken] = useState('');
    const [outgoingNumberId, setOutgoingNumberId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showCode, setShowCode] = useState({});
    const { baseUrl } = useBaseUrl();
    const { createInfoNotice } = useDispatchWordpress( noticesStore );
    console.log('associations', associations);

    // Esempio di lista di assistenti ottenuta con l'hook useAssistants
    const { data: assistants } = useAssistants();

    const generateKey = (token) => {
        let hash = 0;
        for (let i = 0; i < token.length; i++) {
            hash = (hash << 5) - hash + token.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash).toString().slice(0, 5).padStart(5, '0');
    };

    const addAssociation = () => {
        // Check if the assistant is already present
        const isAssistantPresent = associations.some((assoc) => assoc.assistant === assistant);
        if (isAssistantPresent) {
            // Handle the case when the assistant is already present
            setErrorMessage('L\'assistente è già associato ad un token');
            return;
        }

        // Check if there is another assistant with the same token and outgoingNumberId
        const isDuplicate = associations.some((assoc) => assoc.token === token && assoc.outgoingNumberId === outgoingNumberId);
        if (isDuplicate) {
            // Handle the case when there is a duplicate assistant
            setErrorMessage('Esiste già un assistente con lo stesso token e lo stesso phone ID');
            return;
        }

        handleChange('video_ai_whatsapp_assistants', [...associations, { assistant, token, outgoingNumberId }]);
        setAssistant('');
        setToken('');
        setOutgoingNumberId('');
        setErrorMessage('');
    };

    const removeAssociation = (index) => {
        const newAssociations = associations.filter((_, i) => i !== index);
        handleChange('video_ai_whatsapp_assistants', newAssociations);
    };

    const handleAssistantChange = (e) => {
        const selectedAssistant = assistants.find((assistant) => assistant.id === e.target.value );
        console.log('selectedAssistant', selectedAssistant);
        setAssistant(selectedAssistant.id);
        setErrorMessage('');

        // Check if the selected assistant is already present in the associations list
        const isAssistantPresent = associations.some((assoc) => assoc.assistant === selectedAssistant);
        if (isAssistantPresent) {
            setErrorMessage('L\'assistente è già associato ad un token');
        }
    };

    const getAssistantName = (assistantId) => {
        const assistant = assistants.find((assistant) => assistant.id === assistantId);
        console.log('assistant', assistant);
        return assistant ? assistant.name : '';
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            createInfoNotice('URL copiato nella clipboard');
        }, (err) => {
            console.error('Errore nel copiare il testo: ', err);
        });
    };

    const toggleShowCode = (index) => {
        setShowCode((prevShowCode) => ({
            ...prevShowCode,
            [index]: !prevShowCode[index],
        }));
    };

    const isAssistantPresent = Array.isArray(associations) ? associations.some((assoc) => assoc.assistant === assistant) : false;
    const isDisabled = isAssistantPresent && assistant !== '';

    console.log('assistants', assistants);
    return (
        <div className="p-4">
                <>
                    <h2 className="text-2xl font-bold mb-4">Configurazione Assistenti WhatsApp</h2>
                    <div className="flex space-x-4 mb-4">
                        <select
                            value={assistant}
                            onChange={handleAssistantChange}
                            className={`border ${errorMessage ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 w-1/3`}
                        >
                            <option value="">Seleziona Assistente</option>
                            {assistants.map((assistant) => (
                                <option key={assistant.id} value={assistant.id}>
                                    {assistant.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Token WhatsApp"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className={`border ${isDisabled ? 'bg-gray-200' : 'border-gray-300'} rounded-md px-3 py-2 w-1/3`}
                            disabled={isDisabled}
                        />
                        <input
                            type="text"
                            placeholder="ID Numero in Uscita"
                            value={outgoingNumberId}
                            onChange={(e) => setOutgoingNumberId(e.target.value)}
                            className={`border ${isDisabled ? 'bg-gray-200' : 'border-gray-300'} rounded-md px-3 py-2 w-1/3`}
                            disabled={isDisabled}
                        />
                        <button
                            onClick={addAssociation}
                            className={`bg-blue-500 text-white px-4 py-2 rounded-md ${isDisabled ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                            disabled={isDisabled}
                        >
                            +
                        </button>
                    </div>
                    {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 bg-gray-200">Assistente</th>
                                <th className="py-2 px-4 bg-gray-200">Token</th>
                                <th className="py-2 px-4 bg-gray-200">ID Numero in Uscita</th>
                                <th className="py-2 px-4 bg-gray-200">URL</th>
                                <th className="py-2 px-4 bg-gray-200">Codice</th>
                                <th className="py-2 px-4 bg-gray-200"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {assistants && associations ? associations.map((assoc, index) => (
                                                                <tr key={index}>
                                    <td className="py-2 px-4 truncate text-center" style={{ maxWidth: '150px' }}>
                                        {getAssistantName(assoc.assistant)}
                                    </td>
                                    <td className="py-2 px-4 truncate text-center" style={{ maxWidth: '150px' }}>
                                        {assoc.token}
                                    </td>
                                    <td className="py-2 px-4 truncate text-center" style={{ maxWidth: '150px' }}>
                                        {assoc.outgoingNumberId}
                                    </td>
                                    <td className="py-2 px-4 truncate text-center" style={{ maxWidth: '150px' }}>
                                        <button
                                            onClick={() => copyToClipboard(`${baseUrl}/wp-json/video-ai-chatbot/v1/${assoc.outgoingNumberId}/webhook/`)}
                                            className="bg-green-500 text-white px-2 py-1 rounded-md"
                                        >
                                            Copia URL
                                        </button>
                                    </td>
                                    <td className="py-2 px-4 truncate text-center" style={{ maxWidth: '150px' }}>
                                        {showCode[index] ? generateKey(assoc.token) : '•••••'}
                                        <button
                                            onClick={() => toggleShowCode(index)}
                                            className="bg-blue-500 text-white px-2 py-1 rounded-md ml-2"
                                        >
                                            {showCode[index] ? 'Nascondi' : 'Mostra'}
                                        </button>
                                    </td>
                                    <td className="py-2 px-4 text-center">
                                        <button
                                            onClick={() => removeAssociation(index)}
                                            className="bg-red-500 text-white px-2 py-1 rounded-md"
                                        >
                                            Elimina
                                        </button>
                                    </td>
                                </tr>
                            )) : null }	
                        </tbody>
                    </table>
                </>
        </div>
    );
};

export default WhatsappAssistantsSettings;