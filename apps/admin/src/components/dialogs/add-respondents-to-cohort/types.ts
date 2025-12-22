import {z} from 'zod';

export const ageFilterSchema = z
    .object({
        max: z.string().optional(),
        min: z.string().optional(),
        type: z.union([z.enum(['equal', 'between', 'over', 'under']), z.literal('')]).optional(),
        value: z.string().optional()
    })
    .refine(
        data => {
            const type = data.type;
            if (!type) return true;
            if (type === 'between') {
                return (
                    data.min !== undefined &&
                    data.min !== '' &&
                    data.max !== undefined &&
                    data.max !== ''
                );
            }
            if (type === 'equal' || type === 'over' || type === 'under') {
                return data.value !== undefined && data.value !== '';
            }
            return true;
        },
        {
            message: 'age filter values are required',
            path: ['value']
        }
    );

export const filterSchema = z.object({
    age: ageFilterSchema.optional(),
    gender: z.string().optional(),
    genderQualifier: z.enum(['is', 'is_not']).optional(),
    locationCity: z.string().optional(),
    locationCityQualifier: z.enum(['is', 'is_not']).optional(),
    locationCountry: z.string().optional(),
    locationCountryQualifier: z.enum(['is', 'is_not']).optional(),
    survey: z.string().optional(),
    surveyQualifier: z.enum(['is', 'is_not']).optional()
});

export type FilterForm = z.infer<typeof filterSchema>;

