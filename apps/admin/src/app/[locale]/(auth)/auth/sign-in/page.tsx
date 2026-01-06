import {Card, CardContent, CardDescription, CardHeader} from '@glint/ui/card';
import TextLink from '@glint/ui/text-link';
import {t} from '@/lib/i18n';
import {LightningIcon} from '@phosphor-icons/react/dist/ssr/Lightning';
import Form from './form';

const SignInPage: React.FC = () => {
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <div className="flex flex-col gap-6">
                    <Card className="bg-white">
                        <CardHeader className="text-center">
                            <h1 className="inline-flex gap-0.5 justify-center items-center text-xl font-semibold">
                                <LightningIcon className="size-5" />
                                <span>Glint</span>
                            </h1>
                            <CardDescription>
                                {t(
                                    "Enter your email address. We'll send you an email containing your login link."
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form />
                        </CardContent>
                    </Card>
                    <div className="text-muted-foreground text-center text-xs text-balance">
                        {t('By clicking continue, you agree to our')}{' '}
                        <TextLink href="#">{t('Terms of Service')}</TextLink> {t('and')}{' '}
                        <TextLink href="#">{t('Privacy Policy')}</TextLink>.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
