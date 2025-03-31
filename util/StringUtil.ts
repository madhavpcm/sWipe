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
