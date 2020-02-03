const GEOCODING_TOKEN = '95c3637521a3ab';
const OPENWEATHER_TOKEN = 'd8b7aaee63f1111a16622cf7e3519209'

var query = $(document).ready(function() {
  var mouseposX = -1;
  var dialogShow = false;
  var h = -1;
  var m = -1;
  var s = -1;

  
  function getdate() {
    var today = new Date();
    h = today.getHours();
    m = today.getMinutes();
    s = today.getSeconds();
    if (s < 10) {
      s = "0" + s;
    }
    if (m < 10) {
      m = "0" + m;
    }

    if(h < 10) {
      h = "0" + h;
    }
    $("#time").text(`${h}:${m}:${s}`);
  }

  setInterval(function() {
    getdate();
  }, 1000);

  //get mouse event
  $(document).mousemove(function(event) {
    mouseposX = event.pageX;
    if (mouseposX <= 0) {
      $("#mySidebar").addClass("sidebar__slide");
      $(".container").addClass("container__slide");
      dialogShow = true;
    }
    if (dialogShow && mouseposX > 250) {
      $("#mySidebar").removeClass("sidebar__slide");
      $(".container").removeClass("container__slide");
      dialogShow = false;
    }
  });

  //
});
//load api data when window on load
var load = $(window).on("load", function(event) {
  $("#time").text("--:--:--");
  $("#location").text('Loading...')

  function showError(error) {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        $('#location').text("Allow location to get current location");
        break;
      case error.POSITION_UNAVAILABLE:
        $('#location').text("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        $('#location').text("Timeout !!");
        break;
      case error.UNKNOWN_ERROR:
        console.log("Something happened !");
        break;
    }
  }

  function convertKtoC(kelvin) {
    return Math.round(kelvin - 273.15);
  }
  
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var latitude = position.coords.latitude;
      var longitude = position.coords.longitude;
      $.ajax({
        url:`https://us1.locationiq.com/v1/reverse.php?key=${GEOCODING_TOKEN}&lat=${latitude}&lon=${longitude}&format=json`,
        type: 'GET',
        dataType:'json',
        success: function(response) {
          var location = response.display_name;
          $('#location').text(location);
        },
        error: function () {
          $('#location').text("Something went wrong !");
        }
      })

      $.ajax({
        url:`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_TOKEN}`,
        type:'GET',
        dataType:'json',
        async: true,
        success: function(response) {
          console.log(response);
          let weather = response.weather[0];
          let main = response.main;
          if (weather.id >= 200 && weather.id < 300) {
            $('#weather').addClass('currentday__weather--thunderstorm');
          } else if (weather.id >= 300 && weather.id < 500) {
            $('#weather').addClass('currentday__weather--drizzle');
          } else if (weather.id >= 500 && weather.id < 600) {
            $('#weather').addClass('currentday__weather--rain');
          } else if (weather.id >= 600 && weather.id < 800) {
            $('#weather').addClass('currentday__weather--mist');
          } else if (weather.id == 800) {
            $('#weather').addClass('currentday__weather--clear');
          } else if (weather.id > 800) {
            $('#weather').addClass('currentday__weather--cloudy');
          }

          $('#temperature').text(`Temperature: ${convertKtoC(main.temp)}°C`);
          $('#feellike').text(`Feels like: ${convertKtoC(main.feels_like)}°C`);
          $('#weathermain').text(weather.main);
          $('#temp_min').text(`${convertKtoC(main.temp_min)}°C/${convertKtoC(main.temp_max)}°C`);
          $('#humidity').text(`Humidity: ${main.humidity}%`);
          $('#description').text(`Description: ${weather.description}`);
        },
        error: function(error) {
          console.log(error);
        }
      });
    },showError);
  } else {
    console.log("Browser doesn't support geolocation!");
  }
});
