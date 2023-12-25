/**
 * Only ES6 =))))
 *
 * GET iD current location
 * Example ``RESPONSE``:
 * URi: " https://geocoding-api.open-meteo.com/v1/search?name=Bandung "
 *
 * {
    "results": [
        {
            "id": 1650357,
            "name": "Bandung",
            "latitude": -6.92222,
            "longitude": 107.60694,
            "elevation": 714.0,
            "feature_code": "PPLA",
            "country_code": "ID",
            "admin1_id": 1642672,
            "timezone": "Asia/Jakarta",
            "population": 1699719,
            "country_id": 1643084,
            "country": "Indonesia",
            "admin1": "West Java"
        },
        ...
    ],
    "generationtime_ms": 0.64098835
}
 */
  export const getLocation = async city => {

    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}`,
    );
  
    const r = await response.json();
  
    return r.results[0];
  };
  
  export const getLocations = async city => {

    console.log('fetching data to: ' + `https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}`,
    );
  
    const r = await response.json();
  
    console.log('r: ' + r);
    console.log('r.results.length: ' + r.results.length);
    const unique = [];
    r.results.map(x => unique.filter(a => a.id == x.id).length > 0 ? null : unique.push(x));
    return unique;
  };

  export const removeDuplicatesSafe = arr => {
    var seen = {};
    var ret_arr = [];
    for (var i = 0; i < arr.length; i++) {
        if (!(arr[i] in seen)) {
            ret_arr.push(arr[i]);
            seen[arr[i]] = true;
        }
    }
    return ret_arr;
}
  
  /*
   * GEt WEATHER by current Location <<< iD  >>>
   * Example ``RESPONSE``:
   * URi: " https://api.open-meteo.com/v1/forecast?latitude=-6.875&longitude=107.5&current=temperature_2m,weather_code&timezone=auto "
   *
   * {
        "latitude": -6.875,
        "longitude": 107.5,
        "generationtime_ms": 0.025987625122070312,
        "utc_offset_seconds": 25200,
        "timezone": "Asia/Jakarta",
        "timezone_abbreviation": "WIB",
        "elevation": 707.0,
        "current_units": {
            "time": "iso8601",
            "interval": "seconds",
            "temperature_2m": "°C",
            "weather_code": "wmo code"
        },
        "current": {
            "time": "2023-12-24T01:00",
            "interval": 900,
            "temperature_2m": 23.6,
            "weather_code": 45
        }
      }
   */
  export const getWeather = async r => {
  
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${r.latitude}&longitude=${r.longitude}&current=temperature_2m,weather_code&timezone=auto`
    );
    console.log('fetching data to: ' + `https://api.open-meteo.com/v1/forecast?latitude=${r.latitude}&longitude=${r.longitude}&current=temperature_2m,weather_code&timezone=auto`);
  
    let { current } = await response.json();
    let { weather_code, temperature_2m, time } = current;
  
    return {
      location: r.name,
      weathercode: weather_code,
      temperature: temperature_2m,
      created: time
    };
  };