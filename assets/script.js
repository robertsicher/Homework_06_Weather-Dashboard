// Variables
var openWeatherMapAPIkey = "e97c5470d84d3802df5f9d4dea7d3766";
var today;
var citySearch = "";
var latitude;
var longitude;
var currentTemperature;
var currentHumidity;
var currentWindSpeed;
var currentUVIndex;
var modalUV = $("#modal-UVIndex");

// Display previous city searches
$(document).ready(function () {

    // local storage check
    if (!localStorage.getItem("previousSearches")) {

        localStorage.setItem("previousSearches", "['']");
        window.previousSearches = [""];
    }

    // If empty, set the array to be blank
    else if (localStorage.getItem("previousSearches") == "['']") {
        window.previousSearches = [""];
    } else {
        // Retrieve the  the local previousSearches
        window.previousSearches = JSON.parse(localStorage.getItem("previousSearches"));

        // Load all of previousSearches into the cityHistory function
        cityHistory(previousSearches);

        // Load the last cityHistory as the current searh    
        pullWeather(previousSearches[previousSearches.length - 1]);
    }
});

// Event listener for the search history. Moves to current search
$(document).on("click", ".old-searches", function () {
    var citySearch = this.textContent;
    pullWeather(citySearch);
});

// Search button listener
$("#submit-button").click(function () {

    event.preventDefault();

    if ($("#city-search-value").val() == "") {
        alert("Please type a city name in the search box.");
    } else {

        // Use the input in pullWeather
        citySearch = $("#city-search-value").val();
        pullWeather(citySearch);

        // Clear the search box
        $("#city-search-value").val("");
    }
});




// Pull current weather, show the pull
function pullWeather(citySearch) {

    
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + citySearch + "&appid=" + openWeatherMapAPIkey + "&units=metric";

    // ajax call to using the query URL
    $.ajax({
        type: "GET",
        url: queryURL,
        dataType: "json",
        success: function (data) {
            pullWeatherSuccess(data, citySearch);
        },
        error: function (data) {
            pullWeatherError(data);
        }
    });
}

function pullWeatherSuccess(data, citySearch) {

    // ISO Naming protocol
    datacitySearch = data.name + ", " + data.sys.country;

    // GEt Todays Date
    today = new Date();
    currentDate = [
        today.getDate(),
        today.getMonth() + 1,
        today.getFullYear()
    ]

    // DAte formatting
    currentDate.forEach(formatDate);

    // String the Date
    currentDateString = currentDate[0] + "/" + currentDate[1] + "/" + currentDate[2];

    // Pull Weather icon
    currentWeatherIconID = data.weather[0].icon;
    currentWeatherIconURL = "https://openweathermap.org/img/wn/" + currentWeatherIconID + "@2x.png";

    // Update the current weather header
    $("#current-weather-head").text(datacitySearch + " (" + currentDateString + ")  ");
    $("#current-weather-img").attr("src", currentWeatherIconURL);

    // Pull the weather data
    //TEmperature
    currentTemperature = Math.round(data.main.temp * 10) / 10;
    // HUmidity
    currentHumidity = data.main.humidity;
    // Take the wind and change it
    currentWindSpeed = Math.round(data.wind.speed * 3600 / 1609.34);

    // Push the weather to the display
    $("#current-temperature").text("Temperature: " + currentTemperature + "°C");
    $("#current-humidity").text("Humidity: " + currentHumidity + "%");
    $("#current-wind").text("Wind speed: " + currentWindSpeed + "mph");

    // Activate the save
    saveSearch(citySearch);

    // LAtitude longitude
    latitude = data.coord.lat;
    longitude = data.coord.lon;
    getUVIndex(latitude, longitude);

    // pullForecast function
    pullForecast(citySearch);

    // Remove no-display
    $("#active-city-weather").removeClass("no-display");
    $("#old-searches-list").removeClass("no-display");
}

function pullWeatherError() {
    alert("The city you searched for could not be found. Please try again")
}

// Push the display
function pullForecast(citySearch) {

    // Form the API URL
    queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + citySearch + "&appid=" + openWeatherMapAPIkey + "&units=metric";

    // ajax call using the query URL
    $.ajax({
        type: "GET",
        url: queryURL,
        dataType: "json",
        success: function (data) {
            pullForecastSuccess(data);
        }
    });
}

function pullForecastSuccess(data) {
    // Reset the cards
    $(".card").remove();

    //Create the 5 cards
    for (i = 1; i <= 5; i++) {
        j = i * 8 - 1;

        // Pull the data from the api
        date = data.list[j].dt_txt;
        forecastDate = date.slice(8, 10) + "/" + date.slice(5, 7) + "/" + date.slice(2, 4);

        // Forecast Weather img
        forecastImgID = data.list[j].weather[0].icon;
        forecastImgURL = "https://openweathermap.org/img/wn/" + forecastImgID + "@2x.png";

        // Forecast Temperature
        forecastTemperature = Math.round(data.list[j].main.temp * 10) / 10;

        // Humidity
        forecastHumidity = data.list[j].main.humidity;

        // Wind speed
        forecastWind = Math.round(data.list[j].wind.speed * 3600 / 1609.34);

        // Create the forecast cards
        var card = document.createElement("div");
        card.setAttribute("class", "card bg-primary text-white mb-3 col-xs-5 col-sm-5 col-md-2");

        // Content elemnts in the card
        var cardBody = document.createElement("div");
        cardBody.setAttribute("class", "card-body");

        var cardTitle = document.createElement("h5");
        cardTitle.setAttribute("class", "card-title");
        cardTitle.textContent = forecastDate;

        var cardIcon = document.createElement("img");
        cardIcon.setAttribute("class", "card-text");
        cardIcon.setAttribute("height", "45px");
        cardIcon.setAttribute("width", "45px");
        cardIcon.setAttribute("alt", "Weather icon");
        cardIcon.setAttribute("src", forecastImgURL);

        var cardTemp = document.createElement("p");
        cardTemp.setAttribute("class", "card-text");
        cardTemp.textContent = "Temp: " + forecastTemperature + "°C";

        var cardHumidity = document.createElement("p");
        cardHumidity.setAttribute("class", "card-text");
        cardHumidity.textContent = "Humidity: " + forecastHumidity + "%";

        var cardWind = document.createElement("p");
        cardWind.setAttribute("class", "card-text");
        cardWind.textContent = "Wind speed: " + forecastWind + "mph";

        // Append to the card body
        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardIcon);
        cardBody.appendChild(cardTemp);
        cardBody.appendChild(cardHumidity);
        cardBody.appendChild(cardWind);

        // Append the card body into card
        card.appendChild(cardBody);

        // Append to the 5 day forecast
        $(".forecast").append(card);
    }
}

// UV INdex pull 
function getUVIndex(latitude, longitude) {

    // UV API Pull
    queryURL = "https://api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&appid=" + openWeatherMapAPIkey;

    // ajax call using the query URL    
    $.ajax({
        type: "GET",
        url: queryURL,
        dataType: "json",
        success: function (data) {
            getUVSuccess(data);
        }
    })
}

function getUVSuccess(data) {
    // Retrieve the UV value
    currentUVIndex = data.value;

    // Update the UV index value displayed
    $("#current-uv").text(currentUVIndex);

    // Reset UV
    $("#current-uv").removeClass("low moderate high very-high extreme");

    // Change the colour for UV 
    if (currentUVIndex < 2.5) {
        $("#current-uv").addClass("low");
    } else if (currentUVIndex < 5.5) {
        $("#current-uv").addClass("moderate");
    } else if (currentUVIndex < 7.5) {
        $("#current-uv").addClass("high");
    } else if (currentUVIndex < 10.5) {
        $("#current-uv").addClass("very-high");
    } else {
        $("#current-uv").addClass("extreme");
    }
}

// City Search history updater
function cityHistory(previousSearches) {

    // Clear search history
    $(".old-searches").remove();

    // Check to see if the previousSearches array is blank or does not exist
    if (previousSearches[0] !== "") {

        // If previousSearches array is not empty, display city-weather section of the page
        $("#active-city-weather").removeClass("no-display");

        // Go through each element in the previousSearches array
        for (i = 0; i < previousSearches.length; i++) {

            // Create a new element for each past search, with required attributes and city name
            var pastSearch = document.createElement("div");
            pastSearch.setAttribute("class", "old-searches boxed");
            pastSearch.textContent = previousSearches[i];

            // Append the new element to the cities list container
            $("#old-searches-list").append(pastSearch);
        }
    } else {
        // If previousSearches array is empty, hide city-weather section of the page
        $("#active-city-weather").addClass("no-display");
    }
}

// Add to local storage 
function saveSearch(citySearch) {

    // Duplication check
    var citySearchIndex = previousSearches.indexOf(citySearch);

    // If previousSearches array is blank, set the first element as the searched city
    if (previousSearches[0] == "") {
        window.previousSearches[0] = citySearch;
    }
    // If the searched city was not in the previousSearches array, add it at the end
    else if (citySearchIndex === -1) {
        window.previousSearches.push(citySearch);
    }
    // If the searched city was already in the previousSearches array, move to the last element
    else {
        var endOfLoop = window.previousSearches.length
        for (i = citySearchIndex; i < endOfLoop; i++) {
            window.previousSearches[i] = window.previousSearches[i + 1];
        }
        window.previousSearches[endOfLoop - 1] = citySearch;
    }

    // Update the cities shown in the search history
    cityHistory(previousSearches);

    // Push to local storage
    localStorage.setItem("previousSearches", JSON.stringify(previousSearches));
}

// Modal "hover"
$("#current-uv").mouseenter(function (event) {
    // Mouse position
    var mouseX = event.clientX;
    var mouseY = event.clientY;

    // Set the position of the modal to be the same as the 
    modalUV.css("left", mouseX + "px");
    modalUV.css("top", mouseY + "px");

    //Display modal
    modalUV.removeClass("no-display");
})


// Modal "hover" off
$("#current-uv").mouseleave(function () {
    modalUV.addClass("no-display");
})

// DAte formating
function formatDate(item, index, arr) {
    if (arr[index] < 10) {
        arr[index] = "0" + arr[index];
    }
}