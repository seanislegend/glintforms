interface Props {
    error?: string[];
}

const FieldError: React.FC<React.PropsWithChildren<Props>> = ({children, error}) => (
    <>
        {children}
        {error && error.length > 0 && <p className="text-sm -mt-1 text-red-500">{error[0]}</p>}
    </>
);

export default FieldError;
