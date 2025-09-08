import {motion} from 'motion/react';

interface Props {
    initial?: 'visible' | 'hidden';
    visible: boolean;
}

const ToggleVisibility: React.FC<React.ComponentProps<typeof motion.div> & Props> = ({
    children,
    initial,
    visible,
    ...props
}) => (
    <motion.div
        {...props}
        initial={initial || (visible ? 'visible' : 'hidden')}
        animate={visible ? 'visible' : 'hidden'}
        variants={{
            hidden: {opacity: 0, height: 0, y: -10},
            visible: {opacity: 1, height: 'auto', y: 0}
        }}
        transition={{type: 'spring', duration: 0.6, bounce: 0.2}}
        style={visible ? {overflow: 'visible'} : {overflow: 'hidden'}}
    >
        {children}
    </motion.div>
);

export default ToggleVisibility;
