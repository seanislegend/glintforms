import {Separator} from '@glint/ui/separator';
import {SidebarTrigger} from '@glint/ui/sidebar';

interface Props {
    breadcrumbs: React.ReactNode;
}

const SiteHeader: React.FC<Props> = ({breadcrumbs}) => {
    return (
        <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-lg flex h-[var(--header-height)] shrink-0 items-center gap-2 border-accent border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[var(--header-height)]">
            <div className="flex w-full items-center gap-1 px-1 lg:gap-2">
                <SidebarTrigger />
                <Separator
                    orientation="vertical"
                    className="mr-2 ml-0 data-[orientation=vertical]:h-4"
                />
                {breadcrumbs}
                <div className="ml-auto flex items-center gap-2"></div>
            </div>
        </header>
    );
};

export default SiteHeader;
