import type { JournalEntry } from '../types';

function isObject(value: any): value is object {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isValidString(value: any): value is string {
    return typeof value === 'string';
}

function isValidOptionalString(value: any): boolean {
    return typeof value === 'string' || typeof value === 'undefined';
}

function isValidBoolean(value: any): value is boolean {
    return typeof value === 'boolean';
}

function isValidArray(value: any): value is any[] {
    return Array.isArray(value);
}

/**
 * Performs a deep validation of an imported journal file.
 * @param data The parsed JSON data from the imported file.
 * @returns An object with `isValid` and an `error` message if validation fails.
 */
export function validateJournalImport(data: any): { isValid: boolean; error: string | null } {
    if (!isValidArray(data)) {
        return { isValid: false, error: "Imported file is not an array of entries." };
    }

    for (let i = 0; i < data.length; i++) {
        const entry = data[i] as Partial<JournalEntry>;
        const errorPrefix = `Invalid data in entry ${i + 1}:`;

        if (!isObject(entry)) return { isValid: false, error: `${errorPrefix} Entry is not an object.` };
        if (!isValidString(entry.id)) return { isValid: false, error: `${errorPrefix} Missing or invalid 'id'.` };
        if (!isValidString(entry.createdAt)) return { isValid: false, error: `${errorPrefix} Missing or invalid 'createdAt'.` };
        if (!isValidString(entry.dateISO) || !/^\d{4}-\d{2}-\d{2}$/.test(entry.dateISO)) return { isValid: false, error: `${errorPrefix} Missing or invalid 'dateISO'.` };
        if (!isObject(entry.spread)) return { isValid: false, error: `${errorPrefix} Missing or invalid 'spread'.` };
        if (!isValidString(entry.spread?.name)) return { isValid: false, error: `${errorPrefix} Spread is missing a 'name'.` };
        if (!isValidArray(entry.drawnCards) || entry.drawnCards.length === 0) return { isValid: false, error: `${errorPrefix} Missing or empty 'drawnCards' array.` };
        
        for(const card of entry.drawnCards) {
            if (!isObject(card.card) || !isValidString(card.card.name)) return { isValid: false, error: `${errorPrefix} A drawn card is missing its data.` };
            if (!isValidBoolean(card.isReversed)) return { isValid: false, error: `${errorPrefix} Card '${card.card.name}' has invalid 'isReversed' property.`};
        }
        
        if (!isObject(entry.interpretation)) return { isValid: false, error: `${errorPrefix} Missing or invalid 'interpretation'.` };
        if (!isValidString(entry.interpretation?.overall)) return { isValid: false, error: `${errorPrefix} Interpretation is missing 'overall' text.`};
        if (!isValidArray(entry.interpretation?.cards)) return { isValid: false, error: `${errorPrefix} Interpretation is missing 'cards' array.`};

        if (!isValidOptionalString(entry.question)) return { isValid: false, error: `${errorPrefix} 'question' has an invalid type.` };
        if (!isValidString(entry.impression)) return { isValid: false, error: `${errorPrefix} Missing or invalid 'impression'.` };
        if (entry.tags) {
            if (!isValidArray(entry.tags)) return { isValid: false, error: `${errorPrefix} 'tags' must be an array.` };
            if (entry.tags.some(t => typeof t !== 'string')) return { isValid: false, error: `${errorPrefix} All items in 'tags' must be strings.`};
        }
    }

    return { isValid: true, error: null };
}