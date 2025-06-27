import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TextInput, FlatList, Alert } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';

const STORAGE_KEY = 'rice_data';
const MAX_ITEMS = 100;

export default function HistoryScreen() {
  const [tonkhaoList, setTonkhaoList] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { newData } = useLocalSearchParams();

  // โหลดข้อมูลเมื่อหน้าจอถูกโฟกัส
  useFocusEffect(
    useCallback(() => {
      loadTonkhaoList();
    }, [])
  );

  // จัดการกับข้อมูลใหม่ที่ส่งมาจากหน้าอื่น
  useEffect(() => {
    if (newData !== undefined) {
      const incomingTonkhao = parseFloat(newData);
      if (!isNaN(incomingTonkhao)) {
        handleAddFromOtherScreen(incomingTonkhao);
      }
    }
    loadTonkhaoList();
  }, [newData]);

  const loadTonkhaoList = async () => {
    try {
      setIsLoading(true);
      const value = await AsyncStorage.getItem(STORAGE_KEY);
      if (value !== null) {
        setTonkhaoList(JSON.parse(value));
      }
    } catch (e) {
      console.error('Failed to load tonkhao list.', e);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลต้นข้าวได้');
    } finally {
      setIsLoading(false);
    }
  };

  const saveTonkhaoList = async (list) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      console.error('Failed to save tonkhao list.', e);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลต้นข้าวได้');
      return false;
    }
  };

  // ฟังก์ชันสำหรับรับข้อมูลจากหน้าอื่น
  const handleAddFromOtherScreen = async (value) => {
    try {
      // โหลดข้อมูลล่าสุดจาก AsyncStorage เพื่อป้องกันการสูญหายของข้อมูล
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      let currentList = [];
      if (storedData !== null) {
        currentList = JSON.parse(storedData);
      }

      const newItem = {
        id: Date.now().toString(),
        value: parseFloat(value),
        timestamp: new Date().toLocaleString('th-TH'),
        source: 'external' // เพิ่ม flag เพื่อระบุที่มาของข้อมูล
      };

      // เพิ่มข้อมูลใหม่และจำกัดจำนวนรายการ
      const newList = [newItem, ...currentList].slice(0, MAX_ITEMS);
      await saveTonkhaoList(newList);
      setTonkhaoList(newList);
    } catch (e) {
      console.error('Error adding tonkhao from other screen:', e);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเพิ่มข้อมูลต้นข้าวได้');
    }
  };

  // ฟังก์ชันสำหรับการเพิ่มข้อมูลด้วยตนเอง
  const addTonkhaoManual = async (value) => {
    try {
      // โหลดข้อมูลล่าสุดจาก AsyncStorage ก่อนเพิ่มข้อมูลใหม่
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      let currentList = [];
      if (storedData !== null) {
        currentList = JSON.parse(storedData);
      }

      const newItem = {
        id: Date.now().toString(),
        value: parseFloat(value),
        timestamp: new Date().toLocaleString('th-TH'),
        source: 'manual' // เพิ่ม flag เพื่อระบุที่มาของข้อมูล
      };

      // เพิ่มข้อมูลใหม่และจำกัดจำนวนรายการ
      const newList = [newItem, ...currentList].slice(0, MAX_ITEMS);
      const saveSuccess = await saveTonkhaoList(newList);
      if (saveSuccess) {
        setTonkhaoList(newList);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error adding tonkhao manually:', e);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเพิ่มข้อมูลต้นข้าวได้');
      return false;
    }
  };

  const handleAddManual = async () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) {
      Alert.alert('ข้อมูลไม่ถูกต้อง', 'กรุณากรอกตัวเลข');
      return;
    }

    const number = parseFloat(trimmedValue);
    if (isNaN(number) || number < 0 || number > 100) {
      Alert.alert('ข้อมูลไม่ถูกต้อง', 'กรุณากรอกตัวเลขระหว่าง 0 ถึง 100');
      return;
    }

    const success = await addTonkhaoManual(number);
    if (success) {
      setInputValue('');
      Alert.alert('สำเร็จ', 'บันทึกต้นข้าว% เรียบร้อยแล้ว');
    }
  };

  const deleteItem = async (id) => {
    try {
      // โหลดข้อมูลล่าสุดจาก AsyncStorage ก่อนลบ
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      let currentList = [];
      if (storedData !== null) {
        currentList = JSON.parse(storedData);
      }

      const newList = currentList.filter(item => item.id !== id);
      const saveSuccess = await saveTonkhaoList(newList);
      if (saveSuccess) {
        setTonkhaoList(newList);
        Alert.alert('สำเร็จ', 'ลบรายการเรียบร้อยแล้ว');
      }
    } catch (e) {
      console.error('Error deleting item:', e);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถลบรายการได้');
    }
  };

  const confirmDeleteItem = (id) => {
    Alert.alert(
      'ยืนยันการลบ',
      'คุณต้องการลบรายการนี้ใช่หรือไม่?',
      [
        { text: 'ยกเลิก' },
        { text: 'ลบ', onPress: () => deleteItem(id), style: 'destructive' }
      ]
    );
  };

  const clearAll = async () => {
    Alert.alert(
      'ลบข้อมูลทั้งหมด', 
      'คุณต้องการลบข้อมูลทั้งหมดหรือไม่?', 
      [
        { text: 'ยกเลิก' },
        {
          text: 'ลบทั้งหมด',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(STORAGE_KEY);
              setTonkhaoList([]);
              Alert.alert('สำเร็จ', 'ลบข้อมูลทั้งหมดเรียบร้อยแล้ว');
            } catch (e) {
              console.error('Failed to delete all:', e);
              Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถลบข้อมูลทั้งหมดได้');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.valueText}>🌾 คุณภาพการสี: {item.value.toFixed(2)}%</Text>
        <Text style={styles.timestamp}>🕓 บันทึกเมื่อ: {item.timestamp}</Text>
      </Card.Content>
    </Card>
  );

  const calculateAverage = () => {
    if (tonkhaoList.length === 0) return '0.00';
    const sum = tonkhaoList.reduce((acc, item) => acc + parseFloat(item.value), 0);
    return (sum / tonkhaoList.length).toFixed(2);
  };

  const average = calculateAverage();

  const emptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>ยังไม่มีข้อมูล</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌾 ประวัติคุณภาพการสี </Text>
      <Text style={styles.averageText}> ค่าเฉลี่ยคุณภาพการสี: {average}%</Text>

      <Button
        mode="contained"
        onPress={clearAll}
        style={[styles.button, { backgroundColor: '#d32f2f' }]}
        icon="delete-sweep"
        disabled={tonkhaoList.length === 0 || isLoading}
      >
        ลบข้อมูลทั้งหมด
      </Button>

      <FlatList
        data={tonkhaoList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={emptyListComponent}
        refreshing={isLoading}
        onRefresh={loadTonkhaoList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#4caf50',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 18,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    marginRight: 8,
  },
  addButton: {
    justifyContent: 'center',
    backgroundColor: '#4caf50',
  },
  button: {
    marginVertical: 8,
  },
  card: {
    marginVertical: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '500',
  },
  timestamp: {
    marginTop: 4,
    fontSize: 12,
    color: 'gray',
  },
  deleteButton: {
    marginTop: 8,
    borderColor: '#d32f2f',
  },
  averageText: {
    fontSize: 18,
    marginTop: 8,
    marginBottom: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4caf50',
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});