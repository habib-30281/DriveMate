import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Image } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import * as ImageManipulator from 'expo-image-manipulator';
function DriverDocuments() {
    const route = useRoute(); // Use the useRoute hook
    const navigation = useNavigation();
    const { name, email, phoneNo, selectGender, age, password } = route.params || {};

    const [imageFront, setImageFront] = useState(null);
    const [imageBack, setImageBack] = useState(null);
    const [photoFront, setPhotoFront] = useState('');
    const [photoBack, setPhotoBack] = useState('');

    useEffect(() => {
        // This will be called after `imageFront` is updated
        if (imageFront) {
            console.log("Updated Image CNIC front url", imageFront);
        }
    }, [imageFront]); // This effect depends on `imageFront`

    useEffect(() =>{
        if(imageBack){
            console.log("Updated Image CNIC back url", imageBack);
        }
    }, [imageBack]);

    const choosePhotoFrontLibrary = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                alert("You've refused to allow this app to access your photos!");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
            });

            if (!result.canceled && result.assets) {
                console.log("Selected image URI: ", result.assets[0].uri);
                setImageFront(result.assets[0].uri);

            }
        } catch (error) {
            console.error("Error selecting image: ", error);
        }
    }

   
    const choosePhotoBackLibrary = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                alert("You've refused to allow this app to access your photos!");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
            });

            if (!result.canceled && result.assets) {
                console.log("Selected image URI: ", result.assets[0].uri);
                setImageBack(result.assets[0].uri);
                // setVisible(false);
            }
        } catch (error) {
            console.error("Error selecting image: ", error);
        }
    }

    function handleSubmit() {

        navigation.navigate('driverLicenses', { 
            name,
            email,
            phoneNo,
            selectGender,
            age,
            password,
            imageFront,
            imageBack,
         });
    }


    return (
        <View style={styles.container}>

            <TouchableOpacity
                style={styles.customBackButton}
                onPress={() => navigation.goBack()}>
                <AntDesign name="arrowleft" style={styles.Icon} />
                <Text style={styles.customTextButton}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.headerText}>Submit Your Document</Text>
            <Text style={styles.descriptionText}>National ID Card</Text>
            <Text>name: {name}</Text>
            <Text>email: {email}</Text>
            <Text>phone: {phoneNo}</Text>


            <View style={{ backgroundColor: 'gray', height: 200, margin: 20 }}>
                {imageFront && (
                    <View>
                        <Image source={{ uri: imageFront }} style={{ width: '96%', height: '100%', resizeMode: 'cover' }} />
                    </View>
                )}
            </View>

            <TouchableOpacity
                style={[styles.uploadButton]}
                onPress={choosePhotoFrontLibrary}>
                <Text style={styles.registerAccountBtnText}>Upload ID Front</Text>
            </TouchableOpacity>

            <View style={{ backgroundColor: 'gray', height: 200, margin: 20 }}>
                {imageBack && (
                    <View>
                        <Image source={{ uri: imageBack }} style={{ width: '96%', height: '100%', resizeMode: 'cover' }} />
                    </View>
                )}
            </View>
            <TouchableOpacity
                style={[styles.uploadButton]}
                onPress={choosePhotoBackLibrary} >
                <Text style={styles.registerAccountBtnText}>Upload ID Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.registerAccountButton]}
                onPress={() => handleSubmit()} >
                <Text style={styles.registerAccountBtnText}>Submit</Text>
            </TouchableOpacity>

        </View>
    );
}

export default DriverDocuments;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    Icon: {
        color: '#008955',
        fontSize: 22,
    },
    customBackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 50,
        marginLeft: 2,
    },
    customTextButton: {
        fontSize: 18,
        marginLeft: 8,
        fontWeight: '500',
        color: '#414141',
    },
    headerText: {
        fontSize: 28,
        marginTop: 8,
        color: '#0c0c0d',
        padding: 10,
        fontWeight: '400',
        textAlign: 'center',
    },
    descriptionText: {
        fontSize: 22,
        color: '#0c0c0d',
        fontWeight: '400',
        textAlign: 'center',
    },
    registerAccountButton: {
        // marginBottom: 20,
        marginTop: 15,
        width: '93%',
        backgroundColor: '#008955',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginLeft: 15,
        marginRight: 15,
    },
    registerAccountBtnText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '500',
    },
    uploadButton: {
        marginBottom: 10,
        width: '93%',
        backgroundColor: '#008955',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginLeft: 15,
        marginRight: 15,
    },
});
