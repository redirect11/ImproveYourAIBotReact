import React from 'react';
import useDeleteUnusedVectorStores from '../../hooks/useDeleteUnusedVectorStores';
import { Button } from '@wordpress/components';

const DeleteUnusedVectorStoresButton = () => {
  const { data, error, isLoading, deleteVectorStores } = useDeleteUnusedVectorStores();

  const handleClick = () => {
    deleteVectorStores();
  };

  return (
    <>
        <Button className="button button-primary" onClick={handleClick}>
        Elimina Vector Stores Inutilizzati
        </Button>
        {isLoading && <p>Sto eliminando i Vector Stores inutilizzati...</p>}
        {data && <p>Vector Stores eliminati con successo!</p>}
        {error && <p>Errore durante l'eliminazione dei Vector Stores: {error.message}</p>}
    </>
  );
};

export default DeleteUnusedVectorStoresButton;