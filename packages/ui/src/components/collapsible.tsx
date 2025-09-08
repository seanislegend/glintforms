'use client';

import {Collapsible as BaseCollapsible} from '@base-ui-components/react/collapsible';

const Collapsible: React.FC<React.ComponentProps<typeof BaseCollapsible.Root>> = ({...props}) => {
    return <BaseCollapsible.Root data-slot="collapsible" {...props} />;
};

const CollapsibleTrigger: React.FC<React.ComponentProps<typeof BaseCollapsible.Trigger>> = ({
    ...props
}) => {
    return <BaseCollapsible.Trigger data-slot="collapsible-trigger" {...props} />;
};

const CollapsibleContent: React.FC<React.ComponentProps<typeof BaseCollapsible.Panel>> = ({
    ...props
}) => {
    return <BaseCollapsible.Panel data-slot="collapsible-content" {...props} />;
};

export {Collapsible, CollapsibleTrigger, CollapsibleContent};
