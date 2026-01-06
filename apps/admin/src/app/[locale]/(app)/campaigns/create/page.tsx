import Container from '@glint/ui/container';
import Form from './form';

interface Props {
    params: Promise<{locale: Locale}>;
}

const Page: React.FC<Props> = async ({params}) => {
    await params;

    return (
        <Container>
            <Form />
        </Container>
    );
};

export default Page;
