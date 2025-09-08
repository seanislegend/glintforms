import {describe, expect, it} from 'vitest';
import {createResponseSchema} from '../src/survey-response';

type MockQuestion = {
    allowOther: boolean;
    createdAt: Date;
    description: string | null;
    id: string;
    metadata: unknown;
    options: unknown;
    order: number;
    randomiseOptionsOrder: boolean;
    required: boolean;
    surveyId: string;
    title: string;
    type: string;
    updatedAt: Date;
    validations: unknown;
};

// helper function to create a valid answer object
const createAnswer = (value: any) => ({
    endedAt: new Date().toISOString(),
    startedAt: new Date(Date.now() - 1000).toISOString(),
    wasSkipped: false,
    value
});

describe('createResponseSchema', () => {
    describe('text questions', () => {
        it('validates required text questions', () => {
            const testQuestions: MockQuestion[] = [
                {id: 'q1', type: 'text', required: true, options: []} as any
            ];
            const schema = createResponseSchema(testQuestions);
            // valid response
            expect(() => schema.parse({answers: {q1: createAnswer('test answer')}})).not.toThrow();
            // invalid - empty string
            expect(() => schema.parse({answers: {q1: createAnswer('')}})).toThrow();
            // invalid - missing answer
            expect(() => schema.parse({answers: {}})).toThrow();
        });

        it('validates optional text questions', () => {
            const testQuestions: MockQuestion[] = [
                {id: 'q1', type: 'text', required: false, options: []} as any
            ];
            const schema = createResponseSchema(testQuestions);
            // valid responses
            expect(() => schema.parse({answers: {q1: createAnswer('test answer')}})).not.toThrow();
            expect(() => schema.parse({answers: {q1: createAnswer('')}})).not.toThrow();
            expect(() => schema.parse({answers: {q1: createAnswer(null)}})).not.toThrow();
            expect(() => schema.parse({answers: {}})).toThrow();
        });

        it('validates text questions with minLength validation', () => {
            const testQuestions: MockQuestion[] = [
                {
                    id: 'q1',
                    type: 'text',
                    required: true,
                    options: [],
                    validations: [{id: 'v1', type: 'minLength', value: 5}]
                } as any
            ];
            const schema = createResponseSchema(testQuestions);
            // valid response - meets minimum length
            expect(() => schema.parse({answers: {q1: createAnswer('valid answer')}})).not.toThrow();
            // invalid - too short
            expect(() => schema.parse({answers: {q1: createAnswer('hi')}})).toThrow();
            // invalid - empty string
            expect(() => schema.parse({answers: {q1: createAnswer('')}})).toThrow();
        });

        it('validates text questions with maxLength validation', () => {
            const testQuestions: MockQuestion[] = [
                {
                    id: 'q1',
                    type: 'text',
                    required: true,
                    options: [],
                    validations: [{id: 'v1', type: 'maxLength', value: 10}]
                } as any
            ];
            const schema = createResponseSchema(testQuestions);
            // valid response - within limit
            expect(() => schema.parse({answers: {q1: createAnswer('valid')}})).not.toThrow();
            // invalid - too long
            expect(() => schema.parse({answers: {q1: createAnswer('this is too long')}})).toThrow();
        });

        it('validates text questions with minLength and maxLength validation', () => {
            const testQuestions: MockQuestion[] = [
                {
                    id: 'q1',
                    type: 'text',
                    required: true,
                    options: [],
                    validations: [
                        {id: 'v1', type: 'minLength', value: 3},
                        {id: 'v2', type: 'maxLength', value: 10}
                    ]
                } as any
            ];
            const schema = createResponseSchema(testQuestions);
            // valid response - within range
            expect(() => schema.parse({answers: {q1: createAnswer('hello')}})).not.toThrow();
            expect(() => schema.parse({answers: {q1: createAnswer('hello wor')}})).not.toThrow();
            // invalid - too short
            expect(() => schema.parse({answers: {q1: createAnswer('hi')}})).toThrow();
            // invalid - too long
            expect(() => schema.parse({answers: {q1: createAnswer('this is too long')}})).toThrow();
        });

        it('validates text questions with multiple validations', () => {
            const testQuestions: MockQuestion[] = [
                {
                    id: 'q1',
                    type: 'text',
                    required: true,
                    options: [],
                    validations: [
                        {id: 'v1', type: 'minLength', value: 5},
                        {id: 'v2', type: 'maxLength', value: 20},
                        {id: 'v3', type: 'email'}
                    ]
                } as any
            ];
            const schema = createResponseSchema(testQuestions);
            // valid response - meets all validations
            expect(() =>
                schema.parse({answers: {q1: createAnswer('valid@email.com')}})
            ).not.toThrow();
            // invalid - too short
            expect(() => schema.parse({answers: {q1: createAnswer('hi@me')}})).toThrow();
            // invalid - too long
            expect(() =>
                schema.parse({answers: {q1: createAnswer('verylongemail@example.com')}})
            ).toThrow();
            // invalid - not an email
            expect(() => schema.parse({answers: {q1: createAnswer('not an email')}})).toThrow();
        });

        it('validates text questions with email validation', () => {
            const testQuestions: MockQuestion[] = [
                {
                    id: 'q1',
                    type: 'text',
                    required: true,
                    options: [],
                    validations: [{id: 'v1', type: 'email'}]
                } as any
            ];
            const schema = createResponseSchema(testQuestions);
            // valid response - valid email
            expect(() =>
                schema.parse({answers: {q1: createAnswer('test@example.com')}})
            ).not.toThrow();
            expect(() =>
                schema.parse({answers: {q1: createAnswer('user.name@domain.co.uk')}})
            ).not.toThrow();
            // invalid - not an email
            expect(() => schema.parse({answers: {q1: createAnswer('not an email')}})).toThrow();
            expect(() => schema.parse({answers: {q1: createAnswer('test@')}})).toThrow();
            expect(() => schema.parse({answers: {q1: createAnswer('@example.com')}})).toThrow();
        });

        it('validates text questions with url validation', () => {
            const testQuestions: MockQuestion[] = [
                {
                    id: 'q1',
                    type: 'text',
                    required: true,
                    options: [],
                    validations: [{id: 'v1', type: 'url'}]
                } as any
            ];
            const schema = createResponseSchema(testQuestions);
            // valid response - valid urls
            expect(() =>
                schema.parse({answers: {q1: createAnswer('https://example.com')}})
            ).not.toThrow();
            expect(() =>
                schema.parse({answers: {q1: createAnswer('http://subdomain.example.co.uk/path')}})
            ).not.toThrow();
            expect(() =>
                schema.parse({answers: {q1: createAnswer('https://example.com?param=value')}})
            ).not.toThrow();
            // invalid - not a url
            expect(() => schema.parse({answers: {q1: createAnswer('not a url')}})).toThrow();
            expect(() => schema.parse({answers: {q1: createAnswer('example.com')}})).toThrow();
        });

        it('validates text questions with multiple validations', () => {
            const testQuestions: MockQuestion[] = [
                {
                    id: 'q1',
                    type: 'text',
                    required: true,
                    options: [],
                    validations: [
                        {id: 'v1', type: 'minLength', value: 5},
                        {id: 'v2', type: 'maxLength', value: 20},
                        {id: 'v3', type: 'email'}
                    ]
                } as any
            ];
            const schema = createResponseSchema(testQuestions);
            // valid response - meets all validations
            expect(() =>
                schema.parse({answers: {q1: createAnswer('valid@email.com')}})
            ).not.toThrow();
            // invalid - too short
            expect(() => schema.parse({answers: {q1: createAnswer('hi@me')}})).toThrow();
            // invalid - too long
            expect(() =>
                schema.parse({answers: {q1: createAnswer('verylongemail@example.com')}})
            ).toThrow();
            // invalid - not an email
            expect(() => schema.parse({answers: {q1: createAnswer('not an email')}})).toThrow();
        });
    });

    describe('number questions', () => {
        it('validates required number questions', () => {
            const testQuestions: MockQuestion[] = [
                {id: 'q1', type: 'number', required: true, options: []} as any
            ];
            const schema = createResponseSchema(testQuestions);
            // valid response
            expect(() => schema.parse({answers: {q1: createAnswer(42)}})).not.toThrow();
            expect(() => schema.parse({answers: {q1: createAnswer(0)}})).not.toThrow();
            expect(() => schema.parse({answers: {q1: createAnswer(-5)}})).not.toThrow();
            // invalid - string
            expect(() => schema.parse({answers: {q1: createAnswer('not a number')}})).toThrow();
        });

        it('validates optional number questions', () => {
            const testQuestions: MockQuestion[] = [
                {id: 'q1', type: 'number', required: false, options: []} as any
            ];
            const schema = createResponseSchema(testQuestions);
            // valid responses
            expect(() => schema.parse({answers: {q1: createAnswer(42)}})).not.toThrow();
            expect(() => schema.parse({answers: {q1: createAnswer(null)}})).not.toThrow();
            expect(() => schema.parse({answers: {}})).toThrow();
        });

        it('validates number questions with min validation', () => {
            const testQuestions: MockQuestion[] = [
                {
                    id: 'q1',
                    type: 'number',
                    required: true,
                    options: [],
                    validations: [{id: 'v1', type: 'min', value: 10}]
                } as any
            ];
            const schema = createResponseSchema(testQuestions);
            // valid response - meets minimum
            expect(() => schema.parse({answers: {q1: createAnswer(15)}})).not.toThrow();
            expect(() => schema.parse({answers: {q1: createAnswer(10)}})).not.toThrow();
            // invalid - below minimum
            expect(() => schema.parse({answers: {q1: createAnswer(5)}})).toThrow();
            expect(() => schema.parse({answers: {q1: createAnswer(-5)}})).toThrow();
        });

        it('validates number questions with max validation', () => {
            const testQuestions: MockQuestion[] = [
                {
                    id: 'q1',
                    type: 'number',
                    required: true,
                    options: [],
                    validations: [{id: 'v1', type: 'max', value: 100}]
                } as any
            ];
            const schema = createResponseSchema(testQuestions);
            // valid response - within limit
            expect(() => schema.parse({answers: {q1: createAnswer(50)}})).not.toThrow();
            expect(() => schema.parse({answers: {q1: createAnswer(100)}})).not.toThrow();
            // invalid - above maximum
            expect(() => schema.parse({answers: {q1: createAnswer(150)}})).toThrow();
        });

        it('validates number questions with min and max validation', () => {
            const testQuestions: MockQuestion[] = [
                {
                    id: 'q1',
                    type: 'number',
                    required: true,
                    options: [],
                    validations: [
                        {id: 'v1', type: 'min', value: 1},
                        {id: 'v2', type: 'max', value: 10}
                    ]
                } as any
            ];
            const schema = createResponseSchema(testQuestions);
            // valid response - within range
            expect(() => schema.parse({answers: {q1: createAnswer(5)}})).not.toThrow();
            expect(() => schema.parse({answers: {q1: createAnswer(1)}})).not.toThrow();
            expect(() => schema.parse({answers: {q1: createAnswer(10)}})).not.toThrow();
            // invalid - below minimum
            expect(() => schema.parse({answers: {q1: createAnswer(0)}})).toThrow();
            // invalid - above maximum
            expect(() => schema.parse({answers: {q1: createAnswer(15)}})).toThrow();
        });
    });

    describe('single_select questions', () => {
        it('validates required single_select questions with options', () => {
            const testQuestions: MockQuestion[] = [
                {
                    id: 'q1',
                    type: 'single_select',
                    required: true,
                    allowOther: false,
                    options: [
                        {id: 'opt1', value: 'Option 1'},
                        {id: 'opt2', value: 'Option 2'},
                        {id: 'opt3', value: 'Option 3'}
                    ]
                } as any
            ];
            const schema = createResponseSchema(testQuestions);
            // valid responses
            expect(() => schema.parse({answers: {q1: createAnswer('opt1')}})).not.toThrow();
            expect(() => schema.parse({answers: {q1: createAnswer('opt2')}})).not.toThrow();
            // invalid - empty string
            expect(() => schema.parse({answers: {q1: createAnswer('')}})).toThrow();
            // invalid - invalid option id
            expect(() => schema.parse({answers: {q1: createAnswer('invalid-option')}})).toThrow();
            // invalid - missing answer
            expect(() => schema.parse({answers: {}})).toThrow();
        });

        it('validates required single_select questions with allowOther enabled', () => {
            const testQuestions: MockQuestion[] = [
                {
                    id: 'q1',
                    type: 'single_select',
                    required: true,
                    allowOther: true,
                    options: [
                        {id: 'opt1', value: 'Option 1'},
                        {id: 'opt2', value: 'Option 2'},
                        {id: 'opt3', value: 'Option 3'}
                    ]
                } as any
            ];
            const schema = createResponseSchema(testQuestions);
            // valid responses - predefined options
            expect(() => schema.parse({answers: {q1: createAnswer('opt1')}})).not.toThrow();
            expect(() => schema.parse({answers: {q1: createAnswer('opt2')}})).not.toThrow();
            // valid responses - custom "other" values
            expect(() =>
                schema.parse({answers: {q1: createAnswer('custom answer')}})
            ).not.toThrow();
            expect(() =>
                schema.parse({answers: {q1: createAnswer('another custom value')}})
            ).not.toThrow();
            // invalid - empty string
            expect(() => schema.parse({answers: {q1: createAnswer('')}})).toThrow();
            // invalid - missing answer
            expect(() => schema.parse({answers: {}})).toThrow();
        });

        it('validates required single_select questions without options', () => {
            const testQuestions: MockQuestion[] = [
                {id: 'q1', type: 'single_select', required: true, options: []} as any
            ];
            const schema = createResponseSchema(testQuestions);
            // valid response
            expect(() => schema.parse({answers: {q1: createAnswer('any string')}})).not.toThrow();
            // invalid - empty string
            expect(() => schema.parse({answers: {q1: createAnswer('')}})).toThrow();
        });

        it('validates optional single_select questions', () => {
            const testQuestions: MockQuestion[] = [
                {
                    id: 'q1',
                    type: 'single_select',
                    required: false,
                    allowOther: false,
                    options: [
                        {id: 'opt1', value: 'Option 1'},
                        {id: 'opt2', value: 'Option 2'}
                    ]
                } as any
            ];
            const schema = createResponseSchema(testQuestions);
            // valid responses
            expect(() => schema.parse({answers: {q1: createAnswer('opt1')}})).not.toThrow();
            expect(() => schema.parse({answers: {q1: createAnswer('')}})).not.toThrow();
            expect(() => schema.parse({answers: {q1: createAnswer(null)}})).not.toThrow();
            expect(() => schema.parse({answers: {}})).toThrow();
        });

        it('validates optional single_select questions with allowOther enabled', () => {
            const testQuestions: MockQuestion[] = [
                {
                    id: 'q1',
                    type: 'single_select',
                    required: false,
                    allowOther: true,
                    options: [
                        {id: 'opt1', value: 'Option 1'},
                        {id: 'opt2', value: 'Option 2'}
                    ]
                } as any
            ];
            const schema = createResponseSchema(testQuestions);
            // valid responses - predefined options
            expect(() => schema.parse({answers: {q1: createAnswer('opt1')}})).not.toThrow();
            // valid responses - custom "other" values
            expect(() =>
                schema.parse({answers: {q1: createAnswer('custom answer')}})
            ).not.toThrow();
            // valid responses - optional values
            expect(() => schema.parse({answers: {q1: createAnswer('')}})).not.toThrow();
            expect(() => schema.parse({answers: {q1: createAnswer(null)}})).not.toThrow();
            expect(() => schema.parse({answers: {}})).toThrow();
        });
    });

    describe('multi_select questions', () => {
        it('validates required multi_select questions with options', () => {
            const testQuestions: MockQuestion[] = [
                {
                    id: 'q1',
                    type: 'multi_select',
                    required: true,
                    allowOther: false,
                    options: [
                        {id: 'opt1', value: 'Option 1'},
                        {id: 'opt2', value: 'Option 2'},
                        {id: 'opt3', value: 'Option 3'}
                    ]
                } as any
            ];
            const schema = createResponseSchema(testQuestions);
            // valid responses
            expect(() => schema.parse({answers: {q1: createAnswer(['opt1'])}})).not.toThrow();
            expect(() =>
                schema.parse({answers: {q1: createAnswer(['opt1', 'opt2'])}})
            ).not.toThrow();
            expect(() =>
                schema.parse({answers: {q1: createAnswer(['opt1', 'opt2', 'opt3'])}})
            ).not.toThrow();
            // invalid - empty array
            expect(() => schema.parse({answers: {q1: createAnswer([])}})).toThrow();
            // invalid - invalid option id
            expect(() =>
                schema.parse({answers: {q1: createAnswer(['opt1', 'invalid-option'])}})
            ).toThrow();
            // invalid - missing answer
            expect(() => schema.parse({answers: {}})).toThrow();
        });

        it('validates required multi_select questions with allowOther enabled', () => {
            const testQuestions: MockQuestion[] = [
                {
                    id: 'q1',
                    type: 'multi_select',
                    required: true,
                    allowOther: true,
                    options: [
                        {id: 'opt1', value: 'Option 1'},
                        {id: 'opt2', value: 'Option 2'},
                        {id: 'opt3', value: 'Option 3'}
                    ]
                } as any
            ];
            const schema = createResponseSchema(testQuestions);
            // valid responses - predefined options only
            expect(() => schema.parse({answers: {q1: createAnswer(['opt1'])}})).not.toThrow();
            expect(() =>
                schema.parse({answers: {q1: createAnswer(['opt1', 'opt2'])}})
            ).not.toThrow();
            // valid responses - custom "other" values only
            expect(() =>
                schema.parse({answers: {q1: createAnswer(['custom answer'])}})
            ).not.toThrow();
            expect(() =>
                schema.parse({answers: {q1: createAnswer(['another custom value'])}})
            ).not.toThrow();
            // valid responses - mixed predefined and custom values
            expect(() =>
                schema.parse({answers: {q1: createAnswer(['opt1', 'custom answer'])}})
            ).not.toThrow();
            expect(() =>
                schema.parse({answers: {q1: createAnswer(['opt1', 'opt2', 'custom answer'])}})
            ).not.toThrow();
            // invalid - empty array
            expect(() => schema.parse({answers: {q1: createAnswer([])}})).toThrow();
            // invalid - empty custom value
            expect(() => schema.parse({answers: {q1: createAnswer(['opt1', ''])}})).toThrow();
            // invalid - missing answer
            expect(() => schema.parse({answers: {}})).toThrow();
        });

        it('validates required multi_select questions without options', () => {
            const testQuestions: MockQuestion[] = [
                {id: 'q1', type: 'multi_select', required: true, options: []} as any
            ];
            const schema = createResponseSchema(testQuestions);
            // valid response
            expect(() => schema.parse({answers: {q1: createAnswer(['any string'])}})).not.toThrow();
            // invalid - empty array
            expect(() => schema.parse({answers: {q1: createAnswer([])}})).toThrow();
        });

        it('validates optional multi_select questions', () => {
            const testQuestions: MockQuestion[] = [
                {
                    id: 'q1',
                    type: 'multi_select',
                    required: false,
                    allowOther: false,
                    options: [
                        {id: 'opt1', value: 'Option 1'},
                        {id: 'opt2', value: 'Option 2'}
                    ]
                } as any
            ];
            const schema = createResponseSchema(testQuestions);
            // valid responses
            expect(() => schema.parse({answers: {q1: createAnswer(['opt1'])}})).not.toThrow();
            expect(() => schema.parse({answers: {q1: createAnswer(null)}})).not.toThrow();
            expect(() => schema.parse({answers: {}})).toThrow();
        });

        it('validates optional multi_select questions with allowOther enabled', () => {
            const testQuestions: MockQuestion[] = [
                {
                    id: 'q1',
                    type: 'multi_select',
                    required: false,
                    allowOther: true,
                    options: [
                        {id: 'opt1', value: 'Option 1'},
                        {id: 'opt2', value: 'Option 2'}
                    ]
                } as any
            ];
            const schema = createResponseSchema(testQuestions);
            // valid responses - predefined options only
            expect(() => schema.parse({answers: {q1: createAnswer(['opt1'])}})).not.toThrow();
            // valid responses - custom "other" values only
            expect(() =>
                schema.parse({answers: {q1: createAnswer(['custom answer'])}})
            ).not.toThrow();
            // valid responses - mixed predefined and custom values
            expect(() =>
                schema.parse({answers: {q1: createAnswer(['opt1', 'custom answer'])}})
            ).not.toThrow();
            // valid responses - optional values
            expect(() => schema.parse({answers: {q1: createAnswer(null)}})).not.toThrow();
            expect(() => schema.parse({answers: {}})).toThrow();
        });

        it('validates multi_select questions with minSelections validation', () => {
            const testQuestions: MockQuestion[] = [
                {
                    id: 'q1',
                    type: 'multi_select',
                    required: true,
                    allowOther: false,
                    options: [
                        {id: 'opt1', value: 'Option 1'},
                        {id: 'opt2', value: 'Option 2'},
                        {id: 'opt3', value: 'Option 3'}
                    ],
                    validations: [{id: 'v1', type: 'minSelections', value: 2}]
                } as any
            ];
            const schema = createResponseSchema(testQuestions);
            // valid response - meets minimum selections
            expect(() =>
                schema.parse({answers: {q1: createAnswer(['opt1', 'opt2'])}})
            ).not.toThrow();
            expect(() =>
                schema.parse({answers: {q1: createAnswer(['opt1', 'opt2', 'opt3'])}})
            ).not.toThrow();
            // invalid - below minimum selections
            expect(() => schema.parse({answers: {q1: createAnswer(['opt1'])}})).toThrow();
        });

        it('validates multi_select questions with maxSelections validation', () => {
            const testQuestions: MockQuestion[] = [
                {
                    id: 'q1',
                    type: 'multi_select',
                    required: true,
                    allowOther: false,
                    options: [
                        {id: 'opt1', value: 'Option 1'},
                        {id: 'opt2', value: 'Option 2'},
                        {id: 'opt3', value: 'Option 3'}
                    ],
                    validations: [{id: 'v1', type: 'maxSelections', value: 2}]
                } as any
            ];
            const schema = createResponseSchema(testQuestions);
            // valid response - within limit
            expect(() => schema.parse({answers: {q1: createAnswer(['opt1'])}})).not.toThrow();
            expect(() =>
                schema.parse({answers: {q1: createAnswer(['opt1', 'opt2'])}})
            ).not.toThrow();
            // invalid - above maximum selections
            expect(() =>
                schema.parse({answers: {q1: createAnswer(['opt1', 'opt2', 'opt3'])}})
            ).toThrow();
        });

        it('validates multi_select questions with minSelections and maxSelections validation', () => {
            const testQuestions: MockQuestion[] = [
                {
                    id: 'q1',
                    type: 'multi_select',
                    required: true,
                    allowOther: false,
                    options: [
                        {id: 'opt1', value: 'Option 1'},
                        {id: 'opt2', value: 'Option 2'},
                        {id: 'opt3', value: 'Option 3'},
                        {id: 'opt4', value: 'Option 4'}
                    ],
                    validations: [
                        {id: 'v1', type: 'minSelections', value: 2},
                        {id: 'v2', type: 'maxSelections', value: 3}
                    ]
                } as any
            ];
            const schema = createResponseSchema(testQuestions);
            // valid response - within range
            expect(() =>
                schema.parse({answers: {q1: createAnswer(['opt1', 'opt2'])}})
            ).not.toThrow();
            expect(() =>
                schema.parse({answers: {q1: createAnswer(['opt1', 'opt2', 'opt3'])}})
            ).not.toThrow();
            // invalid - below minimum
            expect(() => schema.parse({answers: {q1: createAnswer(['opt1'])}})).toThrow();
            // invalid - above maximum
            expect(() =>
                schema.parse({answers: {q1: createAnswer(['opt1', 'opt2', 'opt3', 'opt4'])}})
            ).toThrow();
        });
    });

    describe('mixed question types', () => {
        it('validates multiple questions of different types', () => {
            const testQuestions: MockQuestion[] = [
                {id: 'text_q', type: 'text', required: true, options: []},
                {id: 'number_q', type: 'number', required: false, options: []},
                {
                    id: 'single_q',
                    type: 'single_select',
                    required: true,
                    allowOther: false,
                    options: [
                        {id: 'opt1', value: 'Option 1'},
                        {id: 'opt2', value: 'Option 2'}
                    ]
                },
                {
                    id: 'multi_q',
                    type: 'multi_select',
                    required: false,
                    allowOther: false,
                    options: [
                        {id: 'opt1', value: 'Option 1'},
                        {id: 'opt2', value: 'Option 2'}
                    ]
                }
            ] as any;
            const schema = createResponseSchema(testQuestions);
            // valid response
            expect(() =>
                schema.parse({
                    answers: {text_q: createAnswer('test answer'), single_q: createAnswer('opt1')}
                })
            ).not.toThrow();
            // valid response with all questions
            expect(() =>
                schema.parse({
                    answers: {
                        text_q: createAnswer('test answer'),
                        number_q: createAnswer(42),
                        single_q: createAnswer('opt1'),
                        multi_q: createAnswer(['opt1', 'opt2'])
                    }
                })
            ).not.toThrow();
            // invalid - missing required questions
            expect(() =>
                schema.parse({
                    answers: {number_q: createAnswer(42), multi_q: createAnswer(['opt1'])}
                })
            ).toThrow();
        });

        it('validates mixed questions with allowOther enabled', () => {
            const testQuestions: MockQuestion[] = [
                {id: 'text_q', type: 'text', required: true, options: []},
                {
                    id: 'single_q',
                    type: 'single_select',
                    required: true,
                    allowOther: true,
                    options: [
                        {id: 'opt1', value: 'Option 1'},
                        {id: 'opt2', value: 'Option 2'}
                    ]
                },
                {
                    id: 'multi_q',
                    type: 'multi_select',
                    required: false,
                    allowOther: true,
                    options: [
                        {id: 'opt1', value: 'Option 1'},
                        {id: 'opt2', value: 'Option 2'}
                    ]
                }
            ] as any;
            const schema = createResponseSchema(testQuestions);
            // valid response with custom "other" values
            expect(() =>
                schema.parse({
                    answers: {
                        text_q: createAnswer('test answer'),
                        single_q: createAnswer('custom single answer'),
                        multi_q: createAnswer(['opt1', 'custom multi answer'])
                    }
                })
            ).not.toThrow();
            // valid response with mixed predefined and custom values
            expect(() =>
                schema.parse({
                    answers: {
                        text_q: createAnswer('test answer'),
                        single_q: createAnswer('opt1'),
                        multi_q: createAnswer(['opt1', 'custom answer', 'opt2'])
                    }
                })
            ).not.toThrow();
        });

        it('validates mixed questions with various validation rules', () => {
            const testQuestions: MockQuestion[] = [
                {
                    id: 'text_q',
                    type: 'text',
                    required: true,
                    options: [],
                    validations: [{id: 'v1', type: 'email'}]
                },
                {
                    id: 'number_q',
                    type: 'number',
                    required: true,
                    options: [],
                    validations: [
                        {id: 'v2', type: 'min', value: 1},
                        {id: 'v3', type: 'max', value: 100}
                    ]
                },
                {
                    id: 'multi_q',
                    type: 'multi_select',
                    required: true,
                    allowOther: false,
                    options: [
                        {id: 'opt1', value: 'Option 1'},
                        {id: 'opt2', value: 'Option 2'},
                        {id: 'opt3', value: 'Option 3'}
                    ],
                    validations: [{id: 'v4', type: 'minSelections', value: 2}]
                }
            ] as any;
            const schema = createResponseSchema(testQuestions);
            // valid response - meets all validations
            expect(() =>
                schema.parse({
                    answers: {
                        text_q: createAnswer('test@example.com'),
                        number_q: createAnswer(50),
                        multi_q: createAnswer(['opt1', 'opt2'])
                    }
                })
            ).not.toThrow();
            // invalid - email validation fails
            expect(() =>
                schema.parse({
                    answers: {
                        text_q: createAnswer('not an email'),
                        number_q: createAnswer(50),
                        multi_q: createAnswer(['opt1', 'opt2'])
                    }
                })
            ).toThrow();
            // invalid - number validation fails
            expect(() =>
                schema.parse({
                    answers: {
                        text_q: createAnswer('test@example.com'),
                        number_q: createAnswer(150),
                        multi_q: createAnswer(['opt1', 'opt2'])
                    }
                })
            ).toThrow();
            // invalid - multi_select validation fails
            expect(() =>
                schema.parse({
                    answers: {
                        text_q: createAnswer('test@example.com'),
                        number_q: createAnswer(50),
                        multi_q: createAnswer(['opt1'])
                    }
                })
            ).toThrow();
        });
    });

    describe('unknown question types', () => {
        it('handles unknown question types gracefully', () => {
            const testQuestions: MockQuestion[] = [
                {id: 'unknown_q', type: 'unknown_type' as any, required: true, options: []}
            ] as any;
            const schema = createResponseSchema(testQuestions);
            // should accept any value for unknown types
            expect(() =>
                schema.parse({answers: {unknown_q: createAnswer('any value')}})
            ).not.toThrow();
            expect(() => schema.parse({answers: {unknown_q: createAnswer(123)}})).not.toThrow();
        });
    });

    describe('edge cases', () => {
        it('handles empty questions array', () => {
            const testQuestions: MockQuestion[] = [];
            const schema = createResponseSchema(testQuestions);
            // should require at least one answer
            expect(() => schema.parse({answers: {}})).toThrow();
        });

        it('handles questions with null options', () => {
            const testQuestions: MockQuestion[] = [
                {id: 'q1', type: 'single_select', required: true, options: null} as any
            ];
            const schema = createResponseSchema(testQuestions);
            // should accept any string for single_select with null options
            expect(() => schema.parse({answers: {q1: createAnswer('any string')}})).not.toThrow();
        });

        it('handles questions with undefined options', () => {
            const testQuestions: MockQuestion[] = [
                {id: 'q1', type: 'multi_select', required: true, options: undefined} as any
            ];
            const schema = createResponseSchema(testQuestions);
            // should accept any array for multi_select with undefined options
            expect(() =>
                schema.parse({answers: {q1: createAnswer(['any', 'strings'])}})
            ).not.toThrow();
        });

        it('handles questions with null validations', () => {
            const testQuestions: MockQuestion[] = [
                {
                    id: 'q1',
                    type: 'text',
                    required: true,
                    options: [],
                    validations: null
                } as any
            ];
            const schema = createResponseSchema(testQuestions);
            // should work without validation rules
            expect(() => schema.parse({answers: {q1: createAnswer('any text')}})).not.toThrow();
        });

        it('handles questions with undefined validations', () => {
            const testQuestions: MockQuestion[] = [
                {
                    id: 'q1',
                    type: 'text',
                    required: true,
                    options: [],
                    validations: undefined
                } as any
            ];
            const schema = createResponseSchema(testQuestions);
            // should work without validation rules
            expect(() => schema.parse({answers: {q1: createAnswer('any text')}})).not.toThrow();
        });

        it('handles validation rules without type', () => {
            const testQuestions: MockQuestion[] = [
                {
                    id: 'q1',
                    type: 'text',
                    required: true,
                    options: [],
                    validations: [{id: 'v1'}]
                } as any
            ];
            const schema = createResponseSchema(testQuestions);
            // should ignore validation rules without type
            expect(() => schema.parse({answers: {q1: createAnswer('any text')}})).not.toThrow();
        });

        it('handles validation rules with invalid value types', () => {
            const testQuestions: MockQuestion[] = [
                {
                    id: 'q1',
                    type: 'text',
                    required: true,
                    options: [],
                    validations: [
                        {
                            id: 'v1',
                            type: 'minLength',
                            value: 'not a number' // invalid value type
                        }
                    ]
                } as any
            ];
            const schema = createResponseSchema(testQuestions);
            // should ignore validation rules with invalid value types
            expect(() => schema.parse({answers: {q1: createAnswer('any text')}})).not.toThrow();
        });
    });
});
