import { getMonthNameFromZeroBasedIndex } from './DateUtil';

export function capitalizeFirstLetter(str: string | null | undefined): string {
    if (!str) {
        return '';
    }
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function getTimeBasedMonthKey(time: number): string {
    const date = new Date(time);
    return `${getMonthNameFromZeroBasedIndex(date.getMonth())} ${date.getFullYear()}`;
}

const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];
// deprecate this function
export function isMonthKey(key: string): boolean {
    // check if key is of the form "Month YYYY", where month is a valid month name
    const parts = key.split(' ');
    if (parts.length !== 2) {
        return false;
    }
    const month = parts[0];
    const year = parts[1];
    return (
        monthNames.includes(month) && year.length === 4 && !isNaN(Number(year))
    );
}
