import React, { useState, useEffect, useRef, useMemo } from 'react';
import useGetConversations from '../../hooks/useGetCoversations';
import { useDispatch } from 'react-redux';
import { setTitle } from '../../redux/slices/HeaderTitleSlice';
import useGetMessages from '../../hooks/useGetMessages';
import { get, times } from 'lodash';
import useAuth from '../../hooks/useAuth';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Markdown from 'react-markdown';

const Chat = () => {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [isSending, setIsSending] = useState(false); // Stato per gestire il caricamento del messaggio
    const [isTerminating, setIsTerminating] = useState(false); // Stato per gestire il caricamento del messaggio

    const { data: conversations, isLoading, error, mutate } = useGetConversations(selectedConversation ? false : true);

    console.log('error', error);
    const { 
            data: messages, 
            isLoading: messagesLoading, 
            error: messagesError, 
            mutate: mutateMessages } = useGetMessages(selectedConversation?.thread_id ? selectedConversation.thread_id : null);


    const {token, baseUrl} = useAuth();

    const currentConversation = useMemo(() => selectedConversation?.messages?.map(message => {
        if(message.sender === 'You') {
            console.log('message YOU', message);
            let newMessage = {...message};
            return newMessage;
        } else if (message.sender === 'assistant' && message.handover_message === true) {
            let newMessage = {...message, sender: 'You', sent: message.sender == 'assistant' ? 'sent' : 'received'};
            return newMessage;
        }
        return {...message, sent: message.sender == 'assistant' ? 'sent' : 'received' };
    }), [selectedConversation]);   ;


    const dispatch = useDispatch();

    console.log('selectedConversation', selectedConversation);

    // React ref to store array of refs
    const scrollRef = useRef();

    useEffect(() => {
        dispatch(setTitle('Chat'));
    }, [dispatch]);

    const scrollToElement = () => {
        const {current} = scrollRef;
        if (current){
            console.log('scrolling to element');
            current.scrollIntoView({behavior: "smooth"})
        }
    };

    useEffect(() => {
        if (selectedConversation) {
            console.log('useEffect selectedConversation', selectedConversation);
            scrollToElement();
            mutate();
        }
    }, [selectedConversation]);

    useEffect(() => {
        console.log('messages', messages);
        if(messages && selectedConversation) {
            let lastNewMessageTimestamp = getLastConversationMessageTimestamp(messages);
            let lastOldMessageTimestamp = getLastConversationMessageTimestamp(selectedConversation.messages);
            if(lastNewMessageTimestamp >= lastOldMessageTimestamp) {
                const updatedConversation = {
                    ...selectedConversation,
                    messages: messages
                };
                setSelectedConversation(updatedConversation);
            }
        }
    }, [messages]);

    useEffect(() => {
        if(selectedConversation) {
            console.log('selectedConversation', selectedConversation);
            //trova la conversazione selezionata tra le conversazioni e aggiorna lo stato handover della conversazione selezionata
            const conversation = conversations.find(conversation => conversation.thread_id === selectedConversation.thread_id);
            setSelectedConversation({...selectedConversation, is_handover_thread: conversation.is_handover_thread });
        }
    }, [conversations]);

    const onFormSubmit = e => {
        e.preventDefault();
        if (replyMessage.trim() === '') return;

        setIsSending(true); // Imposta lo stato di caricamento su true

        // Aggiungi il messaggio alla conversazione selezionata
        const updatedConversation = {
            ...selectedConversation,
            messages: [
                ...selectedConversation.messages,
                { sender: 'You', text: replyMessage, timestamp: moment().unix(), sent: 'sending'}
            ]
        };

        // Aggiorna lo stato della conversazione selezionata
        setSelectedConversation(updatedConversation);
        console.log('updatedConversation', updatedConversation);
        const formData = new FormData();
        formData.append('message', replyMessage);
        formData.append('thread_id', selectedConversation.thread_id);
        formData.append('phone_id', selectedConversation.outgoingNumberId);
        formData.append('phone_number', selectedConversation.user_id);
        fetch(`${baseUrl}/wp-json/video-ai-chatbot/v1/${selectedConversation.outgoingNumberId}/handover_message/`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': 'Bearer ' + token,	
            }
            }).then(res => res.json())
              .then(data => {
                console.log('onFormSubmit data', data);
                mutateMessages();
                setIsSending(false);
                // const updatedConversation = {
                //     ...selectedConversation,
                //     messages: [
                //         ...selectedConversation.messages,
                //         { sender: 'You', text: replyMessage, timestamp: moment().unix(), sent: 'sent'}
                //     ]
                // };
        
                // // Aggiorna lo stato della conversazione selezionata
                // setSelectedConversation(updatedConversation);
            });
        setReplyMessage('');
    };

    const terminateHandover = () => {
        setIsTerminating
        fetch(`${baseUrl}/wp-json/video-ai-chatbot/v1/${selectedConversation?.outgoingNumberId}/terminate_handover/${selectedConversation?.thread_id}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
            }
            }).then(res => res.json())
            .then(data => {
                console.log('terminateHandover data', data);
            if (data) {
                mutate();
                mutateMessages();
                setIsTerminating(false);
                setSelectedConversation({...selectedConversation, is_handover_thread: false });
            }
        }
        );
    };

    const getLastConversationMessage = (conversation) => {
        let messages = conversation.messages;
        if(selectedConversation && conversation.thread_id === selectedConversation.thread_id) {
            messages = selectedConversation.messages;
        }
        if (!messages || messages.length === 0) return 'No messages';
        const lastMessage = messages[messages.length - 1];
        return lastMessage.text;
    };

    const getLastConversationMessageTimestamp = (messages) => {
        if (messages.length === 0) return 'No messages';
        const lastMessage = messages[messages.length - 1];
        return lastMessage.timestamp;
    };

    const getMessageBgColor = (message) => {
        if(message.sender === 'You') {
            return 'bg-red-100';
        } else if(message.sender === 'assistant') {
            return 'bg-green-100';
        }
        return 'bg-blue-100';
    }

    if (isLoading && !messages) return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;
    if (error) return <div className="flex items-center justify-center h-screen text-white">Error loading conversations</div>;

    return (
        <div className="flex h-[96%] w-full items-center justify-center rounded">
            <div className="flex h-[90%] w-[100rem] bg-gray-100">
                <div className="w-1/4 flex-none border-r border-gray-300 overflow-y-scroll bg-white">
                    {conversations && conversations.map(conversation => (
                    <div
                        key={conversation.thread_id}
                        className={`p-4 cursor-pointer border-b border-gray-300 hover:bg-gray-200 
                            ${conversation.is_handover_thread ? 'bg-orange-300 hover:bg-orange-400' : 'hover:bg-gray-200'}`}
                        onClick={() => setSelectedConversation(conversation)}
                    >
                        <div className="font-bold text-gray-800 break-words">{conversation.userName}</div>
                        <div className="text-gray-600 break-words truncate">{getLastConversationMessage(conversation)}</div>
                    </div>
                    ))}
                </div>
                <div className="w-3/4 p-4 flex flex-col flex-none bg-white overflow-y-auto">
                    {selectedConversation ? (
                    <>
                        <div className="flex flex-initial flex-col flex-grow-0 overflow-y-scroll">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800 break-words">{selectedConversation.name}</h2>
                            <div className="flex-grow overflow-y-scroll">
                                {currentConversation && ( 
                                    currentConversation.map((message, index) => (
                                    <div 
                                        key={index} 
                                        className={`mb-4 p-2 rounded ${getMessageBgColor(message)}`}
                                    >
                                        <div className="font-bold text-gray-800 break-words">
                                            {message.sender == "user" ? selectedConversation.userName : message.sender} - {moment.unix(message.timestamp).format('MMM D, h:mm A')}
                                            {message.sent === 'sent' && (
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 ml-2" />
                                            )}
                                            {message.sent === 'sending' && (
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-gray-500 ml-2" />
                                            )}
                                        </div>
                                        <div className="text-gray-700 break-words"><Markdown>{message.text}</Markdown></div>
                                    </div>
                                    ))
                                )}
                                <div className="mb-4" ref={scrollRef} />
                            </div>
                        </div>
                        <form onSubmit={onFormSubmit} className="mt-4 flex">
                            <input
                                type="text"
                                className="flex-grow border border-gray-300 p-2 rounded-l"
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                placeholder="Type your message..."
                                disabled={isSending} // Disabilita l'input durante l'invio
                            />
                            <button
                                className={`bg-blue-500 text-white p-2 ${selectedConversation.is_handover_thread ? '' : 'rounded-r'}`}
                                type="submit"
                                disabled={isSending} // Disabilita il pulsante durante l'invio
                            >
                                {isSending ? (
                                    <>
                                        <span className="loading loading-spinner"></span>
                                        Sending...
                                    </>
                                ) : (
                                    'Send'
                                )}
                            </button>
                            {selectedConversation?.is_handover_thread && (
                                <button
                                    className="bg-orange-400 text-white p-2 rounded-r"
                                    type="button"
                                    onClick={terminateHandover}
                                    disabled={isTerminating} // Disabilita il pulsante durante l'invio
                                >
                                    {isTerminating ? (
                                        <>
                                            <span className="loading loading-spinner"></span>
                                            Terminating...
                                        </>
                                    ) : (
                                        'Termina handover'
                                    )}
                                </button>
                            )}
                        </form>
                    </>
                    ) : (
                    <div className="text-center text-gray-500 flex-grow flex items-center justify-center">
                        Select a conversation to start chatting
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;