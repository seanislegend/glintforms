import {SidebarInset, SidebarProvider} from '@glint/ui/sidebar';
import {AppSidebar} from '@/components/app-sidebar';
import SiteHeader from '@/components/site-header';

interface Props {
    breadcrumbs: React.ReactNode;
    children: React.ReactNode;
}

const AppLayout: React.FC<React.PropsWithChildren<Props>> = ({breadcrumbs, children}) => {
    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader breadcrumbs={breadcrumbs} />
                <main className="flex flex-1 flex-col @container/main">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default AppLayout;
