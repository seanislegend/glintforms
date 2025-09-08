import {Badge} from '@glint/ui/badge';

const STATUS_VARIANTS = {
    pass: 'success',
    fail: 'error',
    missing: 'stale'
} as const;

const AuthenticityStatusBadge = ({pass}: {pass: boolean}) => {
    const variant =
        STATUS_VARIANTS[typeof pass === 'boolean' ? (pass ? 'pass' : 'fail') : 'missing'];
    return (
        <Badge variant={variant}>
            {typeof pass === 'boolean' ? (pass ? 'Pass' : 'Fail') : 'Missing'}
        </Badge>
    );
};

export default AuthenticityStatusBadge;
