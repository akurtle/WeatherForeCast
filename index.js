import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

const API="48fd209240f56fb84e6ea1a35b993890";



var myHeaders = new Headers();
myHeaders.append("x-access-token", "openuv-1m0zqdrloa9rn0n-io");
myHeaders.append("Content-Type", "application/json");




//holders
let currLat="";
let currLong="";
let place="";
let temp=0;
let feelsLike=0;
let min=0;
let max=0;
let humidity=0;
let sunset="";
let sunrise="";
let wind_speed="";
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let weeks=[];
let week_days_str=[];
let week_days_int=[];
let week_month=[];
let week_max_temp=[];
let week_min_temp=[];
let week_rain_chance=[];
let currUV='';



app.get("/",async(req,res)=>{
    
    
    if(currLat!="" && currLong!=""){
        const response2= await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${currLat}&lon=${currLong}&appid=${API}`);

        const week= await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${currLat}&longitude=${currLat}&daily=apparent_temperature_max,apparent_temperature_min,uv_index_max,precipitation_sum&timezone=auto`)
        
        let currUVDay = new Date().getDay();
       

        temp = Math.floor(response2.data.main.temp-273.15);

        feelsLike = Math.floor(response2.data.main.feels_like-273.15);

        min = Math.floor(response2.data.main.temp_min-273.15);

        max = Math.floor(response2.data.main.temp_max-273.15);

        humidity = response2.data.main.humidity;
        
        place =response2.data.name+" "+response2.data.sys.country;

        sunrise=unixToTime(response2.data.sys.sunrise);

        sunset= unixToTime(response2.data.sys.sunset);

        wind_speed= response2.data.wind;

        weeks = week.data.daily.time;

        currUV=week.data.daily.uv_index_max[currUVDay];
        
       
        

        week_max_temp=week.data.daily.apparent_temperature_max;

        

        week_min_temp=week.data.daily.apparent_temperature_min;

        week_rain_chance=week.data.daily.precipitation_sum;

        //Formatting weeks into desired format
        for(let i in weeks){
            
            var date = new Date(weeks[i].replace( /(\d{2})-(\d{2})-(\d{4})/, "$2/$3/$1"));
            let month = months[date.getMonth()];           
            let day = days[date.getDay()];
            week_days_str.push(day.slice(0,3))
            week_days_int.push(date.getDate())
            week_month.push(month.slice(0,3))
            
        }
        
        
        }
    res.render("index.ejs",{
        location:place,
        temperature:temp,
        feel:feelsLike,
        minimum:min,
        maximum:max,
        humid:humidity,
        sunRise:sunrise,
        sunSet:sunset,
        wind:wind_speed,
        week_daysStr:week_days_str,
        week_daysInt:week_days_int,
        week_daysMonth:week_month,
        UV:currUV,
        week_max:week_max_temp,
        week_min:week_min_temp,
        week_rain:week_rain_chance
    });
});

function unixToTime(unix_timestamp){
    var date = new Date(unix_timestamp * 1000);


    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();

    var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

    return formattedTime;
}

app.post("/search",async(req,res)=>{
    try {
        console.log(req.body.location)
        place=req.body.location;
        const response =await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${place}&appid=${API}`)
        currLat=response.data[0].lat;
        currLong=response.data[0].lon;
    } catch (error) {
        console.log(error)
    }
    res.redirect("/");
})

app.listen(port,()=>{
    console.log("Listening on port: ",port);
});