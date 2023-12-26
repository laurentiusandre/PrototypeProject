import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ImageBackground,
  Text,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  FlatList,
  Pressable,
  useColorScheme,
} from 'react-native';
import { getLocation, getLocations, getWeather } from './src/utils/api';
import getImageForWeather from './src/utils/getImageForWeather';
import getIconForWeather from './src/utils/getIconForWeather';
import moment from 'moment';
import SearchInput from './src/components/SearchInput';
import { throttle, debounce } from "throttle-debounce";
import WeatherItem from './src/models/WeatherItem';
import { getDBConnection, getWeatherItems, saveWeatherItems, createTable, clearTable, deleteWeatherItem } from './src/services/dbService';

const App = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [input, setInput] = useState('');
  const [locations, setLocations] = useState([]);
  const [location, setLocation] = useState('');
  const [current, setCurrent] = useState({
    location: '',
    latitude: '',
    longitude: '',
    weathercode: '',
    temperature: '',
    created: '2000-01-01T00:00:00.000000Z'
  });
  const [temperature, setTemperature] = useState(0);
  const [weather, setWeather] = useState('');
  const [created, setCreated] = useState('2000-01-01T00:00:00.000000Z');

  const isDarkMode = useColorScheme() === 'dark';
  const [weatherList, setWeatherList] = useState([]);
  const [newWeather, setNewWeather] = useState('');

  const handleDate = date => {
    return moment(date).format("HH:mm");
  };

  // Map weather code
  const handleWeatherCode = weathercode => {
    switch (weathercode) {
      case 0:
      case 1: return "Clear";
      case 2: 
      case 3: return "Light Cloud";
      case 45:
      case 48: return "Heavy Cloud";
      case 51: 
      case 53:
      case 55: 
      case 56: 
      case 57: return "Showers";
      case 61: return "Light Rain";
      case 63:
      case 65: return "Heavy Rain";
      case 66:
      case 67: return "Sleet";
      case 71:
      case 73:
      case 75:
      case 77: return "Snow";
      case 80: 
      case 81: 
      case 82: 
      case 85: 
      case 86: return "Showers";
      case 95: return "Thunder";
      case 96:
      case 99: return "Hail";
      default: return "";
    }
  }

  // Update current location
  const handleUpdateLocation = async city => {
    if (!city) return;

    console.log('city: ' + city);
    setLoading(true);
    
    try {
      console.log('getting locations:');
      const locs = await getLocations(city);
      console.log('locs size:' + locs.length);
      setLocations(locs);
      handleUpdateLocationByCoord(locs[0]);
    } catch (e) {
      setLoading(false);
      setError(true);
    }
  };

  // Update current location
  const handleUpdateLocationByCoord = async item => {
    if (item.latitude === current.latitude &&
          item.longitude === current.longitude && !error) {
        console.log('lat/long already requested');
        setLoading(false);
        return;
    } else {
      console.log('requesting new lat/long');
    }
    setLoading(true);

    try {
      const loc = item;
      console.log(loc.name);
      const current = await getWeather(loc);
      const { location, weathercode, temperature, created } = current;
    
      const weather = handleWeatherCode(weathercode);
      console.log(weathercode);
      console.log(weather);

      setError(false);
      setLocation(location);
      setCurrent(current);
      setWeather(weather);
      setTemperature(temperature);
      setCreated(created);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Update location suggestions
  const handleChangeText = text => {
    console.log('text: ' + text);
    setInput(text);
    setLocations([]);
    if (text.length < 5) {
      // throttle(500, handleUpdateLocation(text));
    } else {
      debounce(1000, handleUpdateLocation(text));
    }
  };

  const getItemText = item => {
    let mainText = getTitle(item);

    return (
      <View style={{ flexDirection: "row", alignItems: "center", padding: 15 }}>
        <View style={{ flexShrink: 1 }}>
          <Text style={{ fontWeight: "700" }}>{mainText}</Text>
          <Text style={{ fontSize: 12 }}>{item.country}</Text>
        </View>
      </View>
    );
  };

  const getTitle = item => {
    let mainText = item.name;
    if (item.admin1)
      mainText += ", " + item.admin1;

    return mainText;
  };

  const loadDataCallback = useCallback(async () => {
    try {
      const initWeatherList = [{ id: 0, value: 'Seoul' }, { id: 1, value: 'Bandung' }, { id: 2, value: 'Medan' }];
      console.log('getting db connection');
      const db = getDBConnection();
      console.log('db connection ok');

      await createTable(db);
      console.log('table created');
      
      const storedWeatherItems = await getWeatherItems(db);
      console.log('storedWeatherItems.length: ' + storedWeatherItems.length);
      if (storedWeatherItems.length) {
        console.log('storedWeatherItems.length');
        setWeatherList(storedWeatherItems);
      } else {
        console.log('storedWeatherItems null, save new list');
        await saveWeatherItems(db, initWeatherList);
        setWeatherList(initWeatherList);
        handleUpdateLocation(initWeatherList[0].value);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    console.log('useEffect loadDataCallback');
    loadDataCallback();
  }, []);

  useEffect(() => {
    console.log('useEffect addWeather');
    addWeather();
  }, [location]);

  const addWeather = async () => {
    console.log('addWeather');
    if (!location.trim()) return;
    try {
      // const newWeatherList = [...weatherList, {
      //   id: weatherList.length ? weatherList.reduce((acc, cur) => {
      //     if (cur.id > acc.id) return cur;
      //     return acc;
      //   }).id + 1 : 0, value: location
      // }];
      
      const newWeatherList = [...weatherList];
      newWeatherList[0] = { id: 0, value: location }
      setWeatherList(newWeatherList);
      const db = getDBConnection();
      await saveWeatherItems(db, newWeatherList);
      setNewWeather('');
    } catch (error) {
      console.error(error);
    }
  };

  const deleteItem = async (id) => {
    try {
      const db =  getDBConnection();
      await deleteWeatherItem(db, id);
      weatherList.splice(id, 1);
      setWeatherList(weatherList.slice(0));
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">

      <StatusBar barStyle="light-content" />

      <ImageBackground
        source={getImageForWeather(weather)}
        style={styles.imageContainer}
        imageStyle={styles.image}
      >

        <View style={styles.detailsContainer}>
          <View>
            {error && (
              <Text style={[styles.smallText, styles.textStyle]}>
                😞 Could not load your city or weather. Please try again later...
              </Text>
            )}

            <ActivityIndicator animating={loading} color="white" size="large" />

            {!loading && !error && (
              <View>
                <Text style={[styles.largeText, styles.textStyle]}>
                  {getIconForWeather(weather)} {location}
                </Text>
                <Text style={[styles.smallText, styles.textStyle]}>
                    {weather}
                </Text>
                <Text style={[styles.largeText, styles.textStyle]}>
                  {`${Math.round(temperature)}°`}
                </Text>
              </View>
            )}

            <SearchInput
              placeholder="Search any city..."
              onSubmit={handleUpdateLocation}
              onChangeText={handleChangeText}
            />
            {input && locations.length > 0 ? (
              <View style={styles.autocompleteContainer}>
                <FlatList
                  data={locations}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item, index }) => (
                    <Pressable
                      style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
                      onPress={() =>
                        handleUpdateLocationByCoord(item)
                      }
                    >
                      {getItemText(item)}
                    </Pressable>
                  )}
                  keyExtractor={(item, index) => item.id + index}
                />
              </View>
            ) : null}

            {!error && (
              <Text style={[styles.smallText, styles.textStyle]}>
                Last update: {handleDate(created)}
              </Text>
            )}

          </View>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#34495E',
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    flex: 1,
    width: null,
    height: null,
    resizeMode: 'cover',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 20,
  },
  autocompleteContainer: {
    height: 180,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  textStyle: {
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'Roboto',
    color: 'white',
  },
  largeText: {
    fontSize: 44,
  },
  smallText: {
    fontSize: 18,
  },
});
export default App;