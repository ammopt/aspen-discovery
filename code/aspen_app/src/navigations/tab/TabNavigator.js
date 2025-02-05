import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DrawerActions } from '@react-navigation/native';
import { useToken, useColorModeValue } from 'native-base';
import React from 'react';

import DrawerNavigator from '../drawer/DrawerNavigator';
import AccountStackNavigator from '../stack/AccountStackNavigator';
import BrowseStackNavigator from '../stack/BrowseStackNavigator';
import LibraryCardStackNavigator from '../stack/LibraryCardStackNavigator';
import MoreStackNavigator from '../stack/MoreStackNavigator';
import { LanguageContext, LibraryBranchContext } from '../../context/initialContext';
import { getTermFromDictionary } from '../../translations/TranslationService';
import SelfCheckOutStackNavigator from '../stack/SelfCheckOutStackNavigator';

export default function TabNavigator() {
     const { language } = React.useContext(LanguageContext);
     const { enableSelfCheck } = React.useContext(LibraryBranchContext);
     const Tab = createBottomTabNavigator();
     const [activeIcon, inactiveIcon] = useToken('colors', [useColorModeValue('gray.800', 'coolGray.200'), useColorModeValue('gray.500', 'coolGray.400')]);
     const tabBarBackgroundColor = useColorModeValue('light', 'dark');
     return (
          <Tab.Navigator
               initialRouteName="BrowseTab"
               screenOptions={({ route }) => ({
                    headerShown: false,
                    backBehavior: 'none',
                    tabBarHideOnKeyboard: true,
                    tabBarIcon: ({ focused, color, size }) => {
                         let iconName;
                         if (route.name === 'BrowseTab') {
                              iconName = focused ? 'library' : 'library-outline';
                         } else if (route.name === 'LibraryCardTab') {
                              iconName = focused ? 'card' : 'card-outline';
                         } else if (route.name === 'AccountTab') {
                              iconName = focused ? 'person' : 'person-outline';
                         } else if (route.name === 'MoreTab') {
                              iconName = focused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline';
                         } else if (route.name === 'SelfCheckTab') {
                              iconName = focused ? 'barcode' : 'barcode-outline';
                         }
                         return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: activeIcon,
                    tabBarInactiveTintColor: inactiveIcon,
                    tabBarLabelStyle: {
                         fontWeight: '400',
                    },
                    tabBarStyle: {
                         backgroundColor: tabBarBackgroundColor,
                         elevation: 0,
                    },
               })}>
               <Tab.Screen
                    name="BrowseTab"
                    component={BrowseStackNavigator}
                    options={{
                         tabBarLabel: getTermFromDictionary(language, 'nav_discover'),
                    }}
                    screenOptions={{
                         headerShown: false,
                    }}
               />
               <Tab.Screen
                    name="LibraryCardTab"
                    component={LibraryCardStackNavigator}
                    options={{
                         tabBarLabel: getTermFromDictionary(language, 'nav_card'),
                    }}
               />
               {enableSelfCheck ? (
                    <Tab.Screen
                         name="SelfCheckTab"
                         component={SelfCheckOutStackNavigator}
                         options={{
                              tabBarLabel: getTermFromDictionary(language, 'nav_sco'),
                         }}
                    />
               ) : null}
               <Tab.Screen
                    name="AccountTab"
                    component={DrawerNavigator}
                    options={{
                         tabBarLabel: getTermFromDictionary(language, 'nav_account'),
                         //tabBarBadge: 3,
                    }}
                    listeners={({ navigation }) => ({
                         tabPress: (e) => {
                              navigation.dispatch(DrawerActions.toggleDrawer());
                              e.preventDefault();
                         },
                    })}
               />
               <Tab.Screen
                    name="AccountScreenTab"
                    component={AccountStackNavigator}
                    options={{
                         tabBarButton: () => null,
                    }}
               />
               <Tab.Screen
                    name="MoreTab"
                    component={MoreStackNavigator}
                    options={{
                         tabBarLabel: getTermFromDictionary(language, 'nav_more'),
                    }}
               />
          </Tab.Navigator>
     );
}