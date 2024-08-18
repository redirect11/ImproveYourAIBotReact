import React, { useEffect, useState } from 'react';
import useAssistants from '../../hooks/useAssistants';
import useBaseUrl from '../../hooks/useBaseUrl';
import { useDispatch as useDispatchWordpress } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';

const InstagramAssistantsSettings = ({associations, handleChange }) => {
    const [assistant, setAssistant] = useState('');
    const [token, setToken] = useState('');
    const [instagramId, setInstagramId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showCode, setShowCode] = useState({});
    const { data: assistants } = useAssistants();
    const { baseUrl } = useBaseUrl();
    const { createInfoNotice } = useDispatchWordpress(noticesStore);

    const generateKey = (token) => {
        let hash = 0;
        for (let i = 0; i < token.length; i++) {
            hash = (hash << 5) - hash + token.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash).toString().slice(0, 5).padStart(5, '0');
    };

    const handleAssistantChange = (e) => {
        const selectedAssistant = assistants.find((assistant) => assistant.id === e.target.value);
        setAssistant(selectedAssistant.id);
        setErrorMessage('');
    };

    const addAssociation = () => {
        // Check if the assistant is already present
        const isAssistantPresent = associations.some((assoc) => assoc.assistant === assistant);
        if (isAssistantPresent) {
            // Handle the case when the assistant is already present
            setErrorMessage('L\'assistente è già associato ad un token');
            return;
        }

        // Check if there is another assistant with the same token and instagramId
        const isDuplicate = associations.some((assoc) => assoc.token === token && assoc.instagramId === instagramId);
        if (isDuplicate) {
            // Handle the case when there is a duplicate assistant
            setErrorMessage('Esiste già un assistente con lo stesso token e lo stesso phone ID');
            return;
        }

        handleChange('video_ai_instagram_assistants', [...associations, { assistant, token, instagramId }]);
        setAssistant('');
        setToken('');
        setInstagramId('');
        setErrorMessage('');
    };

    const removeAssociation = (index) => {
        const newAssociations = associations.filter((_, i) => i !== index);
        handleChange('video_ai_instagram_assistants', newAssociations);
    };

    const getAssistantName = (assistantId) => {
        const assistant = assistants.find((assistant) => assistant.id === assistantId);
        return assistant ? assistant.name : 'Sconosciuto';
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            createInfoNotice('URL copiato negli appunti.');
        });
    };

    const toggleShowCode = (index) => {
        setShowCode((prevShowCode) => ({
            ...prevShowCode,
            [index]: !prevShowCode[index],
        }));
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Configurazione Assistenti Instagram</h2>
            <div className="flex space-x-4 mb-4">
                <select
                    value={assistant}
                    onChange={handleAssistantChange}
                    className={`border ${errorMessage ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 w-1/4`}
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
                    placeholder="Access Token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className={`border ${errorMessage ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 w-1/4`}
                />
                <input
                    type="text"
                    placeholder="Instagram ID"
                    value={instagramId}
                    onChange={(e) => setInstagramId(e.target.value)}
                    className={`border ${errorMessage ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 w-1/4`}
                />
                <button
                    onClick={addAssociation}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
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
                        <th className="py-2 px-4 bg-gray-200">Instagram ID</th>
                        <th className="py-2 px-4 bg-gray-200">URL</th>
                        <th className="py-2 px-4 bg-gray-200">Codice</th>
                        <th className="py-2 px-4 bg-gray-200"></th>
                    </tr>
                </thead>
                <tbody>
                    {assistants ? associations.map((assoc, index) => (
                        <tr key={index}>
                            <td className="py-2 px-4 truncate text-center" style={{ maxWidth: '150px' }}>
                                {getAssistantName(assoc.assistant)}
                            </td>
                            <td className="py-2 px-4 truncate text-center" style={{ maxWidth: '150px' }}>
                                {assoc.token}
                            </td>
                            <td className="py-2 px-4 truncate text-center" style={{ maxWidth: '150px' }}>
                                {assoc.instagramId}
                            </td>
                            <td className="py-2 px-4 truncate text-center" style={{ maxWidth: '150px' }}>
                                <button
                                    onClick={() => copyToClipboard(`${baseUrl}/wp-json/video-ai-chatbot/v1/${assoc.instagramId}/webhook/`)}
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
                    )) : null}
                </tbody>
            </table>
        </div>
    );
};

export default InstagramAssistantsSettings;