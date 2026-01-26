import { BlurView } from 'expo-blur';
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

// Icons
import Ionicons from "@expo/vector-icons/Ionicons";
import Octicons from "@expo/vector-icons/Octicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { router } from "expo-router";
import analysis from "../../src/components/analysis";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 375;

export default function HomeScreen() {
  const cameraRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Animation effects
  const animateButton = (callback) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(callback);
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.loadingGradient}>
          <MaterialIcons name="camera" size={60} color="#fff" />
          <Text style={styles.loadingText}>กำลังโหลด...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.permissionGradient}>
          <View style={styles.permissionContent}>
            <MaterialIcons name="camera-alt" size={80} color="#fff" style={styles.permissionIcon} />
            <Text style={styles.permissionTitle}>ต้องการเข้าถึงกล้อง</Text>
            <Text style={styles.permissionMessage}>
              แอปนี้ต้องการเข้าถึงกล้องเพื่อถ่ายภาพและวิเคราะห์คุณภาพการสี
            </Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <LinearGradient colors={['#4CAF50', '#45a049']} style={styles.permissionButtonGradient}>
                <Text style={styles.permissionButtonText}>อนุญาต</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const runAnalysis = async (uri) => {
    const result = await analysis(uri);

    if (!result || typeof result.percentage !== "number") {
      throw new Error("Invalid analysis result");
    }

    return result;
  };

  const takePic = async () => {
    if (!cameraRef.current?.takePictureAsync) {
      Alert.alert("กล้องยังไม่พร้อม");
      return;
    }


    animateButton(async () => {
      let options = {
        quality: 0.8,
        exif: false,
      };


      try {
        let newPhoto = await cameraRef.current.takePictureAsync(options);
        setPhoto(newPhoto);
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถถ่ายภาพได้");
      }
    });
  };

  const pickAndUploadImage = async () => {
    if (isAnalyzing) return;

    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert("จำเป็นต้องขออนุญาต", "ต้องการเข้าถึงแกลเลอรี่เพื่อเลือกรูปภาพ");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const selectedImageUri = result.assets[0].uri;
      setIsAnalyzing(true);

      try {
        const result = await runAnalysis(selectedImageUri);
        const analysisResult = result.percentage;
        console.log("Analysis result:", analysisResult);

        if (typeof analysisResult === "number" && !isNaN(analysisResult)) {
          Alert.alert("ผลการวิเคราะห์", `คุณภาพการสี: ${analysisResult}%`, [
            {
              text: "ดูประวัติ",
              onPress: () => router.push({
                pathname: "/historyscreen",
                params: { newData: analysisResult.toString() },
              })
            },
            { text: "ตกลง", style: "default" }
          ]);
        } else {
          Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถวิเคราะห์รูปภาพได้ กรุณาลองใหม่");
        }
      } catch (error) {
        console.error("Error analyzing image:", error);
        Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถวิเคราะห์รูปภาพได้");
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  //const handleAnalysis = async () => {
    //if (!photo?.uri) return;
  const handleAnalysis = async () => {
    if (isAnalyzing || !photo?.uri) return;

    setIsAnalyzing(true);
    Animated.timing(fadeAnim, {
      toValue: 0.5,
      duration: 300,
      useNativeDriver: true,
    }).start();

    try {
      const result = await runAnalysis(photo.uri);
      const numericResult = result.percentage;
      console.log("Analysis result:", numericResult);

      if (!isNaN(numericResult)) {
        Alert.alert("ผลการวิเคราะห์", `คุณภาพการสี: ${numericResult}%`, [
          {
            text: "ดูประวัติ",
            onPress: () => {
              setPhoto(null);
              router.push({
                pathname: "/historyscreen",
                params: { newData: numericResult.toString() },
              });
            }
          },
          {
            text: "ถ่ายใหม่",
            onPress: () => setPhoto(null),
            style: "default"
          }
        ]);
      } else {
        Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถวิเคราะห์รูปภาพได้ กรุณาลองใหม่");
      }
    } catch (error) {
      console.error("Error analyzing photo:", error);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถวิเคราะห์รูปภาพได้");
    } finally {
      setIsAnalyzing(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const retakePhoto = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setPhoto(null);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Header */}
      <BlurView intensity={80} tint="light" style={styles.header}>
        <Text style={styles.headerTitle}>วิเคราะห์คุณภาพการสี</Text>
        <Text style={styles.headerSubtitle}>ถ่ายภาพหรือเลือกจากแกลเลอรี่</Text>
      </BlurView>

      {/* Camera Container */}
      <View style={styles.cameraWrapper}>
        <Animated.View style={[styles.cameraContainer, { opacity: fadeAnim }]}>
          {!photo ? (
            <CameraView
              style={styles.camera}
              ref={cameraRef}
              ratio="1:1"
            />
          ) : (
            <Image source={{ uri: photo.uri }} style={styles.camera} />
          )}

          {/* Overlay Grid */}
          {!photo && (
            <View style={styles.gridOverlay}>
              <View style={styles.gridLine} />
              <View style={[styles.gridLine, styles.gridLineVertical]} />
            </View>
          )}
        </Animated.View>

        {/* Focus indicator */}
        {!photo && (
          <View style={styles.focusIndicator}>
            <View style={styles.focusCorner} />
            <View style={[styles.focusCorner, styles.focusCornerTopRight]} />
            <View style={[styles.focusCorner, styles.focusCornerBottomLeft]} />
            <View style={[styles.focusCorner, styles.focusCornerBottomRight]} />
          </View>
        )}
      </View>

      {/* Controls */}
      <BlurView intensity={80} tint="light" style={styles.controls}>
        {!photo ? (
          <>
            {/* History Button */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => router.push("/historyscreen")}
            >
              <LinearGradient colors={['#667eea', '#764ba2']} style={styles.controlButtonGradient}>
                <MaterialIcons name="history" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.controlButtonText}>ประวัติ</Text>
            </TouchableOpacity>

            {/* Camera Button */}
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity style={styles.captureButton} onPress={takePic}>
                <LinearGradient colors={['#4CAF50', '#45a049']} style={styles.captureButtonGradient}>
                  <FontAwesome name="camera" size={32} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Gallery Button */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={pickAndUploadImage}
              disabled={isAnalyzing}
            >
              <LinearGradient
                colors={isAnalyzing ? ['#ccc', '#aaa'] : ['#FF6B6B', '#FF5252']}
                style={styles.controlButtonGradient}
              >
                {isAnalyzing ? (
                  <Animated.View style={{ transform: [{ rotate: '360deg' }] }}>
                    <Ionicons name="refresh" size={24} color="#fff" />
                  </Animated.View>
                ) : (
                  <Octicons name="upload" size={24} color="#fff" />
                )}
              </LinearGradient>
              <Text style={styles.controlButtonText}>
                {isAnalyzing ? "วิเคราะห์..." : "แกลเลอรี่"}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Analyze Button */}
            <TouchableOpacity
              style={[styles.analysisButton, isAnalyzing && styles.analysisButtonDisabled]}
              onPress={handleAnalysis}
              disabled={isAnalyzing}
            >
              <LinearGradient
                colors={isAnalyzing ? ['#ccc', '#aaa'] : ['#4CAF50', '#45a049']}
                style={styles.analysisButtonGradient}
              >
                {isAnalyzing ? (
                  <>
                    <Ionicons name="analytics" size={20} color="#fff" />
                    <Text style={styles.analysisButtonText}>กำลังวิเคราะห์...</Text>
                  </>
                ) : (
                  <>
                    <MaterialIcons name="analytics" size={20} color="#fff" />
                    <Text style={styles.analysisButtonText}>วิเคราะห์รูปภาพ</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Retake Button */}
            <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
              <LinearGradient colors={['#FF6B6B', '#FF5252']} style={styles.retakeButtonGradient}>
                <MaterialIcons name="refresh" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.controlButtonText}>ถ่ายใหม่</Text>
            </TouchableOpacity>
          </>
        )}
      </BlurView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
  },
  permissionContainer: {
    flex: 1,
  },
  permissionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionIcon: {
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  permissionMessage: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  permissionButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  cameraWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  cameraContainer: {
    width: Math.min(width - 40, height * 0.6),
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  camera: {
    flex: 1,
    backgroundColor: '#000',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  gridLineVertical: {
    width: 1,
    height: '100%',
    left: '33.33%',
  },
  focusIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 80,
    height: 80,
    marginTop: -40,
    marginLeft: -40,
  },
  focusCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#4CAF50',
    borderWidth: 2,
    borderTopLeftRadius: 4,
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
  },
  focusCornerTopRight: {
    top: 0,
    right: 0,
    transform: [{ rotate: '90deg' }],
  },
  focusCornerBottomLeft: {
    bottom: 0,
    left: 0,
    transform: [{ rotate: '-90deg' }],
  },
  focusCornerBottomRight: {
    bottom: 0,
    right: 0,
    transform: [{ rotate: '180deg' }],
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  controlButton: {
    alignItems: 'center',
  },
  controlButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    fontWeight: '500',
  },
  captureButton: {
    alignItems: 'center',
  },
  captureButtonGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  analysisButton: {
    flex: 1,
    marginRight: 10,
  },
  analysisButtonDisabled: {
    opacity: 0.7,
  },
  analysisButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 25,
  },
  analysisButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  retakeButton: {
    alignItems: 'center',
  },
  retakeButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});