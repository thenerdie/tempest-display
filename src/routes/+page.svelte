<script>
    import { onMount } from 'svelte';
    import { format } from 'date-fns'

    let temperature = 0;
    let conditions = ""
    let emoji = ""
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

    async function refresh() {
        const data = await fetch('http://localhost:3001/')
            .then(response => response.json())

        const { current_conditions: current } = data

        let clearSkiesWhitelist = [ "Clear", "Windy", "Partly Cloudy" ]

        if (!clearSkiesWhitelist.includes(current.conditions))
            blueSkies = false

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
        emoji = current.emoji

        return data
    }

    onMount(async () => {
        const { forecast } = await refresh()

        const Highcharts = await import('highcharts')

        const chartOptions = {
            chart: {
                type: 'line', 
                renderTo: 'chart',
                backgroundColor: "#0e293357"
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
                    zones: [
                        {
                            value: 0,
                            color: '#f00'
                        },
                        {
                            value: 80,
                            color: '#ff0'
                        },
                        {
                            color: '#0f0'
                        }
                    ]
                },
            ]
        };

        chart = Highcharts.chart(chartOptions);

        setInterval(() => {
            time = format(Date.now(), "h:mm:ss | iiii")
        }, 0.5)
    })
</script>

<h1 id="time">{time}</h1>


<div class="centered sky-gradient">
    <h1 id="temperature">{temperature}°</h1>
    <h2 id="conditions">{emoji} {conditions}</h2>
    
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
    * {
        font-family: 'Gabarito', sans-serif;
        color: #153845;
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

{#if blueSkies}
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
    </style>
{/if}

<link href="https://fonts.googleapis.com/css2?family=Gabarito:wght@800&display=swap" rel="stylesheet">