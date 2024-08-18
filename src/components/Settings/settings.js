import { TextControl, CheckboxControl, TextareaControl, SelectControl, Button } from '@wordpress/components';
import AsyncSelectControl from '../AsyncSelectControl';
import QuoteAssistantsSelectControl from '../Assistants/QuoteAssistantsSelectControl';
import { config } from "../../Constants";
import RemoteOperationButton from '../RemoteOperationButton';





const settings = new Map([
    ["video_ai_chatbot_name_field", {name: "Nome del Chatbot", type: TextControl, description: "Il nome del chatbot che verrà visualizzato dall'utente"}],
    ["video_ai_enable_chatbot_field", {name: "Abilita Chatbot", type: CheckboxControl, description: "Abilita o disabilita il chatbot"}],
    ["video_ai_chatbot_welcome_message_field", {name: "Messaggio di benvenuto", type: TextareaControl, description: "Il messaggio di benvenuto che verrà visualizzato dall'utente"}],
    ["video_ai_chatbot_theme", {name: "Tema del Chatbot", type: AsyncSelectControl, description: "Il tema del chatbot", url: `/wp-json/video-ai-chatbot/v1/get-css-themes`}],
    ["openai_api_key_field", {name: "Chiave API OpenAI", type: TextControl, description: "La chiave API di OpenAI", passwordProtected: true}],
    ["video_ai_whatsapp_assistants", {name: "Associare l'assistente a WhatsApp", type: null, description: "Associare l'assistente a WhatsApp", passwordProtected: true}], 
    ["video_ai_instagram_assistants", {name: "Associare l'assistente a Instagram", type: null, description: "Associare l'assistente a Instagram", passwordProtected: true}], 

]);

export default settings;
