'use client';

import {formatRelative} from 'date-fns/formatRelative';

interface Props extends React.HTMLAttributes<HTMLTimeElement> {
    date: Date;
}

const RelativeDate: React.FC<Props> = ({date, ...props}) => {
    if (!date) return null;
    return (
        <time {...props} className={props?.className ?? ''} dateTime={date.toISOString()}>
            {formatRelative(date, new Date())}
        </time>
    );
};

export default RelativeDate;
