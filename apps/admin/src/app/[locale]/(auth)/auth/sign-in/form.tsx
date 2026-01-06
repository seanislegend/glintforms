'use client';

import FieldError from '@glint/form/field-error';
import Input from '@glint/form/input';
import {LABEL_CLASSNAME} from '@glint/form/label';
import {Alert, AlertDescription} from '@glint/ui/alert';
import Button from '@glint/ui/button';
import {t} from '@/lib/i18n';
import {useActionState} from 'react';
import {handleSubmit} from './action';

const Form = () => {
    const [state, action, pending] = useActionState(handleSubmit, {
        error: null,
        success: false
    });

    if (state?.success) {
        return (
            <Alert variant="success">
                <AlertDescription>{t('Success! Check your email for the login link')}</AlertDescription>
            </Alert>
        );
    }

    return (
        <form action={action}>
            <div className="grid gap-4">
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <label className={LABEL_CLASSNAME} htmlFor="email">
                            {t('Email')}
                        </label>
                        <Input
                            id="email"
                            name="email"
                            placeholder={t('me@example.com')}
                            required
                            type="email"
                        />
                        {state?.error && <FieldError error={[state.error]} />}
                    </div>
                    <Button className="w-full" pending={pending} type="submit">
                        {t('Login')}
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default Form;
