import { View } from "react-native"
import { Title } from "../common/title"
import React from "react"
import Button from "../common/button"
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ScrollView } from "react-native-gesture-handler";



export const OngoingList = () => {
    const data = [
        {
            name:"February 2025",
            type: "Month",
            percentage:"88",
            dateString:"2 days ago"
        },
       
    ]

    return (
        <View
        className= "flex-1 px-5 mt-12"
        >
            <View
            className="flex flex-row justify-between border-b-2  border-dashed border-gray-200 pb-1 "
            >
            <Title
            text="Ongoing"
            subtitle= "Pickup where you left off"
            />
            {/* <Button
            title="Random"
            containerClassName=" rounded-full"
            textClassName="text-sm ml-2"
            borderRadius={100}
            size="sm"
            icon={<FontAwesome name="random" size={20} color="white" />}
            /> */}

            </View>
            <ScrollView>

            </ScrollView>
         
        </View>
    )
}