import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import {getSession} from '@/lib/auth/server';
import {getShortName} from '@/utils/names';

const HomePage = async () => {
    const session = await getSession();

    return (
        <Container>
            <SectionHeader title={`Welcome back, ${getShortName(session?.user?.name)}`} />
        </Container>
    );
};

export default HomePage;
