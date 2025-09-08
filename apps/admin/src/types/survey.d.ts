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
