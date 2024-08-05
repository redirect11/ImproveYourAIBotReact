import React from 'react';
import { Panel, PanelBody } from '@wordpress/components';

const SettingsPanel = ({children, title, open}) => {
    return (
        <div className='chatbot-settings-section'>
            <Panel className='settings'>
                    <PanelBody
                        title={ title }
                         initialOpen={ open }
                    >
                        {children}
                    </PanelBody>
            </Panel>
            <br />
        </div>
    );
}

export default SettingsPanel;