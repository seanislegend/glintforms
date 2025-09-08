import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from '@glint/ui/sidebar';
import {LightningIcon} from '@phosphor-icons/react/dist/ssr/Lightning';
import Link from 'next/link';
import type * as React from 'react';
import NavMain from './nav/main';
import NavSecondary from './nav/secondary';
import NavUser from './nav/user';

interface Props extends React.ComponentProps<typeof Sidebar> {}

export const AppSidebar: React.FC<Props> = ({...props}) => {
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                            render={<Link href="/" />}
                        >
                            <LightningIcon />
                            <span className="text-base font-semibold">Glint</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain />
                <NavSecondary className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
};
