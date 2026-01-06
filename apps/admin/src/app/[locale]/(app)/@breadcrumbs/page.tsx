import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList} from '@glint/ui/breadcrumb';
import Link from 'next/link';

const BreadcrumbSlot: React.FC = () => {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );
};

export default BreadcrumbSlot;
