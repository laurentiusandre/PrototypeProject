import React from 'react';
import { View, Text } from 'react-native';

const getTitle = item => {
    let mainText = item.name;
    if (item.admin1)
      mainText += ", " + item.admin1;

    return mainText;
  };

const ItemText = ({ item }) => {
  const mainText = getTitle(item);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", padding: 15 }}>
      <View style={{ flexShrink: 1 }}>
        <Text style={{ fontWeight: "700" }}>{mainText}</Text>
        <Text style={{ fontSize: 12 }}>{item.country}</Text>
      </View>
    </View>
  );
};

export default ItemText;