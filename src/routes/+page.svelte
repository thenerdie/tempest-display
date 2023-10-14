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

        const divMaxHeight = 90;

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

    function generateHourlyChartOptions(forecast) {
        const HOURS = 24 * 2

        const chartOptions = {
            chart: {
                type: 'spline', 
                renderTo: 'chart',
                backgroundColor: "#00000000",
                style: {
                    color: "blue"
                },
                options3d: {
                    enabled: false,
                    alpha: 25,
                    beta: 2,
                    depth: 100
                }
            },
            title: {
                text: 'Forecast',
                style: {
                    "font-family": "Gabarito"
                }
            },
            xAxis: {
                categories: forecast.hourly.map(hour => format(hour.time * 1000, "EEE h aa")).slice(0, HOURS),
                tickInterval: 8,
            },
            yAxis: [
                { title: { text: 'Temperature' } },
                {
                    title: {
                        text: 'Humidity'
                    },
                    opposite: true,
                    min: 0,
                    max: 100,
                },
                {
                    title: {
                        text: 'Chance of Precipitation'
                    },
                    min: 0,
                    max: 100,
                },
                {
                    title: {
                        text: 'Wind'
                    },
                    min: 0,
                }
            ],
            series: [
                {
                    name: 'Temperature',
                    data: forecast.hourly.map((hour, hourNum) => {
                        return {
                            name: conditionToEmoji[hour.conditions],
                            x: hourNum,
                            y: hour.air_temperature,
                        }
                    }).slice(0, HOURS),
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
                    ],
                    dataLabels: {
                        enabled: true,
                        format: "{point.name}",
                        style: {
                            fontSize: "20px"
                        }
                    },
                    yAxis: 0,
                    depth: 25,
                    zIndex: 0,
                },
                {
                    name: 'Humidity',
                    data: forecast.hourly.map(hour => hour.relative_humidity).slice(0, HOURS),
                    lineWidth: 5,
                    marker: {
                        enabled: false,
                    },
                    yAxis: 1,
                    depth: 75,
                    zIndex: 1,
                },
                {
                    name: 'Chance of Precipitation',
                    type: "areaspline",
                    data: forecast.hourly.map(hour => hour.precip_probability).slice(0, HOURS),
                    lineWidth: 5,
                    marker: {
                        enabled: false,
                    },
                    color: "#59eeff",
                    fillColor: "#46c1cf",
                    yAxis: 2,
                    depth: 75,
                    zIndex: 2,
                },
                {
                    name: 'Wind',
                    data: forecast.hourly.map(hour => hour.wind_avg).slice(0, HOURS),
                    lineWidth: 5,
                    marker: {
                        enabled: false,
                    },
                    yAxis: 3,
                    depth: 75,
                    zIndex: 1,
                },
            ]
        };

        return chartOptions
    }

    function refreshChart(chart, data) {
        const options = generateHourlyChartOptions(data)

        chart.update(options)
    }

    function refreshAll(data, chart) {
        refresh(data)
        refreshChart(chart, data.forecast)
    }

    onMount(async () => {
        const data = await getWeatherData()

        const Highcharts = await import("highcharts")
        const Highcharts3D = await import("highcharts/highcharts-3d")

        Highcharts3D.default(Highcharts)

        chart = Highcharts.chart(generateHourlyChartOptions(data.forecast));

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
    <Radar nighttime={nighttime}></Radar>
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
    
    <div id="chart" class="widget"></div>
    <!-- <div id="info-grid">
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
    </div> -->
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
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        margin-bottom: 20px;
        border-radius: 10px;
        height: 40%;
        width: 80%;
        margin-left: auto;
        margin-right: auto;
    }

    .centered {
        text-align: center;
    }

    /* #info-grid {
        display: flex;
        flex-direction: row;
        gap: 15px;
        margin-left: auto;
        margin-right: auto;
        margin-top: 21%;
        justify-content: center;
        width: fit-content;
        height: 46%;
    } */
    
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
        font-size: 15px;
        margin-bottom: -3px;
    }

    .day-abbr {
        font-size: 20px;
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
        background-color: #0000002d;
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
        font-size: 14px;
    }
</style>

<link href="https://fonts.googleapis.com/css2?family=Gabarito:wght@800&display=swap" rel="stylesheet">