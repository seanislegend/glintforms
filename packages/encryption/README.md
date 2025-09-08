# @glint/encryption

A comprehensive encryption package built with TypeScript and Node.js crypto module. This package provides secure encryption and decryption utilities using AES-256-CBC with scrypt key derivation, designed to be used across all apps.

The package uses industry-standard encryption algorithms and includes automatic salt and IV generation for enhanced security.

## Environment Variables

You must set the following environment variable:

- `SECRET_KEY` - your secret encryption key (must be at least 32 characters)

## Example usage

```ts
import { encrypt, decrypt } from '@glint/encryption'

// encrypt sensitive data
const encryptedValue = encrypt('sensitive information')

// decrypt data when needed
const decryptedValue = decrypt(encryptedValue)
```

## Encryption Details

The package uses AES-256-CBC encryption with the following security features:

- **Key derivation**: Uses scrypt with a random salt for secure key generation
- **Initialisation vector**: Generates a random IV for each encryption operation
- **Format**: Returns encrypted data in the format `salt:iv:encrypted`
- **Algorithm**: AES-256-CBC for strong encryption

## Security Considerations

- The secret key must be kept secure and never exposed in client-side code
- Each encryption operation uses unique salt and IV values
- The package automatically handles salt and IV generation
- Encrypted values cannot be decrypted without the correct secret key
