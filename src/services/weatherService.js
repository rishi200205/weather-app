import {DateTime} from "luxon"
const API_KEY = 'aeaf26f5025cc5ade91839af973aad2a';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/';

const getWeatherData = (infoType, searchParams) => {
    const url = new URL(BASE_URL + infoType);
    url.search= new URLSearchParams({...searchParams, appid: API_KEY});

    return fetch(url)
        .then((res) => res.json())
        .then ((data)=> data);
};

const iconUrlFromCode = (icon) => 'http://openweathermap.org/img/wn/${icon}@2x.png'; 

const formatToLocalTime= (secs, offset, format="cccc, dd LLL yyyy' | Local time: 'hh:mm a") => 
    DateTime.fromSeconds(secs + offset, {zone: "utc"}).toFormat(format);

const formatCurrent = (data) => {
    const {
        coord:{lat, lon},
        main:{temp, feels_like, temp_min, temp_max, humidity},
        name,
         dt,
        sys:{ country, sunrise, sunset},
        weather,
        wind: {speed},
        timezone,
        } = data;

        const {main: details, icon} = weather[0];
            const formattedToLocalTime= formatToLocalTime(dt, timezone)

        return{
                temp,
                feels_like,
                temp_min,
                temp_max,
                humidity,
                name,
                country,
                sunrise:formatToLocalTime(sunrise, timezone, 'hh:mm a'),
                sunset:formatToLocalTime(sunset, timezone, 'hh:mm a'),
                speed,
                details,
                icon: iconUrlFromCode(icon),
                formattedToLocalTime,
                dt,
                timezone,
                lat,
                lon
        }
};

const formatForecastWeather = (secs, offset, data) =>{
    //hourly
        const hourly= data.filter((f)=>f.dt > secs).slice(0,5).map((f)=>({
            temp: f.main.temp,
            title: formatToLocalTime(f.dt, offset, "hh:mm a"),
            icon: iconUrlFromCode(f.weather[0].icon),
            date: f.dt_txt,
        }))

    //daily   
     const daily = daily.filter()

    return {hourly};

};

const getFormmattedWeatherData = async (searchParams) => {
    const formattedCurrentWeather = await getWeatherData(
        "weather",
        searchParams).then(formatCurrent);
        
        const {dt, lat, lon, timezone}= formattedCurrentWeather

        const formattedForecastWeather = await getWeatherData('forecast', {lat, lon, units: searchParams.units}).then((d) =>formatForecastWeather(dt, timezone, d.list))
    
        return{...formattedCurrentWeather, ...formattedForecastWeather};

}

export default getFormmattedWeatherData;