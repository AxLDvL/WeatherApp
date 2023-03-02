import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';
import * as Location from 'expo-location';
import {useEffect, useState} from "react";

export default function App() {
  const [iconUrl,setIconUrl] = useState(null);
  const [currentWeather,setCurrentWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({lat : currentLocation.coords.latitude,lon : currentLocation.coords.longitude});

    })();
  }, []);
  useEffect(() => {
    if (location){
      //on récupère la ville avec la long et lat
      (async () => {
        let lat = location.lat;
        let lon = location.lon;

        const data = await fetch(`http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=1989238b331f6165f5602ceb0709ebdf`);
        const city = await data.json();

        setLocation(city[0].name);

        console.log("laa",location);

      })();

      //on récupère la météo avec la long et la lat

      (async () => {
        let lat = location.lat;
        let lon = location.lon;

        const data = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=1989238b331f6165f5602ceb0709ebdf`);
        const weather = await data.json();


          //je récupère l'url de l'icon
          let iconName = weather.weather[0].icon;
          setIconUrl(`http://openweathermap.org/img/wn/${iconName}@2x.png`);

          weather.imageUrl = `http://openweathermap.org/img/wn/${iconName}@2x.png`
          setCurrentWeather (weather);

          console.log("iconUrl",iconUrl);
          console.log("currenWeather",currentWeather);

      })();
    }
  },[location])

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />


      <Text>Open up App.js to start working on your app!</Text>
      {location && <Text> {location}</Text>}
      {/* iconUrl !=null &&
        <Image
            style={styles.tinyLogo}
            source={{
              uri: {iconUrl},
            }}
        />
      */}

    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tinyLogo: {
    width: 50,
    height: 50,
  },
});
