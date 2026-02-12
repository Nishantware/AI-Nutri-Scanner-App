import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import Icon from '@react-native-vector-icons/ionicons';

const CalendarScreen = () => {
  const navigation = useNavigation();
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [totalScansThisMonth, setTotalScansThisMonth] = useState(0);
  const [thisWeekScans, setThisWeekScans] = useState(0);
  const [todayScans, setTodayScans] = useState(0);
  const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(null);
  const [scanDetails, setScanDetails] = useState<any[]>([]);

  useEffect(() => {
    fetchScans();
  }, [currentMonth]);

  const fetchScans = async () => {
    try {
      const monthResponse = await fetch(
        `http://localhost:3000/scans/month/${currentMonth.year()}/${
          currentMonth.month() + 1
        }`,
      );
      const monthData = await monthResponse.json();
      setTotalScansThisMonth(monthData.totalScans);

      const weekResponse = await fetch('http://localhost:3000/scans/week');
      const weekData = await weekResponse.json();
      setThisWeekScans(weekData.totalScans);

      const todayResponse = await fetch('http://localhost:3000/scans/today');
      const todayData = await todayResponse.json();
      setTodayScans(todayData.totalScans);
    } catch (error) {
      console.log('Error fetching scans', error);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(currentMonth.clone().subtract(1, 'month'));
  };

  const goToNextMonth = () => {
    setCurrentMonth(currentMonth.clone().add(1, 'month'));
  };

  const generateCalendar = () => {
    const startOfMonth = currentMonth.clone().startOf('month');
    const endOfMonth = currentMonth.clone().endOf('month');
    const startOfWeek = startOfMonth.clone().startOf('week');
    const endOfWeek = endOfMonth.clone().endOf('week');

    const days = [];
    let day = startOfWeek;

    while (day.isSameOrBefore(endOfWeek)) {
      days.push(day.clone());
      day.add(1, 'day');
    }

    return days;
  };

  const calendarDays = generateCalendar();

  const handleDatePress = async (day: moment.Moment) => {
    setSelectedDate(day);
    try {
      const dateResponse = await fetch(
        `http://localhost:3000/scans/date/${day.format('YYYY-MM-DD')}`,
      );

      const dateData = await dateResponse.json();
      setScanDetails(dateData.scans.length ? dateData.scans[0].foodItems : []);
    } catch (error) {
      console.log('Error fetching scans', error);
      setScanDetails([]);
    }
  };

  const closeTooltip = () => {
    setSelectedDate(null);
    setScanDetails([]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Insights</Text>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>
          Total {currentMonth.format('MMMM')}
        </Text>
        <Text style={styles.statsValue}>{totalScansThisMonth} scans done</Text>
        <Text style={styles.statsTitle}>This Week</Text>
        <Text style={styles.statsValue}>{thisWeekScans} scans</Text>
        <Text style={styles.statsTitle}>Today</Text>
        <Text style={styles.statsValue}>{todayScans} scans</Text>
      </View>

      <View style={styles.monthNavigation}>
        <TouchableOpacity
          onPress={goToPreviousMonth}
          style={styles.arrowButton}>
          <Icon name="arrow-back" size={20} color="#333" />
        </TouchableOpacity>

        <Text style={styles.monthText}>{currentMonth.format('MMMM YYYY')}</Text>

        <TouchableOpacity onPress={goToNextMonth} style={styles.arrowButton}>
          <Icon name="arrow-forward" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.calendarContainer}>
        <View style={styles.weekdayRow}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} style={styles.weekdayText}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.datesContainer}>
          {calendarDays?.map((day, index) => {
            const isCurrentMonth = day.isSame(currentMonth, 'month');
            const isScanned = (async () => {
              const response = await fetch(
                `http://localhost:3000/scans/date/${day.format('YYYY-MM-DD')}`,
              );
              const data = await response.json();
              return data.scans.length > 0;
            })();
            const isToday = day.isSame(moment(), 'day');

            return (
              <TouchableOpacity
                onPress={() => handleDatePress(day)}
                style={styles.dateCell}>
                <Text
                  style={[
                    styles.dateText,
                    !isCurrentMonth && styles.inactiveDate,
                    isScanned && styles.scannedDate,
                    isToday && styles.todayDate,
                  ]}>
                  {day.date()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Modal
        transparent={true}
        visible={!!selectedDate}
        onRequestClose={closeTooltip}>
        <TouchableWithoutFeedback onPress={closeTooltip}>
          <View style={styles.modalOverlay}>
            <View style={styles.tooltip}>
              <Text style={styles.tooltipTitle}>
                {selectedDate?.format('MMMM D, YYYY')}
              </Text>
              <View style={styles.tooltipNutrientRow}>
                <Text style={styles.tooltipNutrientHeader}>Calories</Text>
                <Text style={styles.tooltipNutrientHeader}>Proteins</Text>
                <Text style={styles.tooltipNutrientHeader}>Carbs</Text>
                <Text style={styles.tooltipNutrientHeader}>Fats</Text>
              </View>
              <View style={styles.tooltipNutrientRow}>
                {scanDetails.length > 0 ? (
                  scanDetails.map((item, index) => (
                    <View key={index} style={styles.tooltipNutrientValue}>
                      <Text>{item.nutrients?.calories || 0} kcal</Text>
                      <Text>{item.nutrients?.proteins || 0} g</Text>
                      <Text>{item.nutrients?.carbohydrates || 0} g</Text>
                      <Text>{item.nutrients?.fats || 0} g</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.tooltipNutrientValue}>
                    No data available
                  </Text>
                )}
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    padding: 15,
    paddingTop: 60,
  },
  backButton: {
    marginRight: 10,
  },
  headerText: {
    color: '#fff',
    fontSize: 15,
    marginLeft: 5,
    fontWeight: 'bold',
  },
  statsContainer: {
    padding: 20,
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 17,
    color: '#666',
    marginBottom: 5,
    marginTop: 5,
  },
  statsValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
    elevation: 2,
  },
  arrowButton: {
    padding: 10,
  },
  monthText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  calendarContainer: {
    padding: 10,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
    elevation: 2,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  datesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dateCell: {
    width: Dimensions.get('window').width / 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveDate: {
    color: '#aaa',
  },
  todayDate: {
    backgroundColor: '#FFEB3B',
    borderRadius: 15,
    width: 30,
    height: 30,
    textAlign: 'center',
    paddingTop: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltip: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    elevation: 5,
  },
  tooltipTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  tooltipNutrientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tooltipNutrientHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
  tooltipNutrientValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 16,
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  //   scannedDate: {
  //     color: '#2E7D32',
  //     fontWeight: 'bold',
  //   },
});
