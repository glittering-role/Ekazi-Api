export const validateTimeSlot = (start: Date, end: Date) => {
    if (!isTimeSlotInFuture(start)) {
        return { valid: false, message: 'Cannot book in the past' };
    }
    
    if (start >= end) {
        return { valid: false, message: 'End time must be after start time' };
    }

    const duration = end.getTime() - start.getTime();
    if (duration < 1800000) { // 30 minutes minimum
        return { valid: false, message: 'Minimum booking duration is 30 minutes' };
    }

    return { valid: true };
};

export const isTimeSlotInFuture = (date: Date) => {
    return date.getTime() > Date.now();
};


export const isValidTime = (time: string): boolean => {
    return /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(time);
};

export const isStartBeforeEnd = (start: string, end: string): boolean => {
    return new Date(`1970-01-01T${start}`) < new Date(`1970-01-01T${end}`);
};

// Check if date is in YYYY-MM-DD format
export const isValidDate = (dateString: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};

// Check if date is in the past
export const isPastDate = (dateString: string): boolean => {
    const inputDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare dates without time
    return inputDate < today;
};

export function isValidDays(value: any): boolean {
    if (!Array.isArray(value)) {
        throw new Error('days_of_week must be an array');
    }
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    // Normalize each day: trim and convert to lowercase
    const normalized = value.map((day: any) => {
        if (typeof day !== 'string') {
            throw new Error('Each day must be a string');
        }
        return day.trim().toLowerCase();
    });
    if (!normalized.every((day: string) => validDays.includes(day))) {
        throw new Error('Invalid days_of_week value');
    }
    return true;
}


