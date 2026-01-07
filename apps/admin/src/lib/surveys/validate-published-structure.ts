import type {Question} from '@/lib/schemas/questions';

interface HasPublishedStructureChangesProps {
    existingQuestionsMap: Map<
        string,
        {
            description: string | null;
            metadata: unknown;
            options: unknown;
            title: string;
            type: string;
        }
    >;
    deletedQuestionIds: Record<string, boolean>;
    questions: Question[];
}

export const hasPublishedStructureChanges = ({
    existingQuestionsMap,
    deletedQuestionIds,
    questions
}: HasPublishedStructureChangesProps) => {
    // prevent deleting questions
    if (deletedQuestionIds && Object.keys(deletedQuestionIds).length > 0) {
        /* i18n */
        return 'Cannot delete questions from a survey that is no longer in draft status';
    }

    const existingQuestionIds = new Set(Array.from(existingQuestionsMap.keys()));

    // check for new questions or structural changes
    for (const q of questions) {
        // prevent adding new questions
        if (!existingQuestionIds.has(q.id)) {
            /* i18n */
            return 'Cannot add new questions to a survey that is no longer in draft status';
        }

        const existing = existingQuestionsMap.get(q.id);
        if (existing) {
            // prevent changing question type
            if (existing.type !== q.type) {
                /* i18n */
                return 'Cannot change question type for a survey that is no longer in draft status';
            }

            // prevent adding or removing options (check option count)
            const existingOptions = Array.isArray(existing.options) ? existing.options : [];
            const newOptions = Array.isArray(q.options) ? q.options : [];
            if (newOptions.length !== existingOptions.length) {
                /* i18n */
                return 'Cannot add or remove options from questions in a survey that is no longer in draft status';
            }

            // prevent reordering options (check option IDs are in same order)
            for (let i = 0; i < existingOptions.length; i++) {
                const existingOpt = existingOptions[i] as {id?: string};
                const newOpt = newOptions[i] as {id?: string};
                if (existingOpt?.id && newOpt?.id && existingOpt.id !== newOpt.id) {
                    /* i18n */
                    return 'Cannot reorder options in a survey that is no longer in draft status';
                }
            }
        }
    }
};
