'use client';

import {Avatar, AvatarFallback} from '@glint/ui/avatar';
import {
    Menu,
    MenuGroup,
    MenuItem,
    MenuLabel,
    MenuPopup,
    MenuSeparator,
    MenuTrigger
} from '@glint/ui/menu';
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar} from '@glint/ui/sidebar';
import {t} from '@/lib/i18n';
import {CaretUpDownIcon} from '@phosphor-icons/react/dist/ssr/CaretUpDown';
import {SignOutIcon} from '@phosphor-icons/react/dist/ssr/SignOut';
import {useState} from 'react';
import ConfirmationDialog from '@/components/dialogs/confirmation';
import {useSession} from '@/hooks/use-session';
import {getInitials} from '@/utils/names';

const NavUser: React.FC = () => {
    const {isMobile} = useSidebar();
    const {session} = useSession();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const user = session?.user;

    const handleLogout = () => {
        // implement logout logic here
        console.log('logout clicked');
    };

    return (
        <>
            <SidebarMenu>
                {user && (
                    <SidebarMenuItem>
                        <Menu>
                            <MenuTrigger
                                render={
                                    <SidebarMenuButton
                                        size="lg"
                                        className="rounded data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                    />
                                }
                            >
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarFallback className="rounded-lg">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{user.name}</span>
                                    <span className="truncate text-xs">{user.email}</span>
                                </div>
                                <CaretUpDownIcon className="ml-auto size-4" />
                            </MenuTrigger>
                            <MenuPopup
                                className="min-w-56 rounded-lg"
                                positionAlign="end"
                                positionSide={isMobile ? 'bottom' : 'right'}
                            >
                                <MenuGroup>
                                    <MenuLabel className="p-0 font-normal">
                                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                            <Avatar className="h-8 w-8 rounded-lg">
                                                <AvatarFallback className="rounded-lg">
                                                    {getInitials(user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="grid flex-1 text-left text-sm leading-tight">
                                                <span className="truncate font-medium">
                                                    {user.name}
                                                </span>
                                                <span className="truncate text-xs">
                                                    {user.email}
                                                </span>
                                            </div>
                                        </div>
                                    </MenuLabel>
                                </MenuGroup>
                                <MenuSeparator />
                                <MenuItem
                                    variant="destructive"
                                    onClick={() => setShowLogoutConfirm(true)}
                                >
                                    <SignOutIcon />
                                    {t('Log out')}
                                </MenuItem>
                            </MenuPopup>
                        </Menu>
                    </SidebarMenuItem>
                )}
            </SidebarMenu>
            {user && (
                <ConfirmationDialog
                    description={t(
                        'Are you sure you want to log out? You will need to sign in again to access your account.'
                    )}
                    onConfirm={handleLogout}
                    onOpenChange={setShowLogoutConfirm}
                    open={showLogoutConfirm}
                    title={t('Confirm logout')}
                    variant="destructive"
                />
            )}
        </>
    );
};

export default NavUser;
