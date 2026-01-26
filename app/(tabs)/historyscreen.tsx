import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, StatusBar, TouchableOpacity } from 'react-native';
import { Text, Surface, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native'; // เพิ่ม useNavigation
import { useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const STORAGE_KEY = 'rice_data';
const MAX_ITEMS = 100;

export default function HistoryScreen() {
  const [tonkhaoList, setTonkhaoList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { newData } = useLocalSearchParams();
  const navigation = useNavigation(); // สร้างตัวแปร navigation

  useFocusEffect(
    useCallback(() => {
      loadTonkhaoList();
    }, [])
  );

  useEffect(() => {
    if (newData !== undefined) {
      const incomingTonkhao = parseFloat(newData);
      if (!isNaN(incomingTonkhao)) {
        handleAddFromOtherScreen(incomingTonkhao);
      }
    }
  }, [newData]);

  const loadTonkhaoList = async () => {
    try {
      setIsLoading(true);
      const value = await AsyncStorage.getItem(STORAGE_KEY);
      if (value !== null) {
        setTonkhaoList(JSON.parse(value));
      }
    } catch (e) {
      console.error('Failed to load', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTonkhaoList = async (list) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch (e) { return false; }
  };

  const handleAddFromOtherScreen = async (value) => {
    const storedData = await AsyncStorage.getItem(STORAGE_KEY);
    let currentList = storedData ? JSON.parse(storedData) : [];
    const newItem = {
      id: Date.now().toString(),
      value: parseFloat(value),
      timestamp: new Date().toLocaleString('th-TH', { 
        day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' 
      }),
    };
    const newList = [newItem, ...currentList].slice(0, MAX_ITEMS);
    await saveTonkhaoList(newList);
    setTonkhaoList(newList);
  };

  const confirmDeleteItem = (id) => {
    Alert.alert('ยืนยันการลบ', 'คุณต้องการลบรายการนี้ใช่หรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ลบ', onPress: () => deleteItem(id), style: 'destructive' }
    ]);
  };

  const deleteItem = async (id) => {
    const newList = tonkhaoList.filter(item => item.id !== id);
    await saveTonkhaoList(newList);
    setTonkhaoList(newList);
  };

  const clearAll = async () => {
    Alert.alert('ล้างประวัติ', 'ต้องการลบข้อมูลทั้งหมดหรือไม่?', [
      { text: 'ยกเลิก' },
      { text: 'ลบทั้งหมด', onPress: async () => {
          await AsyncStorage.removeItem(STORAGE_KEY);
          setTonkhaoList([]);
        }, style: 'destructive' 
      }
    ]);
  };

  const calculateAverage = () => {
    if (tonkhaoList.length === 0) return '0.0';
    const sum = tonkhaoList.reduce((acc, item) => acc + item.value, 0);
    return (sum / tonkhaoList.length).toFixed(1);
  };

  const renderItem = ({ item }) => (
    <Surface style={styles.itemCard} elevation={1}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name="rice" size={22} color="#4caf50" />
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemLabel}>คุณภาพการสี</Text>
        <Text style={styles.itemTimestamp}>{item.timestamp}</Text>
      </View>
      <View style={styles.itemValueContainer}>
        <Text style={styles.itemValueText}>{item.value.toFixed(1)}%</Text>
        <TouchableOpacity hitSlop={{top: 10, bottom: 10, left: 10, right: 10}} onPress={() => confirmDeleteItem(item.id)}>
          <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ff5252" />
        </TouchableOpacity>
      </View>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <IconButton 
          icon="chevron-left" 
          size={30} 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        />
        <IconButton 
          icon="delete-outline" 
          iconColor="#ff5252" 
          onPress={clearAll} 
          disabled={tonkhaoList.length === 0} 
        />
      </View>

      <Text style={styles.headerTitle}>ประวัติการตรวจสอบ</Text>

      {/* Summary Card */}
      <Surface style={styles.summaryCard} elevation={3}>
        <View>
          <Text style={styles.summaryLabel}>ค่าเฉลี่ยคุณภาพการสี</Text>
          <Text style={styles.summaryValue}>{calculateAverage()}<Text style={{fontSize: 20}}> %</Text></Text>
        </View>
        <View style={styles.summaryBadge}>
            <Text style={styles.summaryCount}>{tonkhaoList.length} รายการ</Text>
        </View>
      </Surface>

      <FlatList
        data={tonkhaoList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<Text style={styles.sectionTitle}>รายการทั้งหมด</Text>}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={60} color="#e0e0e0" />
            <Text style={styles.emptyText}>ไม่พบประวัติข้อมูล</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFBFB',
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50,
    marginHorizontal: -10,
  },
  backButton: {
    marginLeft: -5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1C1E',
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#4caf50',
    padding: 24,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  summaryLabel: {
    color: '#E8F5E9',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryValue: {
    color: '#fff',
    fontSize: 38,
    fontWeight: 'bold',
  },
  summaryBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  summaryCount: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#49454F',
    marginBottom: 10,
    marginTop: 5,
  },
  listContainer: {
    paddingBottom: 30,
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F1F8E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 14,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1C1E',
  },
  itemTimestamp: {
    fontSize: 11,
    color: '#909090',
  },
  itemValueContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  itemValueText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontSize: 15,
    color: '#BDBDBD',
    marginTop: 10,
  },
});