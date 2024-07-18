import {fetchWeatherAndUV} from "./realtime.js";

// var cityName = "";

// handle user input
export function highlightCity(cityName) {
    const p = document.querySelectorAll("path");

    p.forEach(function(item) {
        const dataName = item.getAttribute("data-name");
        if (dataName === cityName) {
            item.classList.add("highlight"); 
        } else {
            item.classList.remove("highlight"); 
        }
    });
}


fetchWeatherAndUV("彰化縣");


// if user click map 
const tooltip = document.getElementById("tooltip");
const paths = document.querySelectorAll("path");
paths.forEach(path=> {
    path.addEventListener("click", function(event) {
        cityName = event.target.getAttribute("data-name");
        tooltip.innerHTML=cityName;
        tooltip.style.display="block";
        console.log(cityName);
        // fetchWeatherAndUV(cityName);
        highlightCity(cityName);

    });
        path.addEventListener("mousemove", (event) => {
        tooltip.style.left = event.pageX + 10 + "px";
        tooltip.style.top = event.pageY + 10 + "px";
      });
  
      path.addEventListener("mouseout", () => {
        tooltip.style.display = "none";
      });
});





