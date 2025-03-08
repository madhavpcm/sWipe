import { View, Text, FlatList } from 'react-native'
import React from 'react'
import { getMonthNameFromOneBasedIndex } from '@/util/DateUtil';
import { getImageCountByMonthYear } from '@/util/SwipeAndroidLibary';

const MonthList = () => {
    const getOngoingListData = async (): Promise<Array<MonthListDataType>> => {
        const dataCountByMonthSorted :MediaData[] = await getImageCountByMonthYear();
    
        // in the same sorted order transform this to OngoingListDataType
        const transformedData:MonthListDataType[] = dataCountByMonthSorted.map((item) => {
            return {
                name: `${getMonthNameFromOneBasedIndex(item.month)} ${item.year}`,
                type: "Month",
                inProgress:false,
                dateObj:new Date(),
                itemCount:transformedData.length,
                totalSize:transformedData.length,
                thumbnail:""
            }
        })
        return transformedData
    }
        
        

    const data:any[] =[] 
  return (
    <View>
      <FlatList
                         className=" "
                         data={data}
                         renderItem={renderItem}
                         keyExtractor={(item, index) => index.toString()}
                         contentContainerStyle={{ paddingBottom: 175 }}
                     />
    </View>
  )
}



const renderItem = ()=> {
    return  (
        <View
        >

        </View>
    )
}

export default MonthList