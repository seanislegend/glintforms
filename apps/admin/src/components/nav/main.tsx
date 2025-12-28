'use client';

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from '@glint/ui/sidebar';
import {ClipboardTextIcon} from '@phosphor-icons/react/dist/ssr/ClipboardText';
import {FunnelIcon} from '@phosphor-icons/react/dist/ssr/Funnel';
import {HouseIcon} from '@phosphor-icons/react/dist/ssr/House';
import {MegaphoneIcon} from '@phosphor-icons/react/dist/ssr/Megaphone';
import {UsersIcon} from '@phosphor-icons/react/dist/ssr/Users';
import {UsersThreeIcon} from '@phosphor-icons/react/dist/ssr/UsersThree';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Suspense} from 'react';
import SubNav from '@/components/nav/sub';

const data = [
    {href: '/', Icon: HouseIcon, title: 'Dashboard'},
    {href: '/campaigns', Icon: MegaphoneIcon, title: 'Campaigns', subnav: 'campaigns'},
    {href: '/surveys', Icon: ClipboardTextIcon, title: 'Surveys', subnav: 'surveys'},
    {href: '/respondents', Icon: UsersIcon, title: 'Respondents', subnav: 'respondents'},
    {href: '/cohorts', Icon: UsersThreeIcon, title: 'Cohorts', subnav: 'cohorts'},
    {href: '/screeners', Icon: FunnelIcon, title: 'Screeners', subnav: 'screeners'}
];

export const NavMainLink: React.FC<{
    href: string;
    Icon: React.ComponentType<{className?: string}>;
    isActive: boolean;
    title: string;
}> = ({href, Icon, isActive, title}) => {
    return (
        <SidebarMenuButton isActive={isActive} render={<Link href={href} />}>
            {Icon && <Icon className="!size-5" />}
            <span>{title}</span>
        </SidebarMenuButton>
    );
};

const NavMain: React.FC = () => {
    const pathname = usePathname();

    const isActivePath = (path: string) => {
        if (path === '/') return pathname === path;
        return pathname.startsWith(path);
    };

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {data.map(item => {
                        const linkProps = {...item, isActive: isActivePath(item.href)};

                        if (item.subnav) {
                            return (
                                <Suspense
                                    key={item.title}
                                    fallback={<NavMainLink {...linkProps} />}
                                >
                                    <SubNav {...linkProps} id={item.subnav} />
                                </Suspense>
                            );
                        }

                        return (
                            <SidebarMenuItem key={item.title}>
                                <NavMainLink {...linkProps} />
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
};

export default NavMain;
