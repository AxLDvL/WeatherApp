
import {StatusBar, StyleSheet, Text, View, Image, ScrollView, FlatList} from 'react-native';
import * as Location from 'expo-location';
import {useEffect, useState} from "react";


const getIconUrl = (iconeName) => {
  return `http://openweathermap.org/img/wn/${iconeName}@2x.png`
}
export default function App() {
  const [forecast,setForecast] = useState([]);
  const [currentWeather,setCurrentWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      //get location---------------------------------------------------------------------------------

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
      //on récupère la ville avec la long et lat ----------------------------------------------------------
      (async () => {
        let lat = location.lat;
        let lon = location.lon;

        const data = await fetch(`http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=1989238b331f6165f5602ceb0709ebdf`);
        const city = await data.json();

        let uplocation = location;
        uplocation.city = city[0].name;
        setLocation(uplocation);

        console.log("loc",location);
      })();
      //on récupère la météo du jour avec la long et la lat---------------------------------------------------------

      (async () => {
        let lat = location.lat;
        let lon = location.lon;

        const data = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=1989238b331f6165f5602ceb0709ebdf&units=metric`);
        const weather = await data.json();

          //je récupère l'url de l'icon
          let iconName = weather.weather[0].icon;

          weather.imageUrl = getIconUrl (iconName);

          setCurrentWeather(weather);


          console.log("currenWeather",currentWeather);

      })();
      //on récupère la météo sur les 5 jours à venir avec la long et la lat---------------------------------------------------------

      (async () => {
        let lat = location.lat;
        let lon = location.lon;
        let newForecast = [];

        const data = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=1989238b331f6165f5602ceb0709ebdf&units=metric`);
        const weather = await data.json();

        weather.list.forEach( e => {

          let iconName = e.weather[0].icon;
          let imageUrl = getIconUrl (iconName);
          newForecast = [...newForecast, {imageUrl:imageUrl,dt:e.dt_txt }]
        })
        console.log("newForecast",newForecast);
        setForecast(newForecast);
        //console.log("weather",weather);

      })();
    }
  },[location])

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = location.city;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
        <Text style={styles.title}>{text}</Text>

      {currentWeather  &&
        <>
          <Image
            style={styles.normalLogo}
            source={{
              uri: currentWeather.imageUrl,
            }}
        />
          <Text style={styles.title}>{currentWeather.main.temp}°C</Text>
        </>
      }
      {forecast &&

            <ScrollView  horizontal={true}>
              <FlatList
                  contentContainerStyle = {styles.goalList}
                  data = {forecast}
                  renderItem = {({item,index}) =>
                      <>
                        <Text key={index}>{item.dt}</Text>
                    <Image
                    style={styles.tinyLogo}
                    source={{
                    uri: item.imageUrl,
                  }}
                    />
                      </>
                  }
              />
            </ScrollView>
      }
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
  normalLogo: {
    width: 150,
    height: 150,
  },
  title:{
    fontWeight:"bold",
    fontSize:40,
  }
});
