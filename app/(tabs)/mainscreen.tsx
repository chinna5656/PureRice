import { BlurView } from 'expo-blur';
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
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
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { router } from "expo-router";
import analysis from "../../src/components/analysis";

const { width, height } = Dimensions.get("window");
const CAMERA_SIZE = Math.min(width - 40, height * 0.55);

export default function HomeScreen() {
  const cameraRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Animation Refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Scanning Animation Loop
  useEffect(() => {
    if (!photo) {
      const scanAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      );
      scanAnimation.start();
      return () => scanAnimation.stop();
    }
  }, [photo]);

  const scanTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, CAMERA_SIZE],
  });

  // Button Press Animation
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
      <View style={styles.centerContainer}>
         <StatusBar style="light" />
         <Text style={styles.loadingText}>กำลังโหลด...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <StatusBar style="light" />
        <LinearGradient colors={['#1a1a1a', '#2d3436']} style={styles.permissionGradient}>
          <View style={styles.permissionContent}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="camera-alt" size={60} color="#fff" />
            </View>
            <Text style={styles.permissionTitle}>อนุญาตการใช้กล้อง</Text>
            <Text style={styles.permissionMessage}>
              แอปพลิเคชันต้องการเข้าถึงกล้องเพื่อทำการวิเคราะห์คุณภาพสีจากภาพถ่ายของคุณ
            </Text>
            <TouchableOpacity activeOpacity={0.8} onPress={requestPermission}>
              <LinearGradient colors={['#667eea', '#764ba2']} style={styles.permissionButton}>
                <Text style={styles.permissionButtonText}>อนุญาตการเข้าถึง</Text>
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
    if (!cameraRef.current?.takePictureAsync) return;

    animateButton(async () => {
      try {
        let options = { quality: 0.8, exif: false };
        let newPhoto = await cameraRef.current.takePictureAsync(options);
        setPhoto(newPhoto);
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert("ผิดพลาด", "ไม่สามารถถ่ายภาพได้");
      }
    });
  };

  const pickAndUploadImage = async () => {
    if (isAnalyzing) return;

    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert("แจ้งเตือน", "ต้องการสิทธิ์เข้าถึงอัลบั้มรูปภาพ");
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
        showAnalysisResult(result.percentage);
      } catch (error) {
        Alert.alert("ผิดพลาด", "ไม่สามารถวิเคราะห์รูปภาพได้");
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleAnalysis = async () => {
    if (isAnalyzing || !photo?.uri) return;

    setIsAnalyzing(true);
    
    try {
      const result = await runAnalysis(photo.uri);
      showAnalysisResult(result.percentage);
    } catch (error) {
      Alert.alert("ผิดพลาด", "ไม่สามารถวิเคราะห์รูปภาพได้");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const showAnalysisResult = (percentage) => {
    if (!isNaN(percentage)) {
      Alert.alert("ผลการวิเคราะห์", `คุณภาพสี: ${percentage}%`, [
        {
          text: "ดูประวัติ",
          onPress: () => {
            setPhoto(null);
            router.push({
              pathname: "/historyscreen",
              params: { newData: percentage.toString() },
            });
          }
        },
        {
          text: "ปิด",
          style: "cancel",
          onPress: () => {} 
        }
      ]);
    } else {
      Alert.alert("ผิดพลาด", "ผลการวิเคราะห์ไม่ถูกต้อง");
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
  };

  // Handler สำหรับปุ่ม Profile
  const handleProfilePress = () => {
    // นำทางไปหน้า Profile (ตรวจสอบว่า path นี้มีอยู่จริง หรือเปลี่ยนเป็น path ที่ถูกต้อง)
    router.push("/profilescreen"); 
    // หรือถ้ายังไม่มีหน้า Profile ให้ใช้ Alert ชั่วคราว:
    // Alert.alert("Profile", "Coming soon...");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header - UPDATED */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>AI Color Analysis</Text>
            <Text style={styles.headerSubtitle}>ถ่ายภาพเพื่อวิเคราะห์คุณภาพ</Text>
          </View>

          {/* New Profile Button */}
          <TouchableOpacity 
            style={styles.profileButton} 
            onPress={handleProfilePress}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              style={styles.profileGradient}
            >
              <Ionicons name="person" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Main Content (Camera Area) */}
        <View style={styles.contentContainer}>
          <View style={styles.cameraFrame}>
            <Animated.View style={[styles.cameraWrapper, { opacity: fadeAnim }]}>
              {!photo ? (
                <CameraView
                  style={styles.camera}
                  ref={cameraRef}
                  ratio="1:1"
                />
              ) : (
                <Image source={{ uri: photo.uri }} style={styles.camera} />
              )}

              {/* Scanning Effect Overlay */}
              {!photo && !isAnalyzing && (
                <View style={StyleSheet.absoluteFill}>
                   {/* Corner Brackets */}
                   <View style={[styles.corner, styles.tl]} />
                   <View style={[styles.corner, styles.tr]} />
                   <View style={[styles.corner, styles.bl]} />
                   <View style={[styles.corner, styles.br]} />
                   
                   {/* Scanning Line */}
                   <Animated.View 
                     style={[
                       styles.scanLine, 
                       { transform: [{ translateY: scanTranslateY }] }
                     ]} 
                   >
                     <LinearGradient
                        colors={['rgba(0,255,150,0)', 'rgba(0,255,150,0.8)', 'rgba(0,255,150,0)']}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 0}}
                        style={{flex:1}}
                     />
                   </Animated.View>
                </View>
              )}
            </Animated.View>
          </View>
        </View>

        {/* Bottom Controls */}
        <BlurView intensity={30} tint="dark" style={styles.bottomSheet}>
          {!photo ? (
            <View style={styles.controlsRow}>
              {/* History */}
              <TouchableOpacity 
                style={styles.sideButton} 
                onPress={() => router.push("/historyscreen")}
              >
                <View style={styles.iconButtonSmall}>
                   <MaterialIcons name="history" size={24} color="#fff" />
                </View>
                <Text style={styles.buttonLabel}>ประวัติ</Text>
              </TouchableOpacity>

              {/* Capture Button */}
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity onPress={takePic} activeOpacity={0.8}>
                  <LinearGradient
                    colors={['#fff', '#e0e0e0']}
                    style={styles.shutterOuter}
                  >
                    <View style={styles.shutterInner} />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Upload */}
              <TouchableOpacity 
                style={styles.sideButton} 
                onPress={pickAndUploadImage}
                disabled={isAnalyzing}
              >
                <View style={styles.iconButtonSmall}>
                  {isAnalyzing ? (
                     <MaterialCommunityIcons name="loading" size={24} color="#fff" />
                  ) : (
                     <Ionicons name="images-outline" size={24} color="#fff" />
                  )}
                </View>
                <Text style={styles.buttonLabel}>อัลบั้ม</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.actionControls}>
              <TouchableOpacity style={styles.retakeBtn} onPress={retakePhoto}>
                 <Ionicons name="close" size={24} color="#fff" />
                 <Text style={styles.retakeText}>ถ่ายใหม่</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.analyzeBtn} 
                onPress={handleAnalysis}
                disabled={isAnalyzing}
              >
                <LinearGradient
                  colors={isAnalyzing ? ['#7f8c8d', '#95a5a6'] : ['#667eea', '#764ba2']}
                  style={styles.analyzeGradient}
                  start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                >
                  {isAnalyzing ? (
                    <Text style={styles.analyzeText}>กำลังวิเคราะห์...</Text>
                  ) : (
                    <>
                      <MaterialIcons name="auto-fix-high" size={20} color="#fff" style={{marginRight: 8}}/>
                      <Text style={styles.analyzeText}>เริ่มวิเคราะห์</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </BlurView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 16,
  },
  
  // Permission Styles
  permissionContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContent: {
    width: '85%',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 30,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionMessage: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  permissionButton: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 5,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Header Styles (Updated)
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    position: 'relative', // เพื่อให้ profileButton อ้างอิงตำแหน่งได้
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 5,
  },
  
  // Profile Button Styles (New)
  profileButton: {
    position: 'absolute',
    right: 20, // ชิดขวา
    top: 15, // ระยะจากด้านบน
    zIndex: 10,
  },
  profileGradient: {
    width: 40,
    height: 40,
    borderRadius: 20, // วงกลม
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  // Camera Area Styles
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraFrame: {
    width: CAMERA_SIZE,
    height: CAMERA_SIZE,
    borderRadius: 24,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cameraWrapper: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  
  // Scanning Overlay
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(0,255,150,0.5)',
    shadowColor: '#00ff96',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    zIndex: 10,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#00ff96',
    borderWidth: 3,
  },
  tl: { top: 10, left: 10, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 10 },
  tr: { top: 10, right: 10, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 10 },
  bl: { bottom: 10, left: 10, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 10 },
  br: { bottom: 10, right: 10, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 10 },

  // Bottom Controls Styles
  bottomSheet: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    paddingTop: 30,
    paddingHorizontal: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sideButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  iconButtonSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  buttonLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  
  // Shutter Button
  shutterOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ccc',
  },

  // Action Controls (Retake/Analyze)
  actionControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  retakeText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: '600',
  },
  analyzeBtn: {
    flex: 1,
    marginLeft: 15,
  },
  analyzeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 25,
  },
  analyzeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});