import {useAtom} from 'jotai';
import {highlightsAtom} from '@/lib/store';

const useHighlight = () => {
    const [triggers, setTriggers] = useAtom(highlightsAtom);

    const highlight = (id: string) => {
        setTriggers({
            ...triggers,
            [id]: (triggers[id] || 0) + 1
        });
    };

    return {
        highlight
    };
};

export default useHighlight;
