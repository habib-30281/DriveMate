import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';

import * as ImagePicker from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import * as ImageManipulator from 'expo-image-manipulator';
import Config from '../../../constant/Config';
const carBrand = [
    'Toyota',
    'Honda',
    'Suzuki',
    'Hyundai',
    'Kia',
    'Daihatsu',
    'Nissan',
    'Mitsubishi',
    'Mazda',
    'Ford',
    'Chevrolet',
    'Mercedes-Benz',
    'BMW',
    'Audi',
    'Volkswagen',
    'Lexus',
    'Subaru',
    'Jeep',
    'Land Rover',
    'Range Rover',
    'Volvo',
    'Peugeot',
    'Renault',
    'Fiat',
    'Mini',
    'Porsche',
    'JAC',
    'FAW',
    'MG',
    'Proton',
    'Changan',
    'ZOTYE',
    'United',
    'Prince',
    'Regal',
];

function DriverLicenses() {
    const route = useRoute(); // Use the useRoute hook
    const navigation = useNavigation();
    const { name, email, phoneNo, selectGender, age, password, imageFront, imageBack } = route.params || {};
    const [drivingLicense, setDrivingLicense] = useState(null);
    const [carLicense, setCarLicense] = useState(null);
    const [selectCarBrand, setSelectCarBrand] = useState('');
    // const [drivingLicense, setDrivingLicense] = useState('');
    // const [carLicense, setCarLicense] = useState('');

    useEffect(() => {
        // This will be called after `imageFront` is updated
        if (drivingLicense) {
            console.log("Updated Image Driving License url", drivingLicense);
        }
    }, [drivingLicense]); // This effect depends on `imageFront`

    useEffect(() => {
        // This will be called after `imageFront` is updated
        if (carLicense) {
            console.log("Updated Image carLisense url", carLicense);
        }
    }, [carLicense]); // This effect depends on `imageFront`


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
                setDrivingLicense(result.assets[0].uri);
                // setVisible(false);
            }
        } catch (error) {
            console.error("Error selecting image: ", error);
        }
    };

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

                setCarLicense(result.assets[0].uri); // Update state with the resized image URI

                // Convert the resized image to Base64
                // const carLicenseBase64 = await FileSystem.readAsStringAsync(resizedImage.uri, { encoding: 'base64' });
                // console.log("Base64 String: ", carLicenseBase64);
                // setCarLicense(carLicenseBase64); // Update state with the Base64 string

            }
        } catch (error) {
            console.error("Error picking or manipulating image: ", error);
            Alert.alert("Error", "Failed to process the image. Please try again later.");
        }
    };


    const handleImageUpload = async (imageUri) => {

        if (!imageUri) {
            console.warn('No image URI provided to handleImageUpload');
            return null; // or return an appropriate default object if needed
        }
        let fileType = 'image/jpeg'; // Default file type
        let fileName = `image-${Date.now()}.jpg`; // Default file name with timestamp

        // Attempt to extract file extension from the URI
        let fileExtension = 'jpg';
        const uriParts = imageUri.split('/').pop().split('?')[0].split('.');
        if (uriParts.length > 1) {
            fileExtension = uriParts.pop();
            fileType = `image/${fileExtension}`;
            fileName = `image-${Date.now()}.${fileExtension}`;
        }


        return {
            uri: imageUri,
            type: fileType,
            name: fileName,
        };
    };


    const handleSubmit = async () => {
        // Initialize FormData
        const formData = new FormData();

        // Append driver data fields to formData
        formData.append('name', name);
        formData.append('email', email);
        formData.append('mobile', phoneNo);
        formData.append('gender', selectGender);
        formData.append('age', age);
        formData.append('password', password);
        formData.append('imageFront', await handleImageUpload(imageFront));
        formData.append('imageBack', await handleImageUpload(imageBack));
        formData.append('drivingLicense', await handleImageUpload(drivingLicense));
        formData.append('carLicense', await handleImageUpload(carLicense));
        formData.append('selectCarBrand', selectCarBrand);

        // Append image files to formData; make sure to replace `imageFront`, `imageBack`, etc., 
        // with the actual File objects or URIs for the images
        

        // Use axios to send formData
        axios.post(`${Config.apiBaseUrl}/driver/register`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }).then(res => {
            if (res.data.status === "ok") {
                Alert.alert("Registration Successful", "You have registered successfully!");
                navigation.navigate('driverRegComplete');
            } else {
                Alert.alert("Registration Failed", JSON.stringify(res.data));
            }
        }).catch(e => {
            console.error("Registration Error: ", e);
            Alert.alert("Registration Error", "An error occurred during registration.");
        });
    }




    return (
        <ScrollView style={styles.container}>
            
            <TouchableOpacity
                style={styles.customBackButton}
                onPress={() => navigation.goBack()}>
                <AntDesign name="arrowleft" style={styles.Icon} />
                <Text style={styles.customTextButton}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.headerText}>Submit Your Document</Text>
            <Text style={styles.descriptionText}>National licenses</Text>
            <Text>name: {name}</Text>
            <Text>Email: {email}</Text>
            <Text>mobile no: {phoneNo}</Text>

            <View style={{ backgroundColor: 'gray', height: 200, margin: 20 }}>
                {drivingLicense && (
                    <View>
                        <Image
                            source={{ uri: drivingLicense }}
                            style={{ width: '96%', height: '100%', resizeMode: 'cover' }}
                        />
                    </View>
                )}
            </View>

            <TouchableOpacity
                style={[styles.uploadButton]}
                onPress={choosePhotoFrontLibrary}>
                <Text style={styles.registerAccountBtnText}>
                    Upload your driving licenses
                </Text>
            </TouchableOpacity>

            <View style={{ backgroundColor: 'gray', height: 200, margin: 20 }}>
                {carLicense && (
                    <View>
                        <Image
                            source={{ uri: carLicense }}
                            style={{ width: '96%', height: '100%', resizeMode: 'cover' }}
                        />
                    </View>
                )}
            </View>
            <TouchableOpacity
                style={[styles.uploadButton]}
                onPress={choosePhotoBackLibrary}>
                <Text style={styles.registerAccountBtnText}>
                    Upload your car licenses
                </Text>
            </TouchableOpacity>

            <View style={styles.pickerContainer}>
                {/* <Picker
          selectedValue={selectCarBrand}
          onValueChange={value => setSelectCarBrand(value)}>
          {carBrand.map((Car, index) => (
            <Picker.Item key={index} label={Car} value={Car} style={{fontSize: 20, fontWeight: '400'}} />
          ))}
        </Picker> */}
                <RNPickerSelect
                    onValueChange={(value) => setSelectCarBrand(value)}
                    style={styles.pickerSelectStyle} // Use your existing styles
                    items={carBrand.map((Car) => ({ label: Car, value: Car }))}
                    placeholder={{ label: 'Select Car Brand', value: null }}
                />
            </View>

            <TouchableOpacity
                style={[styles.registerAccountButton]}
                onPress={() => handleSubmit()}>
                <Text style={styles.registerAccountBtnText}>Submit</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

export default DriverLicenses;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    Icon: {
        color: '#414141',
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
        marginBottom: 20,
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
    pickerContainer: {
        // borderWidth: 2,
        // borderColor: 'gray',
        borderRadius: 6,
        width: '93%',
        marginVertical: 15,
        fontSize: 20,
        height: 60,
        marginLeft: 15,
    },
    pickerSelectStyle: {
        inputIOS: {
            fontSize: 20,
            height: 60,
            paddingVertical: 12,
            paddingHorizontal: 10,
            borderWidth: 1,
            borderColor: 'gray',
            borderRadius: 5,
            paddingRight: 30, 
        },
        inputAndroid: {
            fontSize: 20,
            height: 60,
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: 'gray',
            borderRadius: 5,
            paddingRight: 30, 
        },
        placeholder: {
            color: 'gray',
        },
        iconContainer: {
            top: 10,
            right: 12,
        },
    },
});
