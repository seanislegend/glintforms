import {Badge} from '@glint/ui/badge';
import {Card, CardContent} from '@glint/ui/card';
import {isCodedQuestion} from '@/lib/surveys/answer-formatter';
import type {Question} from '@/types/question-and-answers';

interface Props {
    answerQuestionVersion: number;
    question: Question;
    versions: QuestionMetadata['versions'];
}

interface Revision {
    change: React.ReactNode;
    date: Date;
    version: number;
}

const QuestionRevisionsMatrix: React.FC<Props> = ({answerQuestionVersion, question, versions}) => {
    if (!versions) return null;

    const isCoded = isCodedQuestion(question.type);
    const revisions: Revision[] = [];

    if (versions.title) {
        for (const [versionStr, versionData] of Object.entries(versions.title)) {
            revisions.push({
                change: (
                    <>
                        <span className="font-medium">Title:</span> {versionData.value}
                    </>
                ),
                date: versionData.updatedAt,
                version: Number(versionStr)
            });
        }
    }

    if (versions.description) {
        for (const [versionStr, versionData] of Object.entries(versions.description)) {
            revisions.push({
                change: (
                    <>
                        <span className="font-medium">Description:</span> {versionData.value}
                    </>
                ),
                date: versionData.updatedAt,
                version: Number(versionStr)
            });
        }
    }

    if (isCoded && versions.options) {
        for (const [_, optionVersions] of Object.entries(versions.options)) {
            for (const [versionStr, versionData] of Object.entries(optionVersions)) {
                revisions.push({
                    change: (
                        <>
                            <span className="font-medium">Option value:</span> {versionData.value}
                        </>
                    ),
                    date: versionData.updatedAt,
                    version: Number(versionStr)
                });
            }
        }
    }

    revisions.sort((a, b) => b.version - a.version);
    if (revisions.length === 0) return null;

    return (
        <Card className="p-0 mt-4">
            <CardContent className="p-4">
                <div className="space-y-4 text-sm">
                    {revisions.map(revision => (
                        <div key={`${revision.version}-${revision.change}`}>
                            <strong className="font-medium">
                                #{revision.version}{' '}
                                {revision.date
                                    ? ` – ${new Date(revision.date).toLocaleDateString()}`
                                    : ''}{' '}
                            </strong>
                            <div className="mb-2">
                                {revision.version === question.metadata?.version && (
                                    <Badge size="sm" variant="success">
                                        Active version
                                    </Badge>
                                )}
                                {revision.version === answerQuestionVersion && (
                                    <Badge size="sm" variant="warning">
                                        Answered version
                                    </Badge>
                                )}
                            </div>
                            <span className="text-muted-foreground">{revision.change}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default QuestionRevisionsMatrix;
