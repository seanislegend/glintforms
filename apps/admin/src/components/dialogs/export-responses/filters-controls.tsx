'use client';

import {FormField} from '@glint/form/fields';
import {BasicCard} from '@glint/ui/card';
import ToggleVisibility from '@glint/ui/toggle-visibility';
import {t} from '@/lib/i18n';
import type {ColumnFiltersState} from '@tanstack/react-table';
import {useFormContext, useWatch} from 'react-hook-form';
import {humanise} from '@/utils/humanise';

interface Props {
    filters: ColumnFiltersState;
}

const ExportResponsesFiltersControls: React.FC<Props> = ({filters}) => {
    const {control} = useFormContext();
    const applyActiveFilters = useWatch({name: 'applyActiveFilters'});

    if (!filters || (Array.isArray(filters) && filters.length === 0)) {
        return null;
    }

    return (
        <div className="grid gap-3">
            <FormField
                control={control}
                description={t('Apply the active filters to the export.')}
                fieldType="switch"
                label={t('Apply active filters')}
                name="applyActiveFilters"
            />
            <ToggleVisibility visible={applyActiveFilters}>
                <BasicCard
                    description={t('The active filters will be applied to the export. If you want to remove or apply different filters, you can do so by changing the filters in the table.')}
                    title={t('Active filters')}
                >
                    <div className="grid gap-2 text-sm">
                        <div className="flex flex-row gap-2 justify-between border-b border-muted pb-2 text-muted-foreground">
                            <strong>{t('Filter')}</strong>
                            <strong>{t('Value')}</strong>
                        </div>
                        {filters.map(filter => (
                            <div key={filter.id} className="flex flex-row gap-2 justify-between">
                                <p>{humanise(filter.id)}</p>
                                <p>{filter.value?.toString()?.split(',').join(', ')}</p>
                            </div>
                        ))}
                    </div>
                </BasicCard>
            </ToggleVisibility>
        </div>
    );
};

export default ExportResponsesFiltersControls;
