import {validate} from 'uuid';

export const parseRouteSegments = (all: string[]): Record<string, string[]> => {
    if (!all || all.length === 0) return {};
    const segmentsByModel: Record<string, string[]> = {};

    // skip the first segment as it's the base route (e.g., "surveys")
    for (let i = 1; i < all.length; i += 2) {
        const model = all[i - 1];
        const id = all[i];

        // skip if the id is not a valid uuid
        if (!validate(id)) continue;

        // only add if we have both model and id, and the id is not empty
        if (model && id && id.trim() !== '') {
            if (!segmentsByModel[model]) {
                segmentsByModel[model] = [];
            }
            segmentsByModel[model].push(id);
        }
    }

    return segmentsByModel;
};
