import { TextControl, CheckboxControl, TextareaControl, SelectControl, Button } from '@wordpress/components';
import AsyncSelectControl from '../AsyncSelectControl';
import QuoteAssistantsSelectControl from '../Assistants/QuoteAssistantsSelectControl';
import { config } from "../../Constants";
import RemoteOperationButton from '../RemoteOperationButton';

const cancelAllRuns = async (onError, onSuccess, token, baseUrl) => {
    try {
        const response = await fetch(`${baseUrl}/wp-json/video-ai-chatbot/v1/cancel-all-runs/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            }
        });
        if (response.ok) {
            const data = await response.json();
            console.log(data.message);
            onSuccess(data);
        } else {
            const errorData = await response.json();
            console.error('Error:', errorData.message);
            onError(errorData);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}



const settings = new Map([
    ["video_ai_chatbot_name_field", {name: "Nome del Chatbot", type: TextControl, description: "Il nome del chatbot che verrà visualizzato dall'utente"}],
    ["video_ai_enable_chatbot_field", {name: "Abilita Chatbot", type: CheckboxControl, description: "Abilita o disabilita il chatbot"}],
    ["video_ai_chatbot_welcome_message_field", {name: "Messaggio di benvenuto", type: TextareaControl, description: "Il messaggio di benvenuto che verrà visualizzato dall'utente"}],
    ["video_ai_chatbot_theme", {name: "Tema del Chatbot", type: AsyncSelectControl, description: "Il tema del chatbot", url: `/wp-json/video-ai-chatbot/v1/get-css-themes`}],
    ["openai_api_key_field", {name: "Chiave API OpenAI", type: TextareaControl, description: "La chiave API di OpenAI", passwordProtected: true}],
    ["openai_whatsapp_token_field", {name: "Token WhatsApp", type: TextareaControl, description: "Il token di WhatsApp", passwordProtected: true}],
    ["openai_whatsapp_outcoming_number_id_field", {name: "ID del numero di uscita di WhatsApp", type: TextControl, description: "L'ID del numero di uscita di WhatsApp", passwordProtected: true}],
    ["openai_whatsapp_associate_assistant_field", {name: "Associare l'assistente a WhatsApp", type: QuoteAssistantsSelectControl, description: "Associare l'assistente a WhatsApp", passwordProtected: true}], 
    ["opena_cancel_all_runs",{
                                name: "Annulla tutte le esecuzioni", 
                                type: RemoteOperationButton, 
                                description: "Annulla tutte le esecuzioni", 
                                callback: (onError, onSuccess, token, baseUrl) => cancelAllRuns(onError, onSuccess, token, baseUrl)
                            }],
]);

export default settings;
