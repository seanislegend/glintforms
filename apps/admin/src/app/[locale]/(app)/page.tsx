import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import {getSession} from '@/lib/auth/server';
import {getServerI18n} from '@/lib/i18n-server';
import {getShortName} from '@/utils/names';

interface Props {
    params: Promise<{locale: Locale}>;
}

const HomePage: React.FC<Props> = async ({params}) => {
    const {locale} = await params;
    const session = await getSession();
    const {t} = await getServerI18n(locale);

    return (
        <Container>
            <SectionHeader title={`${t('Welcome back')}, ${getShortName(session?.user?.name)}`} />
        </Container>
    );
};

export default HomePage;
