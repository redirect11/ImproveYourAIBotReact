import { configureStore, combineReducers } from '@reduxjs/toolkit'
import assistantsReducer from './slices/AssistantsSlice';
import transcriptionsReducer from './slices/TranscriptionsSlice';
import authReducer from './slices/AuthSlice';
import headerTitleReducer from './slices/HeaderTitleSlice';

const rootReducer = combineReducers({
    assistants: assistantsReducer,
    transcriptions: transcriptionsReducer,
    auth: authReducer,
    headerTitle: headerTitleReducer
});

const store = configureStore({
    reducer: {rootReducer}
});

export default store;
