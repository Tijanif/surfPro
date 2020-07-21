var dataList = [];
var searchList = [];
var spotWeatherList = [];
const openWeatherKey = "577c2d43b73a3f662eb7848e63883a9c";
const badSpotToolTipText = "This spot is not good for surfing";
const goodSpotToolTipText = "You can go to this spot for surfing";

var xmlHttpForJsonData = new XMLHttpRequest();
var jsonUrl = "data.json";
xmlHttpForJsonData.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        var jsonArray = JSON.parse(this.responseText);
        for (var i = 0; i < jsonArray.length; i++) {
            dataList.push(jsonArray[i]);
        }
    }
};
xmlHttpForJsonData.open("GET", jsonUrl, true);
xmlHttpForJsonData.send();

function getCityList() {
    var output = '<ul class="list-group list-group-flush">';
    var cityNameToSearch = document.getElementById("location").value.trim();

    if (cityNameToSearch.length > 0) {
        var cityList = [];
        for (var i = 0; i < dataList.length; i++) {
            if (cityList.indexOf(dataList[i].county_name) === -1) {
                cityList.push(dataList[i].county_name);
            }
            if (cityList.indexOf(dataList[i].spot_name) === -1) {
                cityList.push(dataList[i].spot_name);
            }
        }
        for (var i = 0; i < cityList.length; i++) {
            if (cityList[i].toLowerCase().includes(cityNameToSearch.toLowerCase())) {
                output += '<li class="list-group-item list-group-item-action rounded border-0" onclick="putListValuetoLocation(this.innerHTML);">' + cityList[i] + '</li>';
            }
        }
    }
    output += '</ul>';
    document.getElementById("cityList").innerHTML = output;
    var liCount = document.getElementById("cityList").getElementsByTagName("li");
    if (liCount.length > 0) {
        document.getElementById("cityList").classList.replace("d-none", "d-block");
    } else {
        document.getElementById("cityList").classList.replace("d-block", "d-none");
    }

}

function putListValuetoLocation(value) {
    document.getElementById("location").value = value;
    document.getElementById("cityList").classList.replace("d-block", "d-none");
}

function getWeather() {
    setResultMarkUp("");

    searchList = getSpotsFromSearchString();

    spotWeatherList = [];

    if (searchList.length > 0) {
        fetchWeather()
            .then(
                x => populateUIFromWeatherArray(x)
            );
    }
    else {
        setResultMarkUp('<h2>Opps! No spot found.</h2 >')
    }

    return false;
}

function fetchWeather() {
    var weather = [];
    for (let i = 0; i < searchList.length; i++) {
        var data = fetch(`https://api.openweathermap.org/data/2.5/weather?units=imperial&lat=${searchList[i].latitude}&lon=${searchList[i].longitude}&appid=${openWeatherKey}`)
            .then(response => response.json())
            .then(json => getWeatherFromResponse(json, searchList[i].spot_names));
        weather.push(data);
    }
    return Promise.all(weather);
}

function isWindCorrect(weather) {
    var expertise = getExpertise();
    if (expertise == "Novice") {
        if (weather.windSpeed >= 0 && weather.windSpeed <= 20) {
            return true;
        }
    }
    if (expertise == "Intermediate") {
        if (weather.windSpeed >= 20 && weather.windSpeed <= 25) {
            return true;
        }
    }
    if (expertise == "Expert") {
        if (weather.windSpeed > 25) {
            return true;
        }
    }
    return false;
}

function getSpotsFromSearchString() {
    var location = getLocation();
    var spots = [];
    for (var i = 0; i < dataList.length; i++) {
        if (dataList[i].county_name == location || dataList[i].spot_name == location) {
            spots.push(dataList[i]);
        }
    }
    return spots;
}

function populateUIFromWeatherArray(weather) {
    var resultData = '';

    if (weather.length > 0) {
        resultData += '<h2>Available Spots for ' + getExpertise() + ' in ' + getLocation() + '</h2>';
        resultData += '<table class="table table-bordered table-dark table-hover">';
        resultData += '<tr><td>Location: </td><td>Wind Speed</td><td>Weather</td></tr>';
        for (var j = 0; j < weather.length; j++) {
            resultData += getTableRow(weather[j], searchList[j].spot_name);
        }
        resultData += '</table>';
    }

    setResultMarkUp(resultData);
}

function getTableRow(weather, spot) {
    var markUp = "";
    if (isWindCorrect(weather)) {
        markUp += '<tr class="bg-success text-white" data-toggle="tooltip" data-placement="bottom" title="' + goodSpotToolTipText + '">';
    }
    else {
        markUp += '<tr class="bg-danger text-white" data-toggle="tooltip" data-placement="bottom" title="' + badSpotToolTipText + '">';
    }
    markUp += '<td>' + spot + '</td>';
    markUp += '<td>' + weather.windSpeed + '</td>';
    markUp += '<td>' + weather.weatherType + '</td>';
    markUp += '</tr>';
    return markUp;
}

function getWeatherFromResponse(response) {
    var wind_speed = response.wind.speed;
    var weather_type = response.weather[0].main;

    var weather = {
        windSpeed: wind_speed,
        weatherType: weather_type
    };
    return weather;
}

function getExpertise() {
    return document.getElementById("expertise").value;
}

function getLocation() {
    return document.getElementById("location").value;;
}

function setResultMarkUp(markUp) {
    if (markUp != "") {
        document.getElementById("resultBox").classList.remove("d-none");
        document.getElementById("resultBox").classList.add("d-block");
        document.getElementById("resultBox").innerHTML = markUp;

        $('[data-toggle="tooltip"]').tooltip()
    }
    else {
        document.getElementById("resultBox").classList.add("d-none");
        document.getElementById("resultBox").classList.remove("d-block");
        document.getElementById("resultBox").innerHTML = "";
    }
}