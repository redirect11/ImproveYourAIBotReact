import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Markdown from 'react-markdown';
import useGetConversations from '../../hooks/useGetCoversations';
import useGetMessages from '../../hooks/useGetMessages';
import useAuth from '../../hooks/useAuth';
import { setTitle } from '../../redux/slices/HeaderTitleSlice';
import instagramLogo from './instagram-2016-5.svg'
import whatsappLogo from './whatsapp-3.svg'

const Chat = () => {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isTerminating, setIsTerminating] = useState(false);

    const { data: conversations, isLoading, error, mutate } = useGetConversations(selectedConversation ? false : true);
    const { data: messages, isLoading: messagesLoading, error: messagesError, mutate: mutateMessages } = useGetMessages(selectedConversation?.thread_id ? selectedConversation.thread_id : null);
    const { token, baseUrl } = useAuth();
    const dispatch = useDispatch();
    const scrollRef = useRef();

    const currentConversation = useMemo(() => selectedConversation?.messages?.map(message => {
        if (message.sender === 'You') {
            let newMessage = { ...message };
            return newMessage;
        } else if (message.sender === 'assistant' && message.handover_message === true) {
            return { ...message, sent: 'sent' };
        }
        return { ...message, sent: message.sender === 'assistant' ? 'sent' : 'received' };
    }), [selectedConversation]);

    useEffect(() => {
        dispatch(setTitle('Chat'));
    }, [dispatch]);

    const scrollToElement = () => {
        const { current } = scrollRef;
        if (current) {
            current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        if (selectedConversation) {
            scrollToElement();
            mutate();
        }
    }, [selectedConversation]);

    useEffect(() => {
        if (messages && selectedConversation) {
            let lastNewMessageTimestamp = getLastConversationMessageTimestamp(messages);
            let lastOldMessageTimestamp = getLastConversationMessageTimestamp(selectedConversation.messages);
            if (lastNewMessageTimestamp >= lastOldMessageTimestamp) {
                setSelectedConversation({ ...selectedConversation, messages });
            }
        }
    }, [messages]);

    useEffect(() => {
        if (selectedConversation) {
            const conversation = conversations.find(conversation => conversation.thread_id === selectedConversation.thread_id);
            setSelectedConversation({ ...selectedConversation, is_handover_thread: conversation.is_handover_thread });
        }
    }, [conversations]);

    const onFormSubmit = e => {
        e.preventDefault();
        if (replyMessage.trim() === '') return;

        setIsSending(true);

        const updatedConversation = {
            ...selectedConversation,
            messages: [
                ...selectedConversation.messages,
                { sender: 'You', text: replyMessage, timestamp: moment().unix(), sent: 'sending' }
            ]
        };

        setSelectedConversation(updatedConversation);
        const formData = new FormData();
        formData.append('message', replyMessage);
        formData.append('thread_id', selectedConversation.thread_id);
        let id = null;
        if (selectedConversation.type === 'wa') {
            formData.append('phone_id', selectedConversation.outgoingNumberId);
            formData.append('phone_number', selectedConversation.user_id);
            id = selectedConversation.outgoingNumberId;
        } else if (selectedConversation.type === 'ig') {
            formData.append('instagramId', selectedConversation.instagramId);
            id = selectedConversation.instagramId;
        } else {
            id = 'chat';
        }


        fetch(`${baseUrl}/wp-json/video-ai-chatbot/v1/${id}/handover_message/`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': 'Bearer ' + token,
            }
        }).then(res => res.json())
            .then(data => {
                setIsSending(false);
                mutateMessages();
            });
        setReplyMessage('');
    };

    const terminateHandover = () => {
        setIsTerminating(true);
        let id = selectedConversation?.outgoingNumberId ? selectedConversation.outgoingNumberId : selectedConversation?.instagramId;
        
        console.log('id terminateHandover', id);

        if (!id) {
            id = 'chat';
        } 

        console.log('id terminateHandover', id);
        fetch(`${baseUrl}/wp-json/video-ai-chatbot/v1/${id}/terminate_handover/${selectedConversation?.thread_id}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
            }
        }).then(res => res.json())
            .then(data => {
                setIsTerminating(false);
                mutateMessages();
            });
    };

    const getLastConversationMessage = (conversation) => {
        let messages = conversation.messages;
        if (selectedConversation && conversation.thread_id === selectedConversation.thread_id) {
            messages = selectedConversation.messages;
        }
        if (!messages || messages.length === 0) return '';
        const lastMessage = messages[messages.length - 1];
        return lastMessage.text;
    };

    const getLastConversationMessageTimestamp = (messages) => {
        if (messages.length === 0) return 0;
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
    };

    const getDisplayName = (conversation, sender) => {
        console.log('getDisplayName', conversation, sender);

        if(sender === 'You') {
            return 'You';
        } else if(sender == 'assistant') {
            return conversation.assistantName;
        }else if (conversation.user_profile) {
            return conversation.user_profile.name;
        } else if (conversation.type === 'anon') {
            return 'Utente non registrato';
        } else {
            return conversation.userName;
        }
    };



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
                                <div className='flex flex-row w-full justify-between items-center'>
                                    <div className='flex items-center'>
                                        {conversation.user_profile ? (
                                            <div className="flex items-center mt-2">
                                                <img src={conversation.user_profile.profile_pic} alt="Profile" className="w-8 h-8 rounded-full mr-2" />
                                                <div className="font-bold text-gray-800 break-words">{conversation.user_profile.name}</div>
                                            </div>
                                        ) : (
                                            conversation.type === 'anon' ? (
                                                <div className="font-bold text-gray-800 break-words">Utente non registrato</div>
                                            ) : (
                                                <div className="font-bold text-gray-800 break-words">{conversation.userName}</div>
                                            )
                                        )}
                                    </div>
                                    <div className="flex items-center">
                                        {conversation.type === 'wa' && (
                                            <img src={whatsappLogo} alt="WhatsApp" className="w-6 h-6 mr-2" />
                                        )}
                                        {conversation.type === 'ig' && (
                                            <img src={instagramLogo} alt="Instagram" className="w-6 h-6 mr-2" />
                                        )}
                                    </div>
                                </div>
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
                                                    className={`mb-4 p-2 rounded ${getMessageBgColor(message)} ${message.sender === "user" ? 'self-start bg-gray-200' : 'self-end bg-blue-200'}`}
                                                >
                                                    <div className="font-bold text-gray-800 break-words">
                                                        {getDisplayName(selectedConversation, message.sender)} - {moment.unix(message.timestamp).format('MMM D, h:mm A')}
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
                                        disabled={isSending}
                                    />
                                    <button
                                        className={`bg-blue-500 text-white p-2 ${selectedConversation.is_handover_thread ? '' : 'rounded-r'}`}
                                        type="submit"
                                        disabled={isSending}
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
                                            disabled={isTerminating}
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