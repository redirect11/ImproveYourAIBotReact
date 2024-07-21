import React, { useMemo } from 'react';
import { SelectControl } from '@wordpress/components';
import { useSelector } from 'react-redux';
import useAssistants from '../../hooks/useAssistants';

const QuoteAssistantsSelectControl = ({ id, value, description, onChange }) => {
  const { data: assistants } = useAssistants();
  console.log('QuoteAssistantsSelectControl assistants', assistants);

  const filterAssistants = (assistants) => { 
    const filteredAssistants  = assistants.filter(assistant => assistant.metadata.type === "preventivi")
    return filteredAssistants.map(assistant => ({
        label: assistant.name,
        value: assistant.id
      }));
  }

  const options = useMemo(() => filterAssistants(assistants), [assistants]);

  console.log('QuoteAssistantsSelectControl options', options);
  
  if(options.length === 0) {
    return <p>Non ci sono assistenti di tipo preventivi</p>;
  }

  return (
    <SelectControl
      label={description}
      value={value}
      options={options}
      onChange={onChange}
    />
  );
};

export default QuoteAssistantsSelectControl;
