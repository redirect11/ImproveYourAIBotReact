import React, { useState, useEffect, useCallback } from 'react';
import DataTable from 'react-data-table-component';


const TranscriptionSelector = ({ onSelectionChange, assistant }) => {
  console.log('TranscriptionSelector');
  const [data, setData] = useState(window.adminData.transcriptions ? window.adminData.transcriptions : []);
  const [selectedRows, setSelectedRows] = useState(false);

  useEffect(() => {

    if(assistant) {
      var vectorStoreIds = assistant.tool_resources.file_search.vector_store_ids;
      console.log('vectorStoreIds', vectorStoreIds);
      if(vectorStoreIds && vectorStoreIds.length > 0) {
          fetch(`/wp-json/video-ai-chatbot/v1/vector-store-files?vector_store_id=${vectorStoreIds[0]}`,  { 
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': window.adminData.nonce
              }
          })
          .then(response => response.json())
          .then(files => {
            console.log('files', files);
            var filtered = data.filter((transcription) => files.some((file) => file.id === transcription.file_id));
            console.log('filtered', filtered);
            setSelectedRows(filtered);
            //setData(window.adminData.transcriptions);
          });
      } else {
          //createErrorNotice( __('No vector store defined', 'video-ai-chatbot'));
          console.log('No vector store defined');
      }
    }

  }, [assistant]);


  const rowSelectCritera = useCallback((row) => {
    console.log('selectedRows', selectedRows);
    return selectedRows ? selectedRows.some((selectedRow) => selectedRow.file_id === row.file_id) : false;
  }, [selectedRows]);

  const columns = [
    { name: 'Trascrizione', selector: row => row.transcription.videoTitle, sortable: true },
    // Aggiungi altre colonne se necessario
  ];

  return (
    <DataTable
      title="Associa Trascrizioni"
      columns={columns}
      data={data}
      selectableRows
      onSelectedRowsChange={({selectedRows}) => { onSelectionChange(selectedRows)}}
      selectableRowSelected={rowSelectCritera}
    />
  );
};

export default TranscriptionSelector;