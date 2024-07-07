import React from 'react'
import {View, StyleSheet, Text, Image, useWindowDimensions} from 'react-native';
function OnboardingItem({item}) {
    const {width} = useWindowDimensions();

  return (
    <View style={[styles.container, {width}]}>
        <Image source={item.image} style={[styles.image, {width, resizeMode: 'contain'}]}/>
        <View style={{flex: 0.3}}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>

        </View>
    </View>
  )
}

export default OnboardingItem;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',

    },
    image: {
        flex: 0.7,
        justifyContent: 'center',
    },
    title: {
        fontWeight: '800',
        fontSize: 28,
        marginBottom: 10,
        color: '#008955',
        textAlign: 'center',
    },
    description: {
        fontWeight: '400',
        fontSize: 22,
        color: '#008955',
        textAlign: 'center',
        paddingHorizontal: 64,
    },
});