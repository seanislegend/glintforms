'use client';

import {cn} from '@glint/ui/utils';
import {useQueryState} from 'nuqs';
import {createContext, useContext, useEffect} from 'react';

const TabsContext = createContext<{
    selectedValue: string;
    onValueChange: (value: string) => void;
} | null>(null);

const useTabsContext = () => {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error('Tabs components must be used within a Tabs provider');
    }
    return context;
};

interface TabsProps {
    className?: string;
    defaultValue: string;
    onValueChange?: (value: string) => void;
    value?: string;
}

const Tabs: React.FC<React.PropsWithChildren<TabsProps>> = ({
    className,
    children,
    defaultValue,
    onValueChange,
    value
}) => {
    const [selectedValue, setSelectedValue] = useQueryState('tab', {
        defaultValue: value ?? defaultValue
    });

    const handleValueChange = (newValue: string) => {
        setSelectedValue(newValue);
        onValueChange?.(newValue);
    };

    useEffect(() => {
        if (value !== undefined) {
            setSelectedValue(value);
        }
    }, [value, setSelectedValue]);

    return (
        <TabsContext.Provider value={{selectedValue, onValueChange: handleValueChange}}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
};

interface TabsListProps {
    className?: string;
}

const TabsList: React.FC<React.PropsWithChildren<TabsListProps>> = ({children, className}) => {
    return (
        <div
            className={cn(
                'inline-flex items-center justify-center rounded-md bg-muted p-1 text-foreground',
                className
            )}
        >
            {children}
        </div>
    );
};

interface TabsTriggerProps {
    className?: string;
    value: string;
}

const TabsTrigger: React.FC<React.PropsWithChildren<TabsTriggerProps>> = ({
    value,
    children,
    className
}) => {
    const {selectedValue, onValueChange} = useTabsContext();
    const isSelected = selectedValue === value;

    return (
        <button
            type="button"
            className={cn(
                'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                '[&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-5 shrink-0 [&_svg]:shrink-0',
                isSelected
                    ? 'bg-background text-foreground shadow-sm'
                    : 'hover:bg-background/50 hover:text-foreground',
                className
            )}
            onClick={() => onValueChange(value)}
        >
            {children}
        </button>
    );
};

interface TabsContentProps {
    className?: string;
    value: string;
}

const TabsContent: React.FC<React.PropsWithChildren<TabsContentProps>> = ({
    children,
    className,
    value
}) => {
    const {selectedValue} = useTabsContext();

    if (selectedValue !== value) {
        return null;
    }

    return (
        <div
            className={cn(
                'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                className
            )}
        >
            {children}
        </div>
    );
};

export {Tabs, TabsList, TabsTrigger, TabsContent};
