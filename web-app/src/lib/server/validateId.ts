export function validateId(raw: FormDataEntryValue | null): number | null {
	if (raw === null) return null;
	const n = parseInt(String(raw), 10);
	if (isNaN(n) || n <= 0 || String(n) !== String(raw).trim()) return null;
	return n;
}
