type SurveyStatus = 'draft' | 'testing' | 'active' | 'complete' | 'archived';

interface GeolocationData {
    city?: string;
    country?: string;
    region?: string;
}

interface SurveyDetails {
    campaignId: string;
    campaignTitle?: string;
    campaign?: CampaignDetails;
    createdAt: Date;
    description: string | null;
    id: string;
    launchedAt?: Date | null;
    slug: string;
    status: SurveyStatus;
    title: string;
    updatedAt: Date;
}

interface SurveyRecentActivity {
    ctaLabel: string;
    ctaUrl: string;
    date: Date;
    icon?: React.ReactNode;
    id: string;
    text: string;
}

interface QuestionMetadataVersions {
    [versionNumber: string]: {
        updatedAt: Date;
        value: string;
    };
}

interface QuestionMetadata {
    optionValues?: {
        [optionId: string]: string;
    };
    versions?: {
        description?: QuestionMetadataVersions;
        options?: {
            [optionId: string]: QuestionMetadataVersions;
        };
        title?: QuestionMetadataVersions;
    };
    version?: number;
}
