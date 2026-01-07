import {headers} from 'next/headers';
import {type NextRequest, NextResponse} from 'next/server';
import {auth} from '@/lib/auth/server';
import {getServerI18n} from '@/lib/i18n-server';
import {CONTENT_TYPES} from '@/lib/schemas/constants';
import {generateXLSForm} from '@/utils/generate-xlsform';
import {xlsformExportConfig} from '../questions-export-helpers';

export const POST = async (
    request: NextRequest,
    {params}: {params: Promise<{surveyId: string}>}
) => {
    const locale = request.headers.get('accept-language');
    const {t} = await getServerI18n(locale);

    try {
        const session = await auth.api.getSession({headers: await headers()});
        if (!session) return NextResponse.json({error: t('Unauthorized')}, {status: 401});

        const {surveyId} = await params;

        // fetch questions and survey data
        const questionsData = await xlsformExportConfig.dataFetcher(surveyId);
        const surveyData = await xlsformExportConfig.surveyFetcher(surveyId);

        if (!surveyData.length) {
            return NextResponse.json({error: t('Survey not found')}, {status: 404});
        }

        const surveySheet = xlsformExportConfig.surveyMapper(questionsData);
        const choicesSheet = xlsformExportConfig.choicesMapper(questionsData);
        const settingsSheet = xlsformExportConfig.settingsMapper(surveyData);
        const content = await generateXLSForm({
            survey: surveySheet,
            choices: choicesSheet,
            settings: settingsSheet
        });
        const filename = `${xlsformExportConfig.filenamePrefix}-${surveyId}.xlsx`;

        return new NextResponse(content, {
            headers: {
                'Content-Type': CONTENT_TYPES.xlsform,
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });
    } catch (error) {
        console.error('XLSForm export error:', error);
        return NextResponse.json({error: t('XLSForm export failed')}, {status: 500});
    }
};
