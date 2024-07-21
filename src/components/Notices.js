import React from 'react';
import { NoticeList } from '@wordpress/components';
import { useDispatch as useDispatchWordpress } from '@wordpress/data';
import { useSelect } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';

const Notices = () => {
    const { removeNotice } = useDispatchWordpress( noticesStore );
    const notices = useSelect( ( select ) => {
        return select( noticesStore ).getNotices()
    });

    // mappo e riduco le notices duplicate, aggiungendo al content il numero di notifiche duplicate
    const uniqueNotices = notices.reduce((acc, notice) => {
        const existingNotice = acc.find( n => n.content === notice.content || n.content === `${notice.content} (${notice.count})` );
        if ( existingNotice ) {
            existingNotice.content = `${existingNotice.content} (${existingNotice.count + 1})`;
            existingNotice.count += 1;
        } else {
            acc.push({ ...notice, count: 1 });
        }
        return acc;
    }, []);

    console.log('Notices', uniqueNotices);

    if ( uniqueNotices.length === 0 ) {
        return null;
    }

    return <NoticeList notices={ uniqueNotices } onRemove={ removeNotice } />;
};

export default Notices;