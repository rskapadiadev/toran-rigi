import { customAlphabet } from 'nanoid';

const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';

// Public, URL-safe ids; internal row ids never leak sequential information.
export const newId = customAlphabet(alphabet, 16);
export const newToken = customAlphabet(`${alphabet}ABCDEFGHIJKLMNOPQRSTUVWXYZ`, 32);
