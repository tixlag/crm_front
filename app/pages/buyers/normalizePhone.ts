const cleanPhone = (phone: string): string => {
    return phone.replace(/[^+0-9]/g, '');
};

const normalizePhone = (phone: string): string => {
    if (!phone.startsWith('+')) {
        phone = '+' + phone;
    }
    return phone;
};

const isValidPhone = (phone: string): boolean => {
    const regex = /^\+[0-9]{11}$/;
    return regex.test(phone);
};

export const normalizePhoneNumber = (phone: string): string | null => {
    const cleaned = cleanPhone(phone);
    const normalized = normalizePhone(cleaned);

    if (isValidPhone(normalized)) {
        return normalized;
    }
    return null;
};