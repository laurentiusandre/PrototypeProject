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
} from 'react-native';
import { getLocation, getWeather } from './src/utils/api';
import getImageForWeather from './src/utils/getImageForWeather';
import getIconForWeather from './src/utils/getIconForWeather';
import moment from 'moment';
import SearchInput from './src/components/SearchInput';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    // bind SCOPE
    this.handleDate = this.handleDate.bind(this);

    // STATE
    this.state = {
      loading: false,
      error: false,

      location: '',
      temperature: 0,
      weather: '',
      created: '2000-01-01T00:00:00.000000Z'
    };

  }
  // Life cycle
  componentDidMount() {
    this.handleUpdateLocation('Bandung');
  }

  // Parse of date
  handleDate = date => moment(date).format("HH:mm");

  // Parse of date
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

    this.setState({ loading: true }, async () => {
      try {
        const loc = await getLocation(city);
        console.log(loc.name);
        const { location, weathercode, temperature, created } = await getWeather(loc);
      
        const weather = this.handleWeatherCode(weathercode);
        console.log(weathercode);
        console.log(weather);

        this.setState({
          loading: false,
          error: false,
          location,
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

  // RENDERING
  render() {

    // GET values of state
    const { loading, error, location, weather, temperature, created } = this.state;

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

            <ActivityIndicator animating={loading} color="white" size="large" />

            {!loading && (
              <View>
                {error && (
                  <Text style={[styles.smallText, styles.textStyle]}>
                    😞 Could not load your city or weather. Please try again later...
                  </Text>
                )}
                {!error && (
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
                />

                {!error && (
                  <Text style={[styles.smallText, styles.textStyle]}>
                    Last update: {this.handleDate(created)}
                  </Text>
                )}

              </View>
            )}
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