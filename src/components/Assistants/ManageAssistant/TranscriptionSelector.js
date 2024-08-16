import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import useFetchAllVectorStoreFiles from '../../../hooks/useFetchAllVectorStoreFiles';
import PaginatedSelectableList from '../../PaginatedSelectableList';
import useTranscriptions from '../../../hooks/useTranscriptions';

const TranscriptionSelector = ({ onSelectionChange, assistant }) => {
  const { data } = useTranscriptions();

  const { data: vectorStoreData, error, isLoading, mutate } = useFetchAllVectorStoreFiles(assistant?.tool_resources?.file_search?.vector_store_ids);

  const [selectedRows, setSelectedRows] = useState([]);

  //const filteredData = data.filter((transcription) => vectorStoreData.some((file) => file.id === transcription.file_id));

  useEffect(() => {
    if(vectorStoreData) {
      console.log('TranscriptionSelector useEffect vectorStoreData', vectorStoreData);
      setSelectedRows(data.filter((transcription) => vectorStoreData.some((file) => file.id === transcription.file_id)));
    } else if(error) {
      console.error('Trascrizioni non trovate');
    }
  }, [vectorStoreData, error, data]);

  // useEffect(() => {
  //   console.log('TranscriptionSelector useEffect mutate');
  //   mutate();
  // }, [assistant]);

  const columns = [
    { title: 'Trascrizione', render: row => row.transcription.videoTitle },
    // Aggiungi altre colonne se necessario
  ];

  const handleSelection = useCallback((selectedItems) => {
    console.log('handleSelection selectedItems', selectedItems);
    onSelectionChange(selectedItems);
    setSelectedRows(selectedItems);
  }, [selectedRows, onSelectionChange]);

  return (
    <PaginatedSelectableList
      items={data}
      onSelectionChange={handleSelection}
      columns={columns}
      isLoading={isLoading}
      selectedItemsProp={selectedRows}
      mapItemId={(item) => item.file_id}
    />
  );
};

export default TranscriptionSelector;