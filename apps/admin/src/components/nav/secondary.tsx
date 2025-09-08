import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from '@glint/ui/sidebar';
import {GearIcon} from '@phosphor-icons/react/dist/ssr/Gear';
import {InfoIcon} from '@phosphor-icons/react/dist/ssr/Info';
import Link from 'next/link';
import type * as React from 'react';

const data: NavItem[] = [
    {Icon: GearIcon, title: 'Settings', url: '/settings'},
    {Icon: InfoIcon, title: 'Get Help', url: '/help'}
];

const NavSecondary: React.FC<React.ComponentPropsWithoutRef<typeof SidebarGroup>> = ({
    ...props
}) => {
    return (
        <SidebarGroup {...props}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {data.map(item => {
                        const Icon = item.Icon;
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    render={
                                        <Link href={item.url}>
                                            {Icon && <Icon className="!size-5" />}
                                            <span>{item.title}</span>
                                        </Link>
                                    }
                                />
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
};

export default NavSecondary;
