<script>
    import Radar from '../components/radar.svelte';

    import { onMount } from 'svelte';
    import { format, isBefore, isAfter } from 'date-fns'

    let temperature = 0;
    let humidity = 0;
    let pressure = 0;
    let windSpeed = 0;
    let windDirection = "";
    let conditions = ""
    let pressureTrend = ""
    let emoji = ""
    let nighttime = false
    let daily = []

    let time
    let date

    let blueSkies = true

    const conditionToEmoji = {
        "Clear": "☀️",
        "Rain Likely": "🌧️",
        "Rain Possible": "🌦️",
        "Snow": "❄️",
        "Snow Possible": "🌨️",
        "Wintry Mix Likely": "🌨️❄️",
        "Wintry Mix Possible": "❄️🌦️",
        "Thunderstorms Likely": "⛈️",
        "Thunderstorms Possible": "🌩️",
        "Windy": "💨",
        "Foggy": "🌫️",
        "Cloudy": "☁️",
        "Partly Cloudy": "⛅",
        "Very Light Rain": "🌦️"
    }

    let chart

    function setChartColor(color) {
        chart.update({
            chart: {
                style: {
                    color: color
                }
            },
            title: {
                style: {
                    color: color
                }
            },
            subtitle: {
                style: {
                    color: color
                }
            },
            xAxis: {
                labels: {
                    style: {
                        color: color
                    }
                },
                title: {
                    style: {
                        color: color
                    }
                }
            },
            yAxis: {
                labels: {
                    style: {
                        color: color
                    }
                    },
                    title: {
                    style: {
                        color: color
                    }
                }
            },
            legend: {
                itemStyle: {
                    color: color
                }
            },
            tooltip: {
                style: {
                    color: color
                }
            },
        });
    }

    async function getWeatherData() {
        return await fetch('http://localhost:3001/')
            .then(response => response.json())
    }

    async function refresh(data) {
        const { current_conditions: current, forecast } = data

        let clearSkiesWhitelist = [ "Clear", "Windy", "Partly Cloudy" ]

        if (!clearSkiesWhitelist.includes(current.conditions))
            blueSkies = false

        const today = forecast.daily[0]

        const sunrise = new Date(today.sunrise * 1000)
        const sunset = new Date(today.sunset * 1000)

        const now = Date.now()

        nighttime = isAfter(now, sunset) || isBefore(now, sunrise)

        setChartColor("#e2e2e2")

        current.emoji = conditionToEmoji[current.conditions]

        daily = data.forecast.daily

        let minTemp = Math.min(...daily.map(day => day.air_temp_low));
        let maxTemp = Math.max(...daily.map(day => day.air_temp_high));

        const divMaxHeight = 80;

        daily.forEach(day => {
            day._height = ((day.air_temp_high - day.air_temp_low) / (maxTemp - minTemp)) * divMaxHeight;
            day._margintop = ((maxTemp - day.air_temp_high) / (maxTemp - minTemp)) * divMaxHeight;
        });

        temperature = current.air_temperature
        conditions = current.conditions
        humidity = current.relative_humidity
        windSpeed = current.wind_avg
        windDirection = current.wind_direction_cardinal
        pressure = current.station_pressure
        pressureTrend = current.pressure_trend
        emoji = current.emoji

        return data
    }

    function generateChartOptions(forecast) {
        const HOURS = 24

        const chartOptions = {
            chart: {
                type: 'spline', 
                renderTo: 'chart',
                backgroundColor: "#0e293357",
                style: {
                    color: "blue"
                },
                options3d: {
                    enabled: true,
                    alpha: 25,
                    beta: 25,
                    depth: 70
                }
            },
            title: {
                text: 'Hourly Forecast',
                style: {
                    "font-family": "Gabarito"
                }
            },
            xAxis: { categories: forecast.hourly.map(hour => format(hour.time * 1000, "h:mm aa")).slice(0, HOURS) },
            yAxis: { title: { text: 'Temperature' } },
            series: [
                {
                    name: 'Temperature',
                    data: forecast.hourly.map(hour => hour.air_temperature).slice(0, HOURS),
                    lineWidth: 5,
                    marker: {
                        enabled: false,
                    },
                    zones: [
                        {
                            value: -20,  // Extremely Cold
                            color: '#0000ff'  // Dark Blue
                        },
                        {
                            value: 0,  // Freezing
                            color: '#00ccff'  // Light Blue
                        },
                        {
                            value: 32,  // Cold
                            color: '#00ffcc'  // Cyan
                        },
                        {
                            value: 50,  // Chilly
                            color: '#00ff00'  // Green
                        },
                        {
                            value: 68,  // Comfortable
                            color: '#ccff00'  // Light Green
                        },
                        {
                            value: 80,  // Warm
                            color: '#ffff00'  // Yellow
                        },
                        {
                            value: 95,  // Hot
                            color: '#ffcc00'  // Orange
                        },
                        {
                            value: 110,  // Very Hot
                            color: '#ff6600'  // Dark Orange
                        },
                        {
                            color: '#ff0000'  // Extremely Hot, Red
                        }
                    ]
                },
            ]
        };

        return chartOptions
    }

    function refreshChart(chart, data) {
        const options = generateChartOptions(data)

        chart.update(options)
    }

    function refreshAll(data, chart) {
        refresh(data)
        refreshChart(chart, data.forecast)
    }

    onMount(async () => {
        const data = await getWeatherData()

        const Highcharts = await import('highcharts')

        chart = Highcharts.chart(generateChartOptions(data.forecast));

        setInterval(() => {
            time = format(Date.now(), "h:mm:ss aa")
            date = format(Date.now(), "iiii, MMMM do, yyyy")
        }, 0.5)

        refreshAll(data, chart)

        setInterval(async () => {
            const data = await getWeatherData()

            refreshAll(data, chart)
        }, 60000)
    })
</script>

<div id="clock">
    <h1 id="time">{time}</h1>
    <h3>{date}</h3>
</div>

<div class="centered sky-gradient">
    <Radar nighttime></Radar>
    <div id="conditions">
        <p>{emoji} {temperature}°</p>
        <hr>
        <p>💧 {humidity} %</p>
        <hr>
        <p>💨 {windSpeed} MPH {windDirection}</p>
    </div>

    <!-- <div id="extended">
        <div class="extended-item">
            <h2>Humidity</h2>
            <h4>{humidity}%</h4>
        </div>
        <hr>
        <div class="extended-item">
            <h2>Barometric Pressure</h2>
            <h4></h4>
        </div>
        <hr>
        <div class="extended-item">
            <h2>Wind</h2>
            <h4></h4>
        </div>
    </div> -->
    
    <div id="info-grid">
        <div id="chart" class="widget"></div>
        <div class="widget daily-forecast">
            {#each daily as day}
                <div class="day">
                    <h2 class="day-abbr">{format(day.day_start_local * 1000, "iiiiii")}</h2>
                    <h1 class="daily-icon">{conditionToEmoji[day.conditions]}</h1>
                    <p class="precip-icon">💧</p>
                    <p class="precip">{day.precip_probability}%</p>
                    <p class="high-temp" style="margin-top: {day._margintop + "px"}">{day.air_temp_high}°</p>
                    <div class="rounded" style="height: {day._height + 'px'};"></div>
                    <p class="low-temp">{day.air_temp_low}°</p>
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    #clock {
        display: flex;
        flex-direction: column;
        position: fixed;
        margin-left: 10px;
    }

    #time {
        font-size: x-large;
        margin-bottom: -20px;
    }
    
    #clock > * {
        color: #d7d7d7;
    }

    .sky-gradient {
        background: linear-gradient(to bottom, #0d0d0d, #171717);
        height: 100vh;
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
        z-index: -1;
    }

    * {
        font-family: 'Gabarito', sans-serif;
        color: #ffffff;
        text-shadow: rgb(0, 0, 0) 1px 0 2px;
    }

    #chart {
        width: 50%;
        border-radius: 10px;
    }

    .centered {
        text-align: center;
    }

    #info-grid {
        display: flex;
        flex-direction: row;
        gap: 15px;
        margin-left: auto;
        margin-right: auto;
        margin-top: 16%;
        justify-content: center;
        width: fit-content;
        /* height: 30%; */
    }
    
    #conditions {
        margin-bottom: 0px;
        font-size: 25px;
        display: flex;
        flex-direction: row;
        margin-left: auto;
        margin-right: auto;
        justify-content: center;
        width: fit-content;
        gap: 15px;
        margin-bottom: 15px;
        margin-top: 10px;
    }

    /* .precip {
        color: #0e293357;
    } */

    .precip-icon {
        font-size: 10px;
        margin-bottom: -7px;
    }

    .daily-icon {
        margin-bottom: -3px;
    }

    .day-abbr {
        margin-bottom: -10px;
    }

    hr {
        border-color: rgba(148, 148, 148, 0.308);
    }

    /* .extended-item > :not(:last-child) {
        margin-bottom: -10px;
    } */

    .widget {
        border-radius: 10px;
        background-color: #07141895;
    }

    .daily-forecast {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        width: fit-content;
        height: fit-content;
        padding: 20px;
        gap: -20px;
        margin: auto;
    }

    .day {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: -15px;
        margin-bottom: -15px;
        padding: 10px;
    }

    .rounded {
        background: linear-gradient(to bottom, #4c82a7, #316671);
        width: 15px;
        border-radius: 20px;
    }

    .high-temp, .low-temp {
        font-size: 18px;
    }
</style>

<link href="https://fonts.googleapis.com/css2?family=Gabarito:wght@800&display=swap" rel="stylesheet">