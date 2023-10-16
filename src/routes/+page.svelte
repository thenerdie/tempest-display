<script>
    import Map from '../components/map.svelte';
    import Hourly from '../components/hourly.svelte';
    import Daily from '../components/daily.svelte'
    import Current from "../components/current.svelte"

    import { getEmojiForCondition } from "$lib/utf8"

    import { onMount } from 'svelte';
    import { format } from 'date-fns'

    let data = {}

    $: current = data.current_conditions
    $: hourly = data.forecast?.hourly
    $: daily = data.forecast?.daily

    let time
    let date

    async function getWeatherData() {
        return await fetch('http://localhost:3001/')
            .then(response => response.json())
    }

    onMount(async () => {
        data = await getWeatherData()

        console.log(data)

        setInterval(() => {
            time = format(Date.now(), "h:mm:ss aa")
            date = format(Date.now(), "iiii, MMMM do, yyyy")
        }, 0.5)

        setInterval(async () => {
            data = await getWeatherData()
        }, 60000)
    })
</script>

<div id="clock">
    <h1 id="time">{time}</h1>
    <h3>{date}</h3>
</div>

<div class="centered sky-gradient">
    <Map></Map>

    <Current current={current}></Current>
    
    <div id="forecast">
        <Hourly hourly={hourly}></Hourly>
        <hr>
        <Daily daily={daily}></Daily>
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

    .centered {
        text-align: center;
    }

    #forecast {
        display: flex;
        flex-direction: row;
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        margin-left: auto;
        margin-right: auto;
        margin-bottom: 10px;
        width: 95%;
        height: 50%;
        gap: 10px;
    }

    hr {
        border-color: rgba(148, 148, 148, 0.308);
    }
</style>

<link href="https://fonts.googleapis.com/css2?family=Gabarito:wght@800&display=swap" rel="stylesheet">