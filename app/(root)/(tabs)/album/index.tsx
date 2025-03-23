import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Title } from '@/components/common/title'
import AlbumList from '@/components/album-list'
import { MaterialIcons } from '@expo/vector-icons'

const index = () => {
  return (
    <View
    className='flex-1 bg-white px-3'
    >   
     <AlbumList />
    </View>
  )
}

export default index