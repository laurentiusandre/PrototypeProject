import React from 'react';
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
} from 'react-native';
import { getLocation, getLocations, getWeather } from './src/utils/api';
import getImageForWeather from './src/utils/getImageForWeather';
import getIconForWeather from './src/utils/getIconForWeather';
import moment from 'moment';
import SearchInput from './src/components/SearchInput';
import { throttle, debounce } from "throttle-debounce";

export default class App extends React.Component {
  constructor(props) {
    super(props);

    // bind SCOPE
    this.handleDate = this.handleDate.bind(this);

    // state
    this.state = {
      loading: false,
      error: false,
      input: '',
      locations: [],

      location: '',
      current: {},
      temperature: 0,
      weather: '',
      created: '2000-01-01T00:00:00.000000Z'
    };

  }
  // Lifecycle
  componentDidMount() {
    this.handleUpdateLocation('Bandung');
  }

  // Parse date
  handleDate = date => moment(date).format("HH:mm");

  // Map weather code
  handleWeatherCode = weathercode => {
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
  handleUpdateLocation = async city => {
    if (!city) return;

    console.log('city: ' + city);
    this.setState({ loading: true }, async () => {
      console.log('async');
      try {
        console.log('getting locations:');
        const locs = await getLocations(city);
        console.log('locs size:' + locs.length);
        this.setState({
          locations: locs,
        });
        this.handleUpdateLocationByCoord(locs[0]);
      } catch (e) {
        this.setState({
          loading: false,
          error: true,
        });
      }
    });
  };

  // Update current location
  handleUpdateLocationByCoord = async item => {
    this.setState({ loading: true }, async () => {
      console.log('async');
      // if (item.latitude === current.latitude &&
      //       item.longitude === current.longitude && !error) {
      //     console.log('lat/long already requested');
      //     return;
      // }
      try {
        const loc = item;
        console.log(loc.name);
        const current = await getWeather(loc);
        const { location, weathercode, temperature, created } = current;
      
        const weather = this.handleWeatherCode(weathercode);
        console.log(weathercode);
        console.log(weather);

        this.setState({
          loading: false,
          error: false,
          location,
          current,
          weather,
          temperature,
          created,
        });
      } catch (e) {
        this.setState({
          loading: false,
          error: true,
        });
      }
    });
  };

  // Update location suggestions
  handleChangeText = text => {
    console.log('text: ' + text);
    this.setState({
      input: text,
      locations: []
    });
    if (text.length < 5) {
      // throttle(500, this.handleUpdateLocation(text));
    } else {
      debounce(1000, this.handleUpdateLocation(text));
    }
  };

  getItemText = item => {
    let mainText = this.getTitle(item);

    return (
      <View style={{ flexDirection: "row", alignItems: "center", padding: 15 }}>
        <View style={{ flexShrink: 1 }}>
          <Text style={{ fontWeight: "700" }}>{mainText}</Text>
          <Text style={{ fontSize: 12 }}>{item.country}</Text>
        </View>
      </View>
    );
  };

  getTitle = item => {
    let mainText = item.name;
    if (item.admin1)
      mainText += ", " + item.admin1;

    return mainText;
  };

  // RENDERING
  render() {

    // GET values of state
    const { loading, error, input, locations, location, weather, temperature, created } = this.state;

    // Activity
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
                onSubmit={this.handleUpdateLocation}
                onChangeText={this.handleChangeText}
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
                          this.handleUpdateLocationByCoord(item)
                        }
                      >
                        {this.getItemText(item)}
                      </Pressable>
                    )}
                    keyExtractor={(item, index) => item.id + index}
                  />
                </View>
              ) : null}

              {!error && (
                <Text style={[styles.smallText, styles.textStyle]}>
                  Last update: {this.handleDate(created)}
                </Text>
              )}

            </View>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    );
  }
}

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