'use client';

import {useEffect, useState} from 'react';

const ClientOnly: React.FC<React.PropsWithChildren> = ({children}) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return <>{isMounted ? children : null}</>;
};

export default ClientOnly;
