'use client';

import {EyeIcon} from '@phosphor-icons/react/dist/ssr/Eye';
import {EyeSlashIcon} from '@phosphor-icons/react/dist/ssr/EyeSlash';
import {useId, useState} from 'react';
import Input from './input';

const PasswordInput: React.FC<React.ComponentProps<'input'>> = ({className, type, ...props}) => {
    const id = useId();
    const [isVisible, setIsVisible] = useState<boolean>(false);

    const toggleVisibility = () => setIsVisible(prevState => !prevState);

    return (
        <div className="relative">
            <Input
                id={id}
                className="pe-9"
                placeholder="Password"
                type={isVisible ? 'text' : 'password'}
                {...props}
                autoComplete="off"
            />
            <button
                aria-label={isVisible ? 'Hide password' : 'Show password'}
                aria-pressed={isVisible}
                aria-controls="password"
                className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                onClick={toggleVisibility}
                type="button"
            >
                {isVisible ? (
                    <EyeSlashIcon className="size-5" aria-hidden="true" />
                ) : (
                    <EyeIcon className="size-5" aria-hidden="true" />
                )}
            </button>
        </div>
    );
};

export default PasswordInput;
