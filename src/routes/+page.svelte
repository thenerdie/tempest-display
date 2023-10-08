<script>
    import StarrySky from '../components/sky.svelte';

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

        setChartColor(nighttime ? "#a7a6bf" : "#153845")    

        current.emoji = conditionToEmoji[current.conditions]

        daily = data.forecast.daily

        let minTemp = Math.min(...daily.map(day => day.air_temp_low));
        let maxTemp = Math.max(...daily.map(day => day.air_temp_high));

        const divMaxHeight = 105;

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

    onMount(async () => {
        const data = await getWeatherData()
        const { forecast } = data

        const Highcharts = await import('highcharts')

        const chartOptions = {
            chart: {
                type: 'spline', 
                renderTo: 'chart',
                backgroundColor: "#0e293357",
                style: {
                    color: "blue"
                }
            },
            title: {
                text: 'Hourly Forecast',
                style: {
                    "font-family": "Gabarito"
                }
            },
            xAxis: { categories: forecast.hourly.map(hour => format(hour.time * 1000, "h:mm aa")).slice(0,24) },
            yAxis: { title: { text: 'Temperature' } },
            series: [
                {
                    name: 'Temperature',
                    data: forecast.hourly.map(hour => hour.air_temperature).slice(0,24),
                    lineWidth: 4,
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

        chart = Highcharts.chart(chartOptions);

        setInterval(() => {
            time = format(Date.now(), "h:mm:ss | iiii")
        }, 0.5)

        refresh(data)
    })
</script>

<h1 id="time">{time}</h1>

<div class="centered sky-gradient">
    <StarrySky></StarrySky>
    <h1 id="temperature">{temperature}°</h1>
    <h2 id="conditions">{emoji} {conditions}</h2>

    <div id="extended">
        <div class="extended-item">
            <h2>Humidity</h2>
            <h4>{humidity}%</h4>
        </div>
        <hr>
        <div class="extended-item">
            <h2>Barometric Pressure</h2>
            <h4>{pressure.toFixed(0)} mb and {pressureTrend}</h4>
        </div>
        <hr>
        <div class="extended-item">
            <h2>Wind</h2>
            <h4>{windSpeed} MPH {windDirection}</h4>
        </div>
    </div>
    
    <div id="info-grid">
        <div id="chart"></div>
        <div class="daily-forecast">
            {#each daily as day}
                <div class="day">
                    <h1>{conditionToEmoji[day.conditions]}</h1>
                    <h2>{format(day.day_start_local * 1000, "iiiiii")}</h2>
                    <p class="high-temp" style="margin-top: {day._margintop + "px"}">{day.air_temp_high}°</p>
                    <div class="rounded" style="height: {day._height + 'px'};"></div>
                    <p class="low-temp">{day.air_temp_low}°</p>
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
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
        justify-content: center;
        width: fit-content;
    }


    #temperature {
        font-size: 150px;
        margin-bottom: -15px;
        margin-top: 15px;
    }

    #conditions {
        margin-bottom: 40px;
        font-size: 24px;
    }

    #extended {
        display: flex;
        flex-direction: row;
        margin-left: auto;
        margin-right: auto;
        justify-content: center;
        width: fit-content;
        gap: 50px;
    }

    hr {
        border-color: rgba(67, 95, 172, 0.308);
    }

    .extended-item > :not(:last-child) {
        margin-bottom: -10px;
    }

    .daily-forecast {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        width: fit-content;
        height: 50%;
        background-color: #0e293357;
        padding: 30px;
        border-radius: 10px;
        margin: auto;
    }

    .day {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0 -5px;
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

{#if nighttime}
    <style>
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
            color: #a7a6bf;
        }
    </style>
{:else if blueSkies}
    <style>
        .sky-gradient {
            background: linear-gradient(to bottom, #6dc2e4, #dadfe0);
            height: 100vh;
            width: 100%;
            position: absolute;
            top: 0;
            left: 0;
            z-index: -1;
        }

        * {
            font-family: 'Gabarito', sans-serif;
            color: #153845;
        }
    </style>
{:else}
    <style>
        .sky-gradient {
            background: linear-gradient(to bottom, #7a7f81, #dadfe0);
            height: 100vh;
            width: 100%;
            position: absolute;
            top: 0;
            left: 0;
            z-index: -1;
        }

        * {
            font-family: 'Gabarito', sans-serif;
            color: #153845;
        }
    </style>
{/if}

<link href="https://fonts.googleapis.com/css2?family=Gabarito:wght@800&display=swap" rel="stylesheet">