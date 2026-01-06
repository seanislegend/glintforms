/**
 * Example usage of the translation system
 *
 * After running `bun translation extract`, all these strings will be:
 * 1. Extracted into locales/source.json
 * 2. Added to locales/en.json (with the text as the value)
 * 3. Added to other locale files as empty strings
 * 4. Available as typed keys in locales/keys.ts
 */

import {t} from './i18n';

export const WelcomeScreen = () => {
    return (
        <div>
            <h1>{t('Welcome to Glint')}</h1>
            <p>{t('Create surveys, collect responses, and analyse insights')}</p>
            <button>{t('Get started')}</button>
        </div>
    );
};

export const SurveyEditor = () => {
    return (
        <div>
            <h2>{t('Edit survey')}</h2>
            <button>{t('Save changes')}</button>
            <button>{t('Cancel')}</button>
            <button>{t('Delete survey')}</button>
        </div>
    );
};

export const ResponseDashboard = () => {
    return (
        <div>
            <h2>{t('Survey responses')}</h2>
            <p>{t('View and analyse all responses collected')}</p>
            <button>{t('Export data')}</button>
            <button>{t('Generate report')}</button>
        </div>
    );
};

// These will trigger warnings (not extracted):
export const DynamicExample = () => {
    const errorKey = 'error.notFound';

    // ⚠ Warning: Dynamic key not extracted
    return <div>{t(errorKey)}</div>;
};

export const InterpolationExample = () => {
    const name = 'John';

    // ⚠ Warning: Template with expression not extracted
    return <div>{t(`Hello ${name}`)}</div>;
};
