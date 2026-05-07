import { describe, it, expect } from 'vitest';
import { validateId } from './validateId';

describe('validateId', () => {
	it('returns the integer for a valid id string', () => {
		expect(validateId('42')).toBe(42);
	});
	it('returns null for null', () => {
		expect(validateId(null)).toBeNull();
	});
	it('returns null for zero', () => {
		expect(validateId('0')).toBeNull();
	});
	it('returns null for negative numbers', () => {
		expect(validateId('-1')).toBeNull();
	});
	it('returns null for non-numeric strings', () => {
		expect(validateId('abc')).toBeNull();
	});
	it('returns null for SQL injection attempt', () => {
		expect(validateId('1; DROP TABLE users')).toBeNull();
	});
	it('returns null for floats', () => {
		expect(validateId('1.5')).toBeNull();
	});
});
