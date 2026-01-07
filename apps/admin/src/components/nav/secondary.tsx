'use client';

import Link from '@glint/ui/link';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from '@glint/ui/sidebar';
import {GearIcon} from '@phosphor-icons/react/dist/ssr/Gear';
import {InfoIcon} from '@phosphor-icons/react/dist/ssr/Info';
import type * as React from 'react';
import {useI18n} from '@/hooks/use-i18n';

const NavSecondary: React.FC<React.ComponentPropsWithoutRef<typeof SidebarGroup>> = ({
    ...props
}) => {
    const {t} = useI18n();

    const data: NavItem[] = [
        {Icon: GearIcon, title: t('Settings'), url: '/settings'},
        {Icon: InfoIcon, title: t('Get Help'), url: '/help'}
    ];

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
