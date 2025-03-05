import {
    View ,
    Text,

} from 'react-native'
import React from 'react'
import Button from '../common/button'
import { MaterialIcons } from '@expo/vector-icons'
export const Banner = () => {
    return (
        <View
          className="h-48 w-[90%] mx-auto border-2 border-dashed border-gray-200 rounded-xl relative"
          >
            <View
            
            className="flex justify-center items-start w-full h-full">
            <Text
            className="text-7xl font-rubik-semibold p-4 text-center text-blue-500"
            >
              50 % <Text
              className="text-black text-2xl font-rubik-medium "
              >Storage used </Text>
            </Text>

              </View>
              <Button
              size="md"
              title="More Stats"
              textClassName='text-xl'
              containerClassName=" absolute -bottom-5 right-5 "
              borderRadius={15}
              iconPosition="right"
              icon = {<MaterialIcons name="chevron-right" color={"white"} size={24} className="mr-3" />}
              >

              </Button>

            
            </View>
    )
}