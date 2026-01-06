import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import {getSession} from '@/lib/auth/server';
import {t} from '@/lib/i18n';
import {getShortName} from '@/utils/names';

const HomePage = async () => {
    const session = await getSession();

    return (
        <Container>
            <SectionHeader title={`${t('Welcome back')}, ${getShortName(session?.user?.name)}`} />
        </Container>
    );
};

export default HomePage;
