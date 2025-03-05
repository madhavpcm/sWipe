import { View, FlatList, Text, TouchableNativeFeedback } from "react-native";
import { Title } from "../common/title";
import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ScrollView } from "react-native-gesture-handler";

export const OngoingList = () => {
    const data = [
        {
            name: "February 2025",
            type: "Month",
            percentage: "88%",
            dateString: "2 days ago",
        },
        {
            name: "March 2025",
            type: "Month",
            percentage: "75%",
            dateString: "5 days ago",
        },
        {
            name: "Project Alpha",
            type: "Album",
            percentage: "60%",
            dateString: "1 week ago",
        },
        {
            name: "Q1 Goals",
            type: "Album",
            percentage: "45%",
            dateString: "2 weeks ago",
        }, {
            name: "February 2025",
            type: "Month",
            percentage: "88%",
            dateString: "2 days ago",
        },
        {
            name: "March 2025",
            type: "Month",
            percentage: "75%",
            dateString: "5 days ago",
        },
        {
            name: "Project Alpha",
            type: "Album",
            percentage: "60%",
            dateString: "1 week ago",
        },
        {
            name: "Q1 Goals",
            type: "Album",
            percentage: "45%",
            dateString: "2 weeks ago",
        },
    ];

    const renderItem = ({ item }) => (
        <TouchableNativeFeedback>
        <View className="flex-row justify-between p-3 border-b border-gray-200">
            <View>
                <Text className="text-lg font-semibold">{item.name}</Text>
                <Text className="text-gray-500">{item.type} - {item.dateString}</Text>
            </View>
            <Text className="text-blue-500 font-semibold">{item.percentage}</Text>
        </View>
        </TouchableNativeFeedback>
    );

    return (
        <View className="flex-1 px-5 mt-12">
            <View className="flex flex-row justify-between border-b-2  border-gray-200 border-dashed pb-1">
                <Title text="Ongoing" subtitle="Pickup where you left off" />
            </View>
            <View
            className="mt-3 h-[400px]"
            >
            <FlatList
            className=" "
                data={data}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
            </View>
            
        </View>
    );
};
