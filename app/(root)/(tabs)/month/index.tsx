import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Title } from '@/components/common/title'
import { MaterialIcons } from '@expo/vector-icons'
import MonthList from '@/components/month-list'

const month = () => {
  return (
    <View
    className='flex-1 bg-white px-3'
    >
      <View
      className='flex flex-row justify-between items-baseline '
      >
     <Title
     text='Timeline'
     subtitle='Over the years'
     />
     <View
     className=' flex-row gap-x-3'
     >
      <TouchableOpacity>
        <MaterialIcons
        name='arrow-upward'
        size={25}
        />
      </TouchableOpacity>
      <TouchableOpacity>
        <MaterialIcons
        name='filter-list'
        size={25}
        />
      </TouchableOpacity>
     </View>
     </View>
     <MonthList />

    </View>
  )
}

export default month