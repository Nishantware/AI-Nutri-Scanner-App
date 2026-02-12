import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import Icon from '@react-native-vector-icons/ionicons';
import moment from 'moment';
import axios from 'axios';

interface NutritionData {
  calories: number;
  protien: number;
  carbs: number;
  fat: number;
}

type RootTabParamList = {
  Home: undefined;
  'Diet Plan': undefined;
  Nutribites: undefined;
  Profile: undefined;
  Camera: undefined;
  Calendar: undefined;
  Scan: undefined;
};

type HomeScreenProps = BottomTabScreenProps<RootTabParamList, 'Home'>;

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const [lastThreeDaysData, setLastThreeDaysData] = useState<any[]>([]);
  const getLastSevenDays = () => {
    const days = [];
    const today = moment();
    const endOfMonth = today.clone().endOf('month');
    const startOfMonth = today.clone().startOf('month');
    let current = today.clone().subtract(6, 'days');
    while (current.isSameOrAfter(startOfMonth) && days.length < 7) {
      days.push(current.clone());
      current.add(1, 'day');
    }

    return days;
  };

  const lastSevenDays = getLastSevenDays();
  console.log('dates', lastSevenDays);

  useEffect(() => {
    fetchLastThreeDaysData();
  }, []);

  const fetchLastThreeDaysData = async () => {
    const response = await axios.get(
      'http://localhost:3000/scans/last-three-days',
    );
    setLastThreeDaysData(response.data.data);
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sujan's Gallery</Text>

          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.inviteButton}>
              <Text style={styles.buttonText}>Invite & Earn</Text>
            </TouchableOpacity>
            <Pressable style={styles.finalButton}>
              <Text style={styles.button}>Try Free</Text>
            </Pressable>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchText}>Search</Text>
          <Icon name="search" size={20} color="gray" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's counts</Text>
          <View style={styles.countsContainer}>
            <View style={styles.countBox}>
              <Text style={styles.countLabel}>Calories</Text>
              <Text style={styles.countValue}>10 g</Text>
            </View>

            <View style={styles.countBox}>
              <Text style={styles.countLabel}>Protien</Text>
              <Text style={styles.countValue}>10 g</Text>
            </View>

            <View style={styles.countBox}>
              <Text style={styles.countLabel}>Carbs</Text>
              <Text style={styles.countValue}>10 g</Text>
            </View>

            <View style={styles.countBox}>
              <Text style={styles.countLabel}>Fat</Text>
              <Text style={styles.countValue}>10 g</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.insightsHeader}>
            <Text style={styles.sectionTitle}>Insights</Text>
            {/* <Icon name="chevron-right" size={20} color="gray"/> */}
          </View>

          <View style={styles.insightsContainer}>
            <View style={styles.insightBox}>
              <Text style={styles.insightText}>Map</Text>
              <View style={styles.placeholder} />
            </View>

            <Pressable
              onPress={() => navigation.navigate('Calendar')}
              style={styles.insightBox}>
              <Text style={styles.insightText}>Calendar</Text>
              <View style={styles.calendar}>
                {lastSevenDays.map((day, index) => {
                  const isToday = day.isSame(moment(), 'day');
                  return (
                    <Text
                      style={[
                        styles.calendarDay,
                        isToday && styles.calendarDayHighlighted,
                      ]}
                      key={index}>
                      {day.date()}
                    </Text>
                  );
                })}
              </View>
            </Pressable>
            <View style={styles.insightBox}>
              <Text style={styles.insightText}>Nutrients</Text>
              <Text style={styles.nutrientText}>
                Average Calorie intake last week
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last 3 Days</Text>
          <View style={styles.lastThreeDays}>
            {lastThreeDaysData?.map((dayData, index) => {
              const totalCalories = dayData.scans.reduce(
                (sum: number, scan: any) => {
                  return (
                    sum +
                    (scan.foodItems.reduce(
                      (itemSum: number, item: any) =>
                        itemSum + (item.nutrients?.calories || 0),
                      0,
                    ) || 0)
                  );
                },
                0,
              );
              const totalProtein = dayData.scans.reduce(
                (sum: number, scan: any) => {
                  return (
                    sum +
                    (scan.foodItems.reduce(
                      (itemSum: number, item: any) =>
                        itemSum + (item.nutrients?.proteins || 0),
                      0,
                    ) || 0)
                  );
                },
                0,
              );
              const totalCarbs = dayData.scans.reduce(
                (sum: number, scan: any) => {
                  return (
                    sum +
                    (scan.foodItems.reduce(
                      (itemSum: number, item: any) =>
                        itemSum + (item.nutrients?.carbohydrates || 0),
                      0,
                    ) || 0)
                  );
                },
                0,
              );
              const totalFat = dayData.scans.reduce(
                (sum: number, scan: any) => {
                  return (
                    sum +
                    (scan.foodItems.reduce(
                      (itemSum: number, item: any) =>
                        itemSum + (item.nutrients?.fats || 0),
                      0,
                    ) || 0)
                  );
                },
                0,
              );

              return (
                <View key={index} style={styles.dayBox}>
                  <Text style={styles.dayTitle}>
                    {moment(dayData.date).format('MMMM D')}
                  </Text>
                  <View style={styles.dayNutrientRow}>
                    <Text style={styles.dayNutrientText}>
                      Cal : {totalCalories} Kcal
                    </Text>
                    <Text style={styles.dayNutrientText}>
                      Pro : {totalProtein} g
                    </Text>
                    <Text style={styles.dayNutrientText}>
                      Carb : {totalCarbs} Kcal
                    </Text>
                    <Text style={styles.dayNutrientText}>
                      Fat : {totalFat.toFixed(1)} g
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Scan')}
          style={styles.fab}>
          <Icon name="camera-outline" size={24} color="white" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1C2526',
  },
  container: {
    flex: 1,
    backgroundColor: '#1C2526',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  inviteButton: {
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 13,
  },
  button: {
    color: 'black',
    fontSize: 13,
  },
  finalButton: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 10,
    justifyContent: 'space-between',
  },
  searchText: {
    color: 'gray',
    fontSize: 15,
  },
  section: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  countsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  countBox: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  countLabel: {
    color: 'gray',
    fontSize: 14,
  },
  countValue: {
    color: 'white',
    fontSize: 16,
    marginTop: 5,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  insightsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  insightBox: {
    backgroundColor: '#333',
    padding: 14,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  insightText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 8,
  },
  placeholder: {
    width: 80,
    height: 80,
    backgroundColor: '#444',
    borderRadius: 10,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  calendarDay: {
    color: 'white',
    fontSize: 14,
    margin: 4,
    padding: 4,
  },
  calendarDayHighlighted: {
    color: 'white',
    fontSize: 14,
    margin: 4,
    backgroundColor: '#FF6F61',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFEB38',
  },
  nutrientText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 50,
    right: 16,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lastThreeDays: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  dayBox: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
  },
  dayTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dayNutrientRow: {flexDirection: 'row', justifyContent: 'space-between'},
  dayNutrientText: {color: 'white', fontSize: 14},
});
