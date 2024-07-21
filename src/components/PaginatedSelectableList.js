import React, { useState, useEffect, useCallback } from 'react';
import { CheckboxControl } from '@wordpress/components';
import { usePagination } from 'react-use-pagination';
import { CircularProgress } from '@material-ui/core';
import './PaginatedSelectableListStyles.css';
import useListener from '../hooks/useListener';

const PaginatedSelectableList = ({
    items,
    onSelectionChange,
    columns,
    isLoading,
    selectedItemsProp,
    mapItemId = item => item.id, // Assicurati che mapItemId sia sempre definito
  })  => {

	const [selectedItems, setSelectedItems] = useState(new Set(selectedItemsProp.map(mapItemId)), []);

    const allItemsSelected = items.every(item => selectedItems.has(mapItemId(item)));

    const handleSelectAllChange = useCallback(() => {
        setSelectedItems(prevSelectedItems => {
            const newSelectedItems = new Set(prevSelectedItems);
            if (allItemsSelected) {
                items.forEach(item => newSelectedItems.delete(mapItemId(item)));
            } else {
                items.forEach(item => newSelectedItems.add(mapItemId(item)));
            }
            return newSelectedItems;
        });
    }, [selectedItems]);

    const selectionColumn = {
        title: 'Seleziona tutto', // Puoi lasciarlo vuoto o usare un'icona
        render: () => (
          <CheckboxControl
            label='Seleziona tutto'
            checked={allItemsSelected}
            onChange={handleSelectAllChange}
          />
        ),
        // Non è necessario un render per le celle individuali, poiché questo sarà gestito separatamente
      };
    
      // Passo 2: Aggiungi la colonna di selezione all'inizio dell'array `columns`
      const modifiedColumns = [selectionColumn, ...columns];

	const [ dispatch ] = useListener(onSelectionChange)

	const {
		currentPage,
		totalPages,
		setNextPage,
		setPreviousPage,
		nextEnabled,
		previousEnabled,
		startIndex,
		endIndex,
        setPage
	} = usePagination({ totalItems: items.length, initialPageSize: 10});

	useEffect(() => {
        console.log('PaginatedSelectableList useEffect selectedItems', selectedItems);
        const filtered = items.filter(item => selectedItems.has(mapItemId(item)));
        console.log('PaginatedSelectableList useEffect filtered', filtered);
		dispatch(filtered);
	}, [selectedItems, dispatch]);

    useEffect(() => {
		// Aggiorna selectedItems solo se selectedItemsProp è cambiato
		if (selectedItemsProp && Array.from(selectedItems).sort().toString() !== selectedItemsProp.map(mapItemId).sort().toString()) {
            console.log('PaginatedSelectableList useEffect selectedItemsProp', selectedItemsProp);
            const ids = selectedItemsProp.map(mapItemId);
            console.log('PaginatedSelectableList useEffect ids', ids);
			setSelectedItems(new Set(ids));
		}
	}, [selectedItemsProp]);

	const handleSelectionChange = useCallback((item, isSelected) => {
		setSelectedItems(prevSelectedItems => {
			const newSelectedItems = new Set(prevSelectedItems);
            const itemId = mapItemId(item);
			if (isSelected) {
				newSelectedItems.add(itemId);
			} else {
				newSelectedItems.delete(itemId);
			}
            console.log('handleSelectionChange newSelectedItems', newSelectedItems);
			return newSelectedItems;
		});
	}, [selectedItems]);

	const handlePageSelect = (event) => {
        console.log('handlePageSelect', event.target.value);
		setPage(Number(event.target.value)-1);
	};

	const currentPageItems = items.slice(startIndex, endIndex + 1);

	if (isLoading) {
		return <div className="loading-container"><CircularProgress /></div>;
	}

	return (
		<div className="PaginatedSelectableList-container">
			<div className="PaginatedSelectableList-pagination">
				<button onClick={setPreviousPage} disabled={!previousEnabled} className="prev-button">Precedente</button>
                <span className="page-info">Pagina {currentPage+1} di {totalPages}</span>
				<select onChange={handlePageSelect} value={currentPage+1} className="page-select">
					{Array.from({ length: totalPages }, (_, i) => (
						<option key={i + 1} value={i + 1}>
							Pagina {i + 1}
						</option>
					))}
				</select>
				<button onClick={setNextPage} disabled={!nextEnabled} className="next-button">Successivo</button>
			</div>
			<table className="PaginatedSelectableList-table">
				<thead>
					<tr>
						{modifiedColumns.map((column, index) => (
                            <>
                                { index === 0 ? <th key={index}>{column.render()}</th> : <th key={index}>{column.title}</th> } 
                            </>
						))}
					</tr>
				</thead>
				<tbody>
					{currentPageItems.map(item => (
						<tr key={mapItemId(item)}>
							<td>
								<CheckboxControl
									checked={selectedItems.has(mapItemId(item))}
									onChange={(isChecked) => handleSelectionChange(item, isChecked)}
								/>
							</td>
							{columns.map((column, index) => (
								<td key={index}>{column.render(item)}</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default PaginatedSelectableList;