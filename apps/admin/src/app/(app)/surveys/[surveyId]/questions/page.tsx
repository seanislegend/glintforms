import {QuestionEditorForm, QuestionEditorWrapper} from '@/components/question-editor';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';

interface Props {
    params: Promise<{surveyId: string}>;
}

const QuestionEditorPage: React.FC<Props> = async ({params}) => {
    const {surveyId} = await params;
    prefetch(trpc.surveys.get.queryOptions(surveyId));

    return (
        <HydrateClient>
            <QuestionEditorWrapper>
                <QuestionEditorForm />
            </QuestionEditorWrapper>
        </HydrateClient>
    );
};

export default QuestionEditorPage;
