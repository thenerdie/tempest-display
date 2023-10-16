<script>
    import { getEmojiForCondition } from "$lib/utf8"

    export let current
</script>

<div id="conditions">
    <p id="primary">{getEmojiForCondition(current?.conditions)} {current?.air_temperature}°</p>
    <div id="secondary">
        <p><datakey>HUMIDITY</datakey> {current?.relative_humidity}%</p>
        <hr>
        <p><datakey>WIND</datakey> {current?.wind_avg} MPH {current?.wind_direction_cardinal} (gust {current?.wind_gust} MPH)</p>
        <hr>
        <p><datakey>PRESSURE</datakey> {current?.station_pressure.toFixed(0)} mb</p>
    </div>
</div>

<style>
    datakey {
        color: rgb(197, 197, 197);
    }

    #conditions {
        margin-left: auto;
        margin-right: auto;
        width: fit-content;
        margin-bottom: 15px;
        margin-top: 10px;
    }

    #primary {
        font-size: 90px;
        margin-bottom: 0px;
        margin-top: 10px;
    }
    
    #secondary {
        font-size: 20px;
        display: flex;
        flex-direction: row;
        margin-bottom: 0px;
        justify-content: center;
        gap: 15px;
    }
</style>