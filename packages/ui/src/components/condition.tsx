interface Props {
    condition: boolean;
    fallbackWrapper?: (children: React.ReactNode) => React.ReactNode;
    wrapper?: (children: React.ReactNode) => React.ReactNode;
}

const Condition: React.FC<React.PropsWithChildren<Props>> = ({
    children,
    condition,
    fallbackWrapper,
    wrapper
}) => {
    if (condition && wrapper) {
        return <>{wrapper(children)}</>;
    } else if (fallbackWrapper) {
        return <>{fallbackWrapper(children)}</>;
    }

    return children;
};

export default Condition;
