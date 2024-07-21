import React, { useEffect, useState } from 'react';
import { SelectControl } from '@wordpress/components';
import useSWR from 'swr';
import { getAuthFetcher } from '../hooks/fetcher';
import useAuth from '../hooks/useAuth';

const AsyncSelectControl = ({ url, value, description, onChange, filter }) => {
  const { token, baseUrl } = useAuth();
  const { data, error } = useSWR(token && baseUrl ? [baseUrl + url, token] : null, ([url, token]) => getAuthFetcher(url, token));
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (data) {
      const opts = data.map(option => ({ label: option.replace(/\.[^/.]+$/, ""), value: option.replace(/\.[^/.]+$/, "") }));
      setOptions(opts);
    }
  }, [data]);

  if (error) {
    return <p>Errore nel caricamento delle opzioni</p>;
  }

  if (!data) {
    return <p>Caricamento...</p>;
  }

  return (
    <SelectControl
      label={description}
      value={value}
      options={filter ? options.filter(filter) : options}
      onChange={onChange}
    />
  );
};

export default AsyncSelectControl;
