import { weekly_chart } from "./weekly_chart.js";

let currentCityName = "臺北市";

const stationToCityMap = new Map([
  ["466850", "新北市"],
  ["466881", "新北市"],
  ["466900", "新北市"],
  ["466910", "臺北市"],
  ["466920", "臺北市"],
  ["466930", "臺北市"],
  ["466940", "基隆市"],
  ["466950", "基隆市"],
  ["466990", "花蓮縣"],
  ["467050", "桃園市"],
  ["467080", "宜蘭縣"],
  ["467110", "金門縣"],
  ["467270", "彰化縣"],
  ["467280", "苗栗縣"],
  ["467300", "澎湖縣"],
  ["467350", "澎湖縣"],
  ["467410", "臺南市"],
  ["467420", "臺南市"],
  ["467441", "高雄市"],
  ["467480", "嘉義市"],
  ["467490", "臺中市"],
  ["467530", "嘉義縣"],
  ["467540", "臺東縣"],
  ["467550", "南投縣"],
  ["467571", "新竹縣"],
  ["467590", "屏東縣"],
  ["467610", "臺東縣"],
  ["467620", "臺東縣"],
  ["467650", "南投縣"],
  ["467660", "臺東縣"],
  ["467790", "屏東縣"],
  ["467990", "連江縣"]
]);

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => showPosition(position), 
      handleLocationError
    );
  } else { 
    fetchWeather("臺北市"); 
    const stationIds = getStationIdsForCity("臺北市");
    if (stationIds.length > 0) {
      fetchUV(stationIds);
      } else {
      console.log("No station IDs found for", ctyName.textContent);
    }
  }
}

function handleLocationError(error) {
  console.warn('Error getting location:', error.message);
  fetchWeather("臺北市");

  const stationIds = getStationIdsForCity("臺北市");
  if (stationIds.length > 0) {
    fetchUV(stationIds);
    } else {
    console.log("No station IDs found for", ctyName.textContent);
  }
}

function showPosition(position) {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  const url = `https://api.nlsc.gov.tw/other/TownVillagePointQuery/${lng}/${lat}/4326`;

  fetch(url)
  .then(response => response.text())
  .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
  .then(data => {
      const ctyName = data.querySelector('ctyName');
      if (!ctyName) {
        console.error('City name not found in the response');
        fetchWeather("臺北市"); 
        const stationIds = getStationIdsForCity("臺北市");
        if (stationIds.length > 0) {
          fetchUV(stationIds);
          } else {
          console.log("No station IDs found for", ctyName.textContent);
        }
        return;
      }
      currentCityName = ctyName.textContent;
      fetchWeather(ctyName.textContent);
      const stationIds = getStationIdsForCity(ctyName.textContent);
      if (stationIds.length > 0) {
        fetchUV(stationIds);
      } else {
        console.log("No station IDs found for", ctyName.textContent);
      }
  })
  .catch(error => {
    console.error('Error:', error);
    fetchWeather("臺北市");  
  });
}

function getStationIdsForCity(cityName) {
  const stationIds = [];
  for (let [key, value] of stationToCityMap.entries()) {
    if (value === cityName) {
      stationIds.push(key);
    }
  }
  return stationIds;
}

async function fetchWeather(locationName) {
  const url = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001";
  const params = new URLSearchParams({
    'Authorization': CWB_API_KEY,
    'locationName': locationName
  });

  try {
    const response = await fetch(`${url}?${params.toString()}`);
    const data = await response.json();
    showBigBoxContent(data);
    showRainfallRate(data);
  } catch (error) {
    console.error('Error fetching weather:', error);
  }
}

async function fetchUV(stationIds) {

  const url = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0005-001";
  const params = new URLSearchParams({
      'Authorization': CWB_API_KEY
  });

  stationIds.forEach(id => params.append('StationID', id));

  try {
    const response = await fetch(`${url}?${params.toString()}`);
    const data = await response.json();
    showUVrays(data);
  } catch (error) {
    console.error('Error fetching UV:', error);
  }
}

//給地圖點擊的接口
async function fetchWeatherAndUV(cityName) {
  try {
    await fetchWeather(cityName);
    const stationIds = getStationIdsForCity(cityName);
    if (stationIds.length > 0) {
      await fetchUV(stationIds);
    } else {
      console.log("No station IDs found for", cityName);
    }
  } catch (error) {
    console.error('Error in fetchWeatherAndUV:', error);
  }
}

function showBigBoxContent(data){
  const weatherElements = data.records.location[0].weatherElement;
  
    const wxElement = weatherElements.find(el => el.elementName === 'Wx');
    const wxDescription = wxElement.time[0].parameter.parameterName;

    const minTElement = weatherElements.find(el => el.elementName === 'MinT');
    const minTValue = minTElement.time[0].parameter.parameterName;

    const maxTElement = weatherElements.find(el => el.elementName === 'MaxT');
    const maxTValue = maxTElement.time[0].parameter.parameterName;

    const averageTemp = (parseFloat(minTValue) + parseFloat(maxTValue)) / 2;

    document.getElementById('temp-value').textContent = `${averageTemp}`;
    document.getElementById('temperature-description').textContent = wxDescription;
    document.querySelectorAll('.temp-range-value')[0].textContent = minTValue;
    document.querySelectorAll('.temp-range-value')[1].textContent = maxTValue;

    const locationName = data.records.location[0].locationName;
    document.getElementById('city-name').textContent = locationName;

    const ciElement = weatherElements.find(el => el.elementName === 'CI');
    const ciDescription = ciElement.time[0].parameter.parameterName;

    document.getElementById('city-temp-feel').textContent = ciDescription

    const now = new Date();

    const weekday = now.toLocaleDateString('zh-TW', { weekday: 'long' }); 
    const day = now.getDate(); 

    const dateString = `${weekday} ${day}`; 

    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }); 
    document.getElementById('date').textContent = dateString;
    document.getElementById('time').textContent = timeString;
}

function showRainfallRate(data) {
  const weatherElements = data.records.location[0].weatherElement;
  const popElement = weatherElements.find(element => element.elementName === 'PoP');
  if (popElement && popElement.time.length > 0) {
      const firstTime = popElement.time[0];
      const rainfallRate = `${firstTime.parameter.parameterName}%`; 

      document.getElementById('rainfall-rate').textContent = rainfallRate;
  } else {
      console.error('No PoP data available or data structure is incomplete.');
  }
}

function showUVrays(data) {
  const uvRaysContainer = document.getElementById('uv-rays');
  if (data.records.weatherElement.location.length === 0) {
    const url = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-091";
    const params = new URLSearchParams({
      'Authorization': CWB_API_KEY,
      'locationName': locationName 
    });

    fetch(`${url}?${params.toString()}`)
      .then(response => response.json())
      .then(data => {
        const uviElement = data.records.locations[0].location[0].weatherElement.find(el => el.elementName === "UVI");
        if (uviElement && uviElement.time.length > 0) {
          const uviValue = uviElement.time[0].elementValue[0].value;
          uvRaysContainer.textContent = uviValue;
        } else {
          uvRaysContainer.textContent = '無資料';
        }
      })
      .catch(error => {
        console.error('Error fetching additional data:', error);
        uvRaysContainer.textContent = '資料請求錯誤';
      });
  } else {
    const maxUVIndex = data.records.weatherElement.location.reduce((max, item) => {
      return item.UVIndex > max.UVIndex ? item : max;
    }, { UVIndex: -Infinity }); 

    uvRaysContainer.textContent = `${maxUVIndex.UVIndex}`;
  }
}

document.addEventListener('DOMContentLoaded', async function() {
  getLocation()
});

