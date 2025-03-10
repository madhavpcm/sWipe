
const monthMap: Record<string, number>  = {
    'January': 0, 'February': 1, 'March': 2, 'April': 3,
    'May': 4, 'June': 5, 'July': 6, 'August': 7,
    'September': 8, 'October': 9, 'November': 10, 'December': 11
  };



// get month string from index
export const getZeroIndexOfMonth = (month: string) => monthMap[month];

export const getMonthNameFromOneBasedIndex = (index: number): string => {
  const key =  Object.keys(monthMap).find(key => monthMap[key] === index-1) ?? '';
  return key;
}
