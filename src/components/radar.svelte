<script>
    export let nighttime

    import { onMount } from 'svelte';
    // import * as THREE from 'three';
    import mapboxgl from "mapbox-gl"
    // import { Time } from 'highcharts';

    let container;

    onMount(async () => {
        // const { Threebox } = await import("threebox-plugin")

        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY

        const coordinates = [-81.2081, 28.67]

        const map = new mapboxgl.Map({
            container: 'container',
            style: `mapbox://styles/mapbox/${nighttime ? "dark-v9" : "satellite-streets-v12"}`,
            center: coordinates,
            zoom: 12,
            pitch: 75,
            bearing: 0,
            interactive: false,
        });

        let bearing = 0
        let lastTime = 0;

        function update(currentTime) {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            bearing += (deltaTime / 1000) * 0.8

            map.setBearing(bearing)
            
            requestAnimationFrame(update);
        }

        requestAnimationFrame(update);

        const LAYER_NAME = "radar"

        async function refreshRadar() {
            if (map.getLayer(LAYER_NAME)) {
                map.removeLayer(LAYER_NAME);
                map.removeSource(LAYER_NAME);
            }

            const radarData = await fetch("https://api.rainviewer.com/public/weather-maps.json")
                .then(res => res.json())

            const past = radarData.radar.past
            const recentUrl = past[past.length - 1].path

            map.addLayer({
                id: LAYER_NAME,
                type: "raster",
                source: {
                    type: "raster",
                    tiles: [
                        radarData.host + recentUrl + '/256/{z}/{x}/{y}/2/0_0.png'
                    ],
                    tileSize: 256
                },
                paint: {
                    "raster-opacity": 0.6,
                },
                minzoom: 0,
                maxzoom: 20,
            });
        }

        map.on('style.load', () => {
            map.addSource('point', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [{
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': coordinates // Longitude, Latitude
                        }
                    }]
                }
            });

            // map.addLayer({
            //     'id': 'point-text',
            //     'type': 'symbol',
            //     'source': 'point',
            //     'layout': {
            //         'text-field': 'Hello, World!', // The text you want to display
            //         'text-size': 50 // Text size
            //     },
            //     'paint': {
            //         'text-color': '#ffffff',
            //     }
            // });


            refreshRadar()
        });
        setInterval(refreshRadar, 60000);
    });
</script>

<div id="container" bind:this={container}></div>

<style>
    div {
        width: 100%;
        height: 100%;
        position: fixed;
        z-index: -2;
    }
</style>
  