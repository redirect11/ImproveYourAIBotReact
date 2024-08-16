import React from 'react';
import useAuth from '../../hooks/useAuth';

import { createCustomMessage } from "react-chatbot-kit";

const ActionProvider = ({  setState, state, children }) => {

    const {token, baseUrl} = useAuth();

  const handleData = (data) => {
    console.log('data:', data);
    let dataMessage = data.message.value;
    const widgetType = !data.message.value ? "customWithError" : "customWithLinks";
    if(!dataMessage) {
      dataMessage = "I'm sorry, I don't have an answer for that. Please try again.";
    }
    const pattern = /【.*?†source】/g;
    // Replace the pattern with an empty string
    dataMessage = dataMessage.replace(pattern, '');
    const botMessage = createCustomMessage(dataMessage, widgetType, {payload: dataMessage});
    console.log('botMessage:', botMessage);

    setState((prev) => {
      const newPrevMsg = prev.messages.slice(0, -1)
      return {
        ...prev,
        messages: [...newPrevMsg, botMessage],
      }
    });
  }

  const handleUserMessage = (message) => {

    console.log(state);

    const loading = createCustomMessage("" , "loaderMessage")
    setState((prev) => ({ ...prev, messages: [...prev.messages, loading], }))

    fetch(`${baseUrl}/wp-json/video-ai-chatbot/v1/chatbot/`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message: message,
                             assistant_id: state.selectedAssistant.id})
    })
    .then(response => { return response.json()})
    .then(handleData);
  };



  return (
    <>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          actions: {
            handleUserMessage,
          },
        });
      })}
    </>
  );
};

export default ActionProvider;