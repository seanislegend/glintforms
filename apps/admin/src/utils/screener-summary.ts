import type {screeners} from '@glint/database';
import {COUNTRY_CODE_LABELS} from './country-codes';

type ScreenerRecord = Pick<typeof screeners.$inferSelect, 'config' | 'type'>;

export function getScreenerSummary(screener: ScreenerRecord): string {
    const {config, type} = screener;

    switch (type) {
        case 'age': {
            const ageConfig = config as {operator: 'over' | 'under'; value: number};
            const operatorText = ageConfig.operator === 'over' ? 'over' : 'under';
            return `Screening for respondents ${operatorText} the age of ${ageConfig.value}`;
        }
        case 'location': {
            const locationConfig = config as {countries: string[]};
            const countryNames = locationConfig.countries.map(
                code => COUNTRY_CODE_LABELS[code] || code
            );
            if (countryNames.length === 1) {
                return `Screening for respondents in ${countryNames[0]}.`;
            }
            if (countryNames.length === 2) {
                return `Screening for respondents in ${countryNames[0]} and ${countryNames[1]}.`;
            }
            const allButLast = countryNames.slice(0, -1);
            const lastCountry = countryNames.at(-1);
            return `Screening for respondents in ${allButLast.join(', ')}, and ${lastCountry}.`;
        }
        case 'selection': {
            const selectionConfig = config as {
                options: Array<{id: string; passes: boolean; value: string}>;
                question: string;
            };
            const passingOptions = selectionConfig.options.filter(opt => opt.passes);
            if (passingOptions.length === 1 && passingOptions[0]) {
                return `Screening for respondents who answer "${selectionConfig.question}" with "${passingOptions[0].value}"`;
            }
            return `Screening for respondents who answer "${selectionConfig.question}" with one of ${passingOptions.length} options`;
        }
        default:
            return 'Screening configuration';
    }
}
