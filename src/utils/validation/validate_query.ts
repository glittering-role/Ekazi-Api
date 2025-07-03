export function isValidGeneralQuery(query: string): boolean {
    if (!query) return false; // Reject empty query

    query = query.trim();

    if (query.includes("@")) return false; // Disallow queries with "@"

    if (query.length < 2 || query.length > 100) return false; // Enforce length between 2 and 100

    if (/^[0-9]+$/.test(query)) return false; // Reject queries that are only numbers

    if (/[\'\";\-]/.test(query)) return false; // Reject queries with disallowed characters

    return true;
}

export function isValidUserQuery(query: string): boolean {
    if (!query) return false; // Reject empty query

    query = query.trim();

    if (query.length < 2 || query.length > 100) return false; // Enforce length between 2 and 100

    if (/^[0-9]+$/.test(query)) return false; // Reject queries that are only numbers

    if (/[\'\";\-]/.test(query)) return false; // Reject queries with disallowed characters

    return true;
}

