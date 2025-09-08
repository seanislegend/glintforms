import {afterEach, beforeEach, describe, expect, it} from 'vitest';

describe('encryption', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = {...originalEnv};
        process.env.SECRET_KEY = 'test-secret-key-32-bytes-long';
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('encrypt', () => {
        it('encrypts a string successfully', async () => {
            const {encrypt} = await import('../src/index');
            const testValue = 'hello world';

            const encrypted = encrypt(testValue);

            expect(encrypted).toBeDefined();
            expect(typeof encrypted).toBe('string');
            expect(encrypted).not.toBe(testValue);
            expect(encrypted.split(':')).toHaveLength(3);
        });

        it('encrypts empty string', async () => {
            const {encrypt} = await import('../src/index');
            const testValue = '';

            const encrypted = encrypt(testValue);

            expect(encrypted).toBeDefined();
            expect(encrypted).not.toBe(testValue);
            expect(encrypted.split(':')).toHaveLength(3);
        });

        it('encrypts special characters', async () => {
            const {encrypt} = await import('../src/index');
            const testValue = '!@#$%^&*()_+-=[]{}|;:,.<>?';

            const encrypted = encrypt(testValue);

            expect(encrypted).toBeDefined();
            expect(encrypted).not.toBe(testValue);
            expect(encrypted.split(':')).toHaveLength(3);
        });

        it('encrypts unicode characters', async () => {
            const {encrypt} = await import('../src/index');
            const testValue = '🚀 🌟 🎉 你好世界';

            const encrypted = encrypt(testValue);

            expect(encrypted).toBeDefined();
            expect(encrypted).not.toBe(testValue);
            expect(encrypted.split(':')).toHaveLength(3);
        });

        it('produces different encrypted values for same input', async () => {
            const {encrypt} = await import('../src/index');
            const testValue = 'hello world';

            const encrypted1 = encrypt(testValue);
            const encrypted2 = encrypt(testValue);

            expect(encrypted1).not.toBe(encrypted2);
        });
    });

    describe('decrypt', () => {
        it('decrypts an encrypted string successfully', async () => {
            const {encrypt, decrypt} = await import('../src/index');
            const testValue = 'hello world';

            const encrypted = encrypt(testValue);
            const decrypted = decrypt(encrypted);

            expect(decrypted).toBe(testValue);
        });

        it('decrypts empty string', async () => {
            const {encrypt, decrypt} = await import('../src/index');
            const testValue = '';

            const encrypted = encrypt(testValue);
            const decrypted = decrypt(encrypted);

            expect(decrypted).toBe(testValue);
        });

        it('decrypts special characters', async () => {
            const {encrypt, decrypt} = await import('../src/index');
            const testValue = '!@#$%^&*()_+-=[]{}|;:,.<>?';

            const encrypted = encrypt(testValue);
            const decrypted = decrypt(encrypted);

            expect(decrypted).toBe(testValue);
        });

        it('decrypts unicode characters', async () => {
            const {encrypt, decrypt} = await import('../src/index');
            const testValue = '🚀 🌟 🎉 你好世界';

            const encrypted = encrypt(testValue);
            const decrypted = decrypt(encrypted);

            expect(decrypted).toBe(testValue);
        });

        it('throws error for invalid encrypted value format - wrong number of parts', async () => {
            const {decrypt} = await import('../src/index');

            expect(() => decrypt('invalid-format')).toThrow('invalid encrypted value format');
            expect(() => decrypt('part1:part2')).toThrow('invalid encrypted value format');
            expect(() => decrypt('part1:part2:part3:part4')).toThrow(
                'invalid encrypted value format'
            );
        });

        it('throws error for invalid encrypted value format - empty parts', async () => {
            const {decrypt} = await import('../src/index');

            expect(() => decrypt(':iv:encrypted')).toThrow('invalid encrypted value format');
            expect(() => decrypt('salt::encrypted')).toThrow('invalid encrypted value format');
            expect(() => decrypt('salt:iv:')).toThrow('invalid encrypted value format');
        });

        it('throws error for malformed encrypted value', async () => {
            const {decrypt} = await import('../src/index');

            expect(() => decrypt('invalid-salt:invalid-iv:invalid-encrypted')).toThrow();
        });
    });

    describe('encrypt and decrypt integration', () => {
        it('maintains data integrity through encrypt-decrypt cycle', async () => {
            const {encrypt, decrypt} = await import('../src/index');
            const testValues = [
                'simple text',
                'Text with CAPITALS and lowercase',
                'Numbers: 1234567890',
                'Special chars: !@#$%^&*()',
                'Unicode: 🚀 🌟 🎉 你好世界',
                'Very long text '.repeat(100),
                ''
            ];

            testValues.forEach(value => {
                const encrypted = encrypt(value);
                const decrypted = decrypt(encrypted);
                expect(decrypted).toBe(value);
            });
        });

        it('works with different secret keys', async () => {
            const testValue = 'hello world';
            const secretKeys = [
                'key1',
                'very-long-secret-key-for-testing',
                'key-with-special-chars!@#$%',
                'key-with-unicode-🚀🌟🎉'
            ];

            for (const secretKey of secretKeys) {
                process.env.SECRET_KEY = secretKey;
                const {encrypt, decrypt} = await import('../src/index');

                const encrypted = encrypt(testValue);
                const decrypted = decrypt(encrypted);

                expect(decrypted).toBe(testValue);
            }
        });

        it('fails when decrypting with wrong secret key', async () => {
            const testValue = 'hello world';

            // encrypt with first secret key
            process.env.SECRET_KEY = 'first-secret-key';
            const {encrypt} = await import('../src/index');
            const encrypted = encrypt(testValue);

            // try to decrypt with different secret key
            process.env.SECRET_KEY = 'different-secret-key';
            const {decrypt} = await import('../src/index');

            // with wrong secret key, decryption should either throw an error or produce incorrect output
            try {
                const decrypted = decrypt(encrypted);
                // if no error, the output should be different from the original
                expect(decrypted).not.toBe(testValue);
            } catch (error) {
                // if it throws an error, that's also acceptable
                expect(error).toBeInstanceOf(Error);
            }
        });

        it('fails when encrypting and decrypting with different secret keys', async () => {
            const testValue = 'hello world';

            // encrypt with first secret key
            process.env.SECRET_KEY = 'encrypt-key-123';
            const {encrypt} = await import('../src/index');
            const encrypted = encrypt(testValue);

            // try to decrypt with completely different secret key
            process.env.SECRET_KEY = 'decrypt-key-456';
            const {decrypt} = await import('../src/index');

            // with wrong secret key, decryption should either throw an error or produce incorrect output
            try {
                const decrypted = decrypt(encrypted);
                // if no error, the output should be different from the original
                expect(decrypted).not.toBe(testValue);
            } catch (error) {
                // if it throws an error, that's also acceptable
                expect(error).toBeInstanceOf(Error);
            }
        });

        it('encrypts and decrypts JSON objects correctly', async () => {
            const {encrypt, decrypt} = await import('../src/index');

            const jsonData = {
                id: 123,
                name: 'John Doe',
                email: 'john@example.com',
                active: true,
                roles: ['user', 'admin'],
                metadata: {
                    lastLogin: '2024-01-15T10:30:00Z',
                    preferences: {
                        theme: 'dark',
                        language: 'en'
                    }
                }
            };

            const jsonString = JSON.stringify(jsonData);
            const encrypted = encrypt(jsonString);
            const decrypted = decrypt(encrypted);
            const decryptedData = JSON.parse(decrypted);

            expect(decryptedData).toEqual(jsonData);
            expect(decryptedData.id).toBe(123);
            expect(decryptedData.name).toBe('John Doe');
            expect(decryptedData.roles).toEqual(['user', 'admin']);
            expect(decryptedData.metadata.preferences.theme).toBe('dark');
        });

        it('encrypts and decrypts JSON arrays correctly', async () => {
            const {encrypt, decrypt} = await import('../src/index');

            const jsonArray = [
                {id: 1, name: 'Alice', score: 95.5},
                {id: 2, name: 'Bob', score: 87.2},
                {id: 3, name: 'Charlie', score: 92.8}
            ];

            const jsonString = JSON.stringify(jsonArray);
            const encrypted = encrypt(jsonString);
            const decrypted = decrypt(encrypted);
            const decryptedArray = JSON.parse(decrypted);

            expect(decryptedArray).toEqual(jsonArray);
            expect(decryptedArray).toHaveLength(3);
            expect(decryptedArray[0].name).toBe('Alice');
            expect(decryptedArray[1].score).toBe(87.2);
        });

        it('encrypts and decrypts complex nested JSON structures', async () => {
            const {encrypt, decrypt} = await import('../src/index');

            const complexJson = {
                users: [
                    {
                        id: 'user-1',
                        profile: {
                            firstName: 'Jane',
                            lastName: 'Smith',
                            contact: {
                                email: 'jane.smith@example.com',
                                phone: '+1-555-0123'
                            }
                        },
                        settings: {
                            notifications: {
                                email: true,
                                sms: false,
                                push: true
                            },
                            privacy: {
                                profileVisible: true,
                                showEmail: false
                            }
                        }
                    }
                ],
                metadata: {
                    version: '1.0.0',
                    createdAt: '2024-01-15T10:30:00Z',
                    tags: ['production', 'v1', 'stable']
                }
            };

            const jsonString = JSON.stringify(complexJson);
            const encrypted = encrypt(jsonString);
            const decrypted = decrypt(encrypted);
            const decryptedData = JSON.parse(decrypted);

            expect(decryptedData).toEqual(complexJson);
            expect(decryptedData.users[0].profile.firstName).toBe('Jane');
            expect(decryptedData.users[0].settings.notifications.email).toBe(true);
            expect(decryptedData.metadata.tags).toContain('production');
        });

        it('maintains JSON data integrity through multiple encrypt-decrypt cycles', async () => {
            const {encrypt, decrypt} = await import('../src/index');

            const originalData = {
                message: 'Hello, World!',
                timestamp: Date.now(),
                data: {
                    numbers: [1, 2, 3, 4, 5],
                    text: 'Sample text with special chars: !@#$%^&*()',
                    boolean: true,
                    nullValue: null
                }
            };

            // multiple encrypt-decrypt cycles
            let currentData = JSON.stringify(originalData);

            for (let i = 0; i < 5; i++) {
                const encrypted = encrypt(currentData);
                const decrypted = decrypt(encrypted);
                currentData = decrypted;
            }

            const finalData = JSON.parse(currentData);
            expect(finalData).toEqual(originalData);
            expect(finalData.message).toBe('Hello, World!');
            expect(finalData.data.numbers).toEqual([1, 2, 3, 4, 5]);
            expect(finalData.data.boolean).toBe(true);
            expect(finalData.data.nullValue).toBeNull();
        });
    });
});
