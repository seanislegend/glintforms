import {activities, db, questions, surveys, user} from '@glint/database';
import {desc, eq} from 'drizzle-orm';
import {headers} from 'next/headers';
import {type NextRequest, NextResponse} from 'next/server';
import {auth} from '@/lib/auth/server';
import {convertToQuestionsWithAi} from '@/lib/surveys/ai-question-converter';
import {parseImportFile} from '@/utils/parse-import-file';

export const POST = async (
    request: NextRequest,
    {params}: {params: Promise<{surveyId: string}>}
) => {
    try {
        const session = await auth.api.getSession({headers: await headers()});
        if (!session) {
            return NextResponse.json({error: 'Unauthorized'}, {status: 401});
        }

        const userProfile = await db.select().from(user).where(eq(user.id, session.user.id));
        if (!userProfile?.[0]?.tenantId) {
            return NextResponse.json({error: 'User not found'}, {status: 404});
        }

        const tenantId = userProfile[0].tenantId;
        const {surveyId} = await params;
        const survey = await db
            .select()
            .from(surveys)
            .where(eq(surveys.id, surveyId) && eq(surveys.tenantId, tenantId));

        if (survey.length === 0) {
            return NextResponse.json({error: 'Survey not found or access denied'}, {status: 404});
        }

        if (survey[0]?.status !== 'draft') {
            return NextResponse.json(
                {error: 'Cannot import questions into a survey that is no longer in draft status'},
                {status: 400}
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({error: 'No file provided'}, {status: 400});
        }

        const validMimeTypes = [
            'text/csv',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        const fileName = file.name.toLowerCase();
        const validExtensions = ['.csv', '.xlsx', '.xls'];
        const isValidType =
            validMimeTypes.includes(file.type) ||
            validExtensions.some(ext => fileName.endsWith(ext));

        if (!isValidType) {
            return NextResponse.json({error: 'Please upload a CSV or XLSX file'}, {status: 400});
        }

        const parsedData = await parseImportFile(file);
        const {
            questions: convertedQuestions,
            errors,
            warnings
        } = await convertToQuestionsWithAi(parsedData);

        if (errors && errors.length > 0) {
            return NextResponse.json({error: `Import failed: ${errors.join(', ')}`}, {status: 400});
        }

        if (convertedQuestions.length === 0) {
            return NextResponse.json(
                {error: 'No valid questions found in the uploaded file'},
                {status: 400}
            );
        }

        const existingQuestions = await db
            .select({order: questions.order})
            .from(questions)
            .where(eq(questions.surveyId, surveyId))
            .orderBy(desc(questions.order))
            .limit(1);
        const startOrder =
            existingQuestions.length > 0 && existingQuestions[0]?.order
                ? existingQuestions[0].order + 1
                : 1;
        const transformedQuestions = convertedQuestions.map((question, index) => ({
            ...question,
            id: crypto.randomUUID(),
            metadata: {imported: true},
            options:
                question.type === 'text' || question.type === 'number'
                    ? []
                    : question.options.map((option: string) => ({
                          description: '',
                          id: crypto.randomUUID(),
                          value: option
                      })),
            order: startOrder + index,
            surveyId
        }));

        await db.transaction(async tx => {
            for (const question of transformedQuestions) {
                await tx.insert(questions).values(question);
            }

            await tx.insert(activities).values({
                details: {
                    surveyTitle: survey[0]?.title ?? 'Unknown',
                    importedCount: transformedQuestions.length,
                    warnings: warnings || []
                },
                surveyId,
                tenantId,
                text: `Imported ${transformedQuestions.length} questions`,
                type: 'created',
                userId: session.user.id
            });
        });

        return NextResponse.json({
            success: true,
            importedCount: transformedQuestions.length,
            warnings: warnings || []
        });
    } catch (error) {
        return NextResponse.json(
            {error: error instanceof Error ? error.message : 'Failed to import questions'},
            {status: 500}
        );
    }
};
