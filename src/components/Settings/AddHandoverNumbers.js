import React, { useState, useEffect } from 'react';
import useGetNotificationPhoneNumbers from '../../hooks/useGetNotificationPhoneNumbers';
import { useDispatch as useDispatchWordpress } from '@wordpress/data';
import useAuth from '../../hooks/useAuth';
import { store as noticesStore } from '@wordpress/notices';

const AddHandoverNumbers = () => {
    const { phoneNumbers: initialPhoneNumbers, isLoading, error } = useGetNotificationPhoneNumbers();
    const [phoneNumbers, setPhoneNumbers] = useState([]);
    const [newPhoneNumber, setNewPhoneNumber] = useState('');
    const { token, baseUrl } = useAuth();
    const [isLoadingSave, setIsLoadingSave] = useState(false);

    //console.log('initialPhoneNumbers', initialPhoneNumbers);

    //if(initialPhoneNumbers) {


    //const newInitialPhoneNumbers = Array.isArray(initialPhoneNumbers) ? initialPhoneNumbers : [];

    const { createSuccessNotice, createErrorNotice } = useDispatchWordpress( noticesStore );

    //console.log('newInitialPhoneNumbers', newInitialPhoneNumbers);
  
    useEffect(() => {
      if (!isLoading && !error && initialPhoneNumbers) {
        setPhoneNumbers([...initialPhoneNumbers]);
      }
    }, [isLoading, error]);
  
    const addPhoneNumber = () => {
      if (newPhoneNumber && !phoneNumbers.includes(newPhoneNumber)) {
        setPhoneNumbers([...phoneNumbers, newPhoneNumber]);
        setNewPhoneNumber('');
      }
    };
  
    const removePhoneNumber = (number) => {
      setPhoneNumbers(phoneNumbers.filter(phone => phone !== number));
    };
  
    const handleSubmit = async () => {
      setIsLoadingSave(true);
      try {
        const formData = new FormData();
        formData.append('video_ai_chatbot_notification_numbers', JSON.stringify(phoneNumbers));
        const response = await fetch(`${baseUrl}/wp-json/video-ai-chatbot/v1/set-handover-notification-numbers`, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,	
          },
          body: formData,
        });
  
        if (!response.ok) {
          throw new Error('Errore durante il salvataggio dei numeri di telefono.');
        }
        createSuccessNotice('Numeri di telefono salvati con successo.');
      } catch (error) {
        let newError = "Errore durante il salvataggio dei numeri di telefono: " + error;
        createErrorNotice(newError);
      } finally {
        setIsLoadingSave(false);
      }
    };
  
    if (isLoading) {
      return <div>Caricamento...</div>;
    }
  
    if (error) {
      return <div>Errore: {error}</div>;
    }

  return (
    <div className="max-w-full mx-auto mt-3 p-6 bg-white rounded-lg shadow-md">
      {/* <h2 className="text-2xl font-bold mb-4 text-gray-800">Aggiungi Numeri di Telefono per Handover</h2> */}
      <div className="flex mb-4">
        <input
          type="text"
          value={newPhoneNumber}
          onChange={(e) => setNewPhoneNumber(e.target.value)}
          placeholder="Inserisci numero di telefono"
          className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addPhoneNumber}
          className="h-full bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Aggiungi
        </button>
      </div>
      <ul className="mb-4">
        {phoneNumbers.map((number, index) => (
          <li key={index} className="flex border-b border-gray-200 rounded-l-md min-h-10 mb-2">
            <span className="text-gray-700 mt-auto mb-1">{number}</span>
            <button
              onClick={() => removePhoneNumber(number)}
              className="bg-red-500 text-white hover:text-gray-400 focus:outline-none rounded-r-md ml-auto p-2"
            >
              Rimuovi
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={handleSubmit}
        className={`w-full p-2 rounded-md focus:outline-none focus:ring-2 ${isLoadingSave ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-600'} text-white`}
        disabled={isLoadingSave}
      >
        {isLoadingSave ? (
          <>
            <span className="loading loading-spinner"></span>
            Caricamento...
          </>
        ) : (
          'Salva Numeri'
        )}
      </button>
    </div>
  );
};

export default AddHandoverNumbers;