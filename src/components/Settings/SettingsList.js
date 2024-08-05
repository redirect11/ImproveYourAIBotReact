import React, { useEffect, useState } from 'react';
import { Button, CheckboxControl, TextControl, TextareaControl } from '@wordpress/components';
import settings from './settings';
import RemoteOperationButton from '../RemoteOperationButton';


const SettingsList = ({ options, handleChange }) => {
    console.log('SettingsList options', options);
    return (
        <div>
          {options.map(option => {
            const setting = settings.get(option.id);
            const Component = setting.type; // Ottiene il componente da renderizzare basato sul tipo definito nella mappa
            if (Component) {            
              const props = {
                  description: setting.description, 
                  value: option.value, 
                  className: setting.className? setting.className : '',
                  onChange: (value) => {
                      console.log('SettingsList value', value); 
                      handleChange(option.id, value) 
                  }
              }; 
              if (setting.url) {
                  props.url = setting.url;
              }
              if(Component === CheckboxControl) {
                  props.checked = option.value === '1' || option.value === true;
              }
              return (
                <div key={option.id}>
                  <label>{setting.name}</label>
                  <Component {...props} />
                </div>
              );
            }
          })}
        </div>
      );
};

export default SettingsList;