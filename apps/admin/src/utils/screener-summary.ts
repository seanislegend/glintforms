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
        case 'single_choice': {
            const singleChoiceConfig = config as {
                correctOptionId: string;
                options: Array<{id: string; value: string}>;
                question: string;
            };
            return `Screening for respondents who answer "${singleChoiceConfig.question}" correctly`;
        }
        default:
            return 'Screening configuration';
    }
}
