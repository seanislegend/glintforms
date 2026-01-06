'use client';

import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList} from '@glint/ui/breadcrumb';
import Link from '@glint/ui/link';
import {useI18n} from '@/hooks/use-i18n';

const BreadcrumbSlot: React.FC = () => {
    const {t} = useI18n();

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink render={<Link href="/" />}>{t('Home')}</BreadcrumbLink>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );
};

export default BreadcrumbSlot;
