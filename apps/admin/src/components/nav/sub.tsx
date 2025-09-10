'use client';

import {Collapsible, CollapsibleContent, CollapsibleTrigger} from '@glint/ui/collapsible';
import {
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem
} from '@glint/ui/sidebar';
import {cn} from '@glint/ui/utils';
import {CaretRightIcon} from '@phosphor-icons/react/dist/ssr/CaretRight';
import {useQuery} from '@tanstack/react-query';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useState} from 'react';
import {NavMainLink} from '@/components/nav/main';
import {useSession} from '@/hooks/use-session';
import {useTRPC} from '@/lib/trpc/react';

interface Props {
    href: string;
    id: string;
    Icon: React.ComponentType<{className?: string}>;
    title: string;
}

type ItemKey = 'campaigns' | 'cohorts' | 'surveys';

const SubNav: React.FC<Props> = ({href, id, Icon, title}) => {
    const pathname = usePathname();
    const {session} = useSession();
    const trpc = useTRPC();
    const {data: items} = useQuery({...trpc.nav.getAll.queryOptions(), enabled: !!session});
    const [isOpen, setIsOpen] = useState(false);

    const isActivePath = (path: string, pathId?: string) => {
        if (pathId === 'all') return pathname === path;
        return pathname.startsWith(path);
    };

    const hasItems = items?.[id as ItemKey] && items[id as ItemKey].length > 0;
    const itemsWithAllLink = [
        ...(items?.[id as ItemKey] || []),
        {href, id: 'all', title: 'View all'}
    ];
    const itemsForNav = itemsWithAllLink.map(item => {
        const itemHref = item.id === 'all' ? href : `${href}/${item.id}`;
        return {...item, href: itemHref, isActive: isActivePath(itemHref, item.id)};
    });
    const anyItemIsActive = itemsForNav.some(item => item.isActive);

    // shut the collapsible when we change route
    useEffect(() => {
        if (pathname && !anyItemIsActive) {
            setIsOpen(false);
        }
    }, [anyItemIsActive, pathname]);

    if (!hasItems) {
        return <NavMainLink href={href} Icon={Icon} isActive={isActivePath(href)} title={title} />;
    }

    return (
        <Collapsible
            open={isOpen || anyItemIsActive}
            onOpenChange={setIsOpen}
            className="group/collapsible"
        >
            <SidebarMenuItem>
                <CollapsibleTrigger render={<SidebarMenuButton />}>
                    {Icon && <Icon className="!size-5" />}
                    <span>{title}</span>
                    <CaretRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {itemsForNav.map(item => (
                            <SidebarMenuSubItem key={item.id}>
                                <SidebarMenuSubButton
                                    isActive={item.isActive}
                                    render={<Link href={item.href} />}
                                >
                                    <span
                                        className={cn(item.id === 'all' && 'text-muted-foreground')}
                                    >
                                        {'title' in item ? item.title : item.name}
                                    </span>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
};

export default SubNav;
