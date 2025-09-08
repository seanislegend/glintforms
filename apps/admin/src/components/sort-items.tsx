'use client';

import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import Button from '@glint/ui/button';
import ButtonWithTooltip from '@glint/ui/button-with-tooltip';
import {
    Dialog,
    DialogClose,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogPopup,
    DialogTitle,
    DialogTrigger
} from '@glint/ui/dialog';
import {ArrowsDownUpIcon} from '@phosphor-icons/react/dist/ssr/ArrowsDownUp';
import {DotsSixVerticalIcon} from '@phosphor-icons/react/dist/ssr/DotsSixVertical';
import {useState} from 'react';

export interface SortItem {
    id: string;
    order: number;
    type?: string;
    value: string;
}

interface DialogProps {
    ctaLabel: string;
    description: string;
    disabledReason?: string | null;
    getItems: () => SortItem[];
    onSorted: (items: SortItem[]) => void;
    title: string;
}

interface ItemProps {
    id: string;
}

interface SortItemsProps {
    items: SortItem[];
    onSorted: (items: SortItem[]) => void;
}

const SortableItem: React.FC<React.PropsWithChildren<ItemProps>> = ({children, id}) => {
    const {attributes, isDragging, listeners, setNodeRef, transform, transition} = useSortable({
        id
    });

    const style = {transform: CSS.Transform.toString(transform), transition};

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`rounded flex items-center sm:text-sm transition-colors duration-200 ease-in-out gap-2 p-3 hover:bg-accent border bg-white cursor-grab active:cursor-grabbing ${
                isDragging ? 'opacity-50 shadow-lg' : ''
            }`}
            {...attributes}
            {...listeners}
        >
            <DotsSixVerticalIcon
                className="size-4 text-muted-foreground flex-shrink-0"
                weight="bold"
            />
            <div className="flex-1 min-w-0">{children}</div>
        </div>
    );
};

const SortItemsContent: React.FC<SortItemsProps> = ({items, onSorted}) => {
    const [sortedItems, setSortedItems] = useState<SortItem[]>(items);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const {active, over} = event;

        if (over && active.id !== over.id) {
            const oldIndex = sortedItems.findIndex(item => item.id === active.id);
            const newIndex = sortedItems.findIndex(item => item.id === over.id);
            const newItems = arrayMove(sortedItems, oldIndex, newIndex);

            setSortedItems(newItems);
            onSorted(newItems);
        }
    };

    const renderItem = (item: SortItem, index: number) => {
        return (
            <div className="overflow-ellipsis">
                <div className="font-medium truncate">
                    {index + 1}. {item.value || `Question ${index + 1}`}
                </div>
            </div>
        );
    };

    return (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
            <SortableContext items={sortedItems} strategy={verticalListSortingStrategy}>
                <div className="max-h-[70vh] overflow-y-scroll space-y-1.5">
                    {sortedItems.map((item, index) => (
                        <SortableItem key={item.id} id={item.id}>
                            {renderItem(item, index)}
                        </SortableItem>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};

const SortItemsDialog: React.FC<DialogProps> = ({
    ctaLabel = 'Reorder',
    description,
    disabledReason,
    getItems,
    onSorted,
    title
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [newSortedItems, setNewSortedItems] = useState<SortItem[]>([]);

    const handleSave = () => {
        onSorted(newSortedItems);
        setIsOpen(false);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        setNewSortedItems([]);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger
                render={
                    <ButtonWithTooltip
                        disabledReason={disabledReason}
                        onClick={() => setIsOpen(true)}
                        variant="outline"
                    >
                        <ArrowsDownUpIcon />
                        {ctaLabel}
                    </ButtonWithTooltip>
                }
            />
            <DialogPopup>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <DialogDescription>{description}</DialogDescription>
                {isOpen && <SortItemsContent items={getItems()} onSorted={setNewSortedItems} />}
                <DialogFooter>
                    <DialogClose render={<Button variant="secondary">Cancel</Button>} />
                    <ButtonWithTooltip disabled={!newSortedItems.length} onClick={handleSave}>
                        Save changes
                    </ButtonWithTooltip>
                </DialogFooter>
            </DialogPopup>
        </Dialog>
    );
};

export default SortItemsDialog;
