import React, { useState } from 'react';
import domReady from '@wordpress/dom-ready';
import { createRoot } from '@wordpress/element';
import { Panel, PanelBody, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import DeleteUnusedVectorStoresButton from './components/Settings/DeleteUnusedVectorStoresButton';
import SettingsPanel from './components/Settings/SettingsPanel';

domReady( () => {
    const element = document.getElementById('react-settings-page');
    if(!element) return;    

    const root = createRoot(element)
    root.render(
    <>
        <SettingsPanel title={ __('Cancella vector stores inutilizzati', 'video-ai-chatbot') } open={true}>
            <DeleteUnusedVectorStoresButton />
        </SettingsPanel>
    </>);
} );