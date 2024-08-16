import React, { useEffect, useState, useMemo } from 'react';
import useGetCurrentUserThread from '../../hooks/useGetCurrentUserThread';
import useGetThemeOption from '../../hooks/useGetThemeOption';
import ChatbotIcon from './chatbot-icon.svg';
import ActionProvider from './actionProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useDispatch as useDispatchWordpress } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';

import {
    MessageParser,
    ChatbotMessageWithLinks,
    LoaderMessage,
    WithAvatar,
    ChatbotHeader,
    ChatbotMessageWithError,
    ChatbotStyleWrapper,
    createChatBotMessage,
    createClientMessage,
    createCustomMessage
} from 'ImproveYourAiChatbotFrontend';
import useAuth from '../../hooks/useAuth';

const TestChatbot = ({ assistant }) => {
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const [notification, setNotification] = useState(null);

    const { baseUrl, token } = useAuth();

    const { data: oldMessages, error, loading } = useGetCurrentUserThread();
    const { options: themeOptions } = useGetThemeOption();

    console.log("oldMessages",oldMessages);

    let wMessage = "CHABOT TESTING";

    let messageHistory = [];
    for (let i = 0; i < oldMessages.length; i++) {
        if (oldMessages[i].role === "user" && !(oldMessages[i].metadata?.postprompt === "true")) {
            messageHistory.push(createClientMessage(oldMessages[i].content[0].text.value));
        } else if (oldMessages[i].role === "assistant" && oldMessages[i].assistant_id) {
            messageHistory.push(createCustomMessage(oldMessages[i].content[0].text.value,
                "customWithLinks",
                { payload: oldMessages[i].content[0].text.value }));
        }
    }

    const [messages, setMessages] = useState(messageHistory.reverse());

    let chatbotName = assistant ? assistant.name : "Chatbot";
    let chatBotMessage = useMemo(() => createChatBotMessage(wMessage), []);

    const saveMessages = (messages, HTMLString) => {
        setMessages(messages);
    };

    let messageAlreadyExists = messages.some(message => message.id === chatBotMessage.id);
    let initialMessages = messages;
    if (!messageAlreadyExists) {
        initialMessages = [...messages, chatBotMessage];
    }

    const { createErrorNotice, createSuccessNotice } = useDispatchWordpress(noticesStore);

    useEffect(() => {
        if (themeOptions) {
            var head = document.head;
            var link = document.createElement("link");

            let csspath = `${baseUrl}/wp-content/plugins/video-ai-chatbot/public/css/themes/${themeOptions}.css`;

            link.type = "text/css";
            link.rel = "stylesheet";
            link.href = csspath;

            head.appendChild(link);

            return () => { head.removeChild(link); }
        }

    }, [themeOptions]);

    const config = useMemo(() => {
        return {
            initialMessages: initialMessages,
            botName: chatbotName,
            state: {
                selectedAssistant: assistant,
            },
            customComponents: {
                header: () => <ChatbotHeader selectedAssistant={assistant} />,
                botAvatar: (props) => <WithAvatar {...props} />,
            },
            customMessages: {
                customWithLinks: (props) => <ChatbotMessageWithLinks {...props} message={props.state.messages.find(msg => (msg.payload === props.payload))} />,
                customWithError: (props) => <ChatbotMessageWithError {...props} message={props.state.messages.find(msg => (msg.payload === props.payload))} />,
                loaderMessage: (props) => <LoaderMessage {...props} />,
            }
        }
    }, [saveMessages, assistant, oldMessages]);

    useEffect(() => {
        setMessages(initialMessages);
        setIsChatbotOpen(false);
    }, [assistant]);

    useEffect(() => {
      setMessages(messageHistory.reverse());
    }, [oldMessages]);

    const toggleChatbot = () => {
        setIsChatbotOpen(!isChatbotOpen);
    };

    const validator = (input) => {
        if (!input.replace(/\s/g, '').length) //check if only composed of spaces
            return false;
        if (input.length > 1) //check if the message is empty
            return true;
        return false
    }

    const deleteCurrentUserThread = async () => {
        try {
            const response = await fetch(`${baseUrl}/wp-json/video-ai-chatbot/v1/delete-current-user-thread/${assistant.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            let jsonResponse = await response.json();
            console.log('jsonRespnose',jsonResponse);
            if (response.ok) {
                createSuccessNotice('Thread cancellato con successo.');
                setMessages([]);
            } else {
                createErrorNotice('Errore nella cancellazione del thread. Error: ' + jsonResponse.message);
            }
        } catch (error) {
          createErrorNotice('Errore nella cancellazione del thread.');
        }
    };

    return (
        <>
            {assistant && themeOptions &&
                <div id="openai-chatbot">
                    <button
                        className="chatbot-toggle-button"
                        onClick={toggleChatbot}
                    >
                        {isChatbotOpen ?
                            <FontAwesomeIcon icon={faTimes} className="text-slate-800" /> :
                            <img
                                src={ChatbotIcon}
                                width={24}
                                height="auto"
                                title="React"
                            />
                        }
                    </button>
                      <button
                        className="fixed bottom-6 right-[5.5rem] ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full shadow-lg"
                        onClick={deleteCurrentUserThread}
                      >
                          <FontAwesomeIcon icon={faTrash} className="text-slate-800" />
                      </button>
                    <div id="chatbot-container" className={isChatbotOpen ? 'chatbot-open' : ''}>
                        {isChatbotOpen && (
                            <ChatbotStyleWrapper
                                config={config}
                                actionProvider={ActionProvider}
                                messageParser={MessageParser}
                                validator={validator}
                                saveMessages={saveMessages}
                            />
                        )}
                    </div>

                </div>
            }
        </>
    );
}

export default TestChatbot;