import {createCipheriv, createDecipheriv, randomBytes, scryptSync} from 'node:crypto';

const algorithm = 'aes-256-cbc';

export const encrypt = (value: string): string => {
    const secret = process.env.SECRET_KEY ?? '';
    if (!secret) {
        throw new Error('Secret key is required for encryption');
    }

    const salt = randomBytes(16);
    const key = scryptSync(secret, salt, 32);
    const iv = randomBytes(16);
    const cipher = createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${salt.toString('hex')}:${iv.toString('hex')}:${encrypted}`;
};

export const decrypt = (value: string): string => {
    const secret = process.env.SECRET_KEY ?? '';

    if (!secret) {
        throw new Error('Secret key is required for decryption');
    }

    const parts = value.split(':');
    if (parts.length !== 3) {
        throw new Error('invalid encrypted value format');
    }

    const [saltHex, ivHex, encrypted] = parts;
    if (!saltHex || !ivHex || !encrypted) {
        throw new Error('invalid encrypted value format');
    }

    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const key = scryptSync(secret, salt, 32);
    const decipher = createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
};
