import {Text, View} from "react-native"
import React  from "react"

export const Title = ({text,subtitle}:{text:string,subtitle?:string}) => {
    return (
        <View
        className="flex flex-col gap-1"
        >
        <Text
        className="text-4xl font-rubik-medium"
        > 
            {text}
        </Text>
        {subtitle&& <Text
        
        className="text-xl  text-slate-500 font-rubik">
            {subtitle}
        </Text>}
        </View>
    )
}