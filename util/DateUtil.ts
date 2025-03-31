const monthMap: Record<string, number> = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
};

// get month string from index
export const getZeroIndexOfMonth = (month: string) => monthMap[month];

export const getMonthNameFromOneBasedIndex = (index: number): string => {
    const key =
        Object.keys(monthMap).find((key) => monthMap[key] === index - 1) ?? '';
    return key;
};

export const getMonthNameFromZeroBasedIndex = (index: number): string => {
    const key =
        Object.keys(monthMap).find((key) => monthMap[key] === index) ?? '';
    return key;
};

export const convertDateToRelativeTimeString = (date: Date | null) => {
    if (!date) return 'Never';

    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    if (diffInDays < 1) return 'Today';
    if (diffInDays < 2) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
};
