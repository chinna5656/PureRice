import React from "react";
import { Button } from 'react-native-paper';
import { router } from 'expo-router';

import Background from "../../src/components/Background";
import Logo from "../../src/components/Logo";
import Header from "../../src/components/Header";
import Paragraph from "../../src/components/Paragraph";

export default function StartScreen( ) {
  return (
    <Background>
      <Logo />
      <Header>Welcome to PureRice App</Header>
      <Paragraph>
        แอปพลิเคชันสำหรับการตรวจวัดคุณภาพข้าวสาร.
      </Paragraph>
      <Button 
        mode="contained" 
        onPress={() => router.push('/loginscreen')}>
        เข้าสู่ระบบ
      </Button>
      <Button
        mode="outlined"
        onPress={() => router.push('/registerscreen')}
      >
        สมัครสมาชิก
      </Button>
    </Background>
  );
}
