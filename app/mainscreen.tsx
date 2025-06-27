import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Alert,
  Dimensions,
  Button,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

import Octicons from "@expo/vector-icons/Octicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

// **แก้ไข #1: ใช้เฉพาะ router จาก expo-router เท่านั้น**
import { router } from "expo-router"; 
import analysis from "../components/analysis";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  let cameraRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>ต้องการขออนุญาตเข้าถึงกล้อง</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const takePic = async () => {
  // --- เพิ่มการตรวจสอบตรงนี้ ---
  if (!cameraRef.current) {
    console.log("Camera reference is not available yet.");
    return; // ออกจากฟังก์ชันไปเลย ถ้า camera ยังไม่พร้อม
  }

  let options = {
    quality: 1,
    base64: true,
    exif: false,
  };

  // ณ จุดนี้ เรามั่นใจได้แล้วว่า cameraRef.current ไม่ใช่ null
  let newPhoto = await cameraRef.current.takePictureAsync(options);
  setPhoto(newPhoto);
};

  const pickAndUploadImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert("Permission to access camera roll is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // ใช้ Enum ที่ถูกต้อง
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImageUri = result.assets[0].uri;
      try {
        const analysisResults = await analysis(selectedImageUri);
        const analysisResult = Number(analysisResults);
        if (typeof analysisResult === "number" && !isNaN(analysisResult)) {
          Alert.alert("คุณภาพการสี", analysisResult.toString() + "%");
          
          // **แก้ไข #2: ใช้ router.push เพื่อนำทางและส่งข้อมูล**
          // นี่คือวิธีที่ถูกต้องในการส่งข้อมูลหลังจากประมวลผลเสร็จ
          router.push({
            pathname: "/historyscreen",
            params: { newData: analysisResult.toString() }, // ส่งค่าเป็น string จะปลอดภัยที่สุด
          });

        } else {
          Alert.alert("Error analyzing photo. ลองใหม่อีกครั้ง.");
          throw new Error("Invalid analysis result");
        }
      } catch (error) {
        console.error("Error analyzing image:", error);
        //Alert.alert("Error analyzing photo. Please try again.");
      }
    }
  };

  const handleAnalysis = async () => {
    if (!photo?.uri) return;

    try {
      const result = await analysis(photo.uri);
      const numericResult = Number(result);
      if (!isNaN(numericResult)) {
        Alert.alert("คุณภาพการสี: " + numericResult + "%");
        setPhoto(null); // กลับไปหน้ากล้อง

        // **แก้ไข #3: ใช้ router.push แทน navigation.navigate**
        router.push({
          pathname: "/historyscreen",
          params: { newData: numericResult.toString() }, // ส่งค่าเป็น string
        });
        
      } else {
        Alert.alert("Error analyzing photo. ลองใหม่อีกครั้ง.");
      }
    } catch (error) {
        console.error("Error analyzing photo:", error);
        Alert.alert("Error analyzing photo. Please try again.");
    }
  };

  return (
    <View style={styles.full}>
      <View style={styles.header}>
        <Text style={styles.headerText}></Text>
      </View>

      <View style={styles.container}>
        {!photo ? (
          <CameraView
            style={styles.cameraContainer}
            ref={cameraRef}
            ratio="1:1"
          />
        ) : (
          <Image source={{ uri: photo.uri }} style={styles.cameraContainer} />
        )}
      </View>

      <View style={styles.footer}>
        {!photo ? (
          <>
            <MaterialIcons
              name="history"
              size={30}
              color="#4CAF50"
              // **แก้ไข #4: เปลี่ยนไปใช้ router.push**
              onPress={() => router.push("/historyscreen")}
            />
            <FontAwesome
              name="camera"
              size={30}
              color="#4CAF50"
              onPress={takePic}
            />
            <Octicons
              name="upload"
              size={30}
              color="#4CAF50"
              onPress={pickAndUploadImage}
            />
          </>
        ) : (
          <>
            <Button title="Analysis Photo" onPress={handleAnalysis} />
            <MaterialIcons
              name="delete"
              size={30}
              color="#4CAF50"
              onPress={() => setPhoto(null)}
            />
          </>
        )}
      </View>
    </View>
  );
}

// ... (ส่วนของ styles ไม่มีการเปลี่ยนแปลง)
const styles = StyleSheet.create({
  full: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "black",
  },
  headerText: {
    color: "#000",
    fontSize: 20,
    fontWeight: "bold",
  },
  container: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    width: "99%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cameraContainer: {
    width: "100%",
    height: "100%",
    aspectRatio: 1,
    backgroundColor: "black",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingBottom: 15,
    backgroundColor: "#ffffff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 10,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 20,
    backgroundColor: "rgb(255, 255, 255)",
  },
  message: {
      textAlign: 'center',
      margin: 20
  }
});