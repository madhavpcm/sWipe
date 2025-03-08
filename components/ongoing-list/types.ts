interface OngoingListDataType {
    name: string;
    type: string;
    progress: number;
    dateString: string;
}

interface MonthListDataType {
    name: string,
    thumbnail:string,
    itemCount:number,
    totalSize:number
    inProgress?:boolean,
    type?:string,
    dateObj: Date
}