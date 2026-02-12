import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import DietPlanScreen from '../screens/DietPlanScreen';
import NutribitesScreen from '../screens/NutribitesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ScanScreen from '../screens/ScanScreen';
import CalendarScreen from '../screens/CalendarScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

interface TabBarIconProps {
  focused: boolean;
}

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={() => ({
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 90,
          backgroundColor: '#1C2526',
          borderTopWidth: 0,
        },
      })}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({focused}: TabBarIconProps) =>
            focused ? (
              <Ionicons
                style={{paddingTop: 3}}
                name="home-outline"
                size={30}
                color="white"
              />
            ) : (
              <Ionicons
                style={{paddingTop: 3}}
                name="home-outline"
                size={30}
                color="#989898"
              />
            ),
        }}
      />

      <Tab.Screen
        name="Diet Plan"
        component={DietPlanScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({focused}: TabBarIconProps) =>
            focused ? (
              <Ionicons
                style={{paddingTop: 3}}
                name="calendar-outline"
                size={30}
                color="white"
              />
            ) : (
              <Ionicons
                style={{paddingTop: 3}}
                name="calendar-outline"
                size={30}
                color="#989898"
              />
            ),
        }}
      />

      <Tab.Screen
        name="Nutribites"
        component={NutribitesScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({focused}: TabBarIconProps) =>
            focused ? (
              <Ionicons
                style={{paddingTop: 3}}
                name="fast-food-outline"
                size={30}
                color="white"
              />
            ) : (
              <Ionicons
                style={{paddingTop: 3}}
                name="fast-food-outline"
                size={30}
                color="#989898"
              />
            ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({focused}: TabBarIconProps) =>
            focused ? (
              <Ionicons
                style={{paddingTop: 3}}
                name="person-circle-outline"
                size={28}
                color="white"
              />
            ) : (
              <Ionicons
                style={{paddingTop: 3}}
                name="person-circle-outline"
                size={28}
                color="#989898"
              />
            ),
        }}
      />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        component={BottomTabs}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Scan"
        component={ScanScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <MainStack />
    </NavigationContainer>
  );
};

export default AppNavigator;
