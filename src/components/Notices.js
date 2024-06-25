import React from 'react';
import { NoticeList } from '@wordpress/components';
import { useDispatch as useDispatchWordpress } from '@wordpress/data';
import { useSelect } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';

const Notices = () => {
    const { removeNotice } = useDispatchWordpress( noticesStore );
    const notices = useSelect( ( select ) =>
        select( noticesStore ).getNotices()
    );

    if ( notices.length === 0 ) {
        return null;
    }

    return <NoticeList notices={ notices } onRemove={ removeNotice } />;
};

export default Notices;