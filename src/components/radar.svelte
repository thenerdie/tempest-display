<script>
    export let nighttime

    import { onMount } from 'svelte';
    // import * as THREE from 'three';
    import mapboxgl from "mapbox-gl"
    // import { Time } from 'highcharts';
    import axios from "axios"

    let container;

    let nearbyCities = []

    async function getCitiesByGeocode(lat, lon) {
        const radius = 170;
        const maxRows = 300;

        try {
            const response = await axios.get(`http://api.geonames.org/findNearbyPlaceNameJSON?lat=${lat}&lng=${lon}&radius=${radius}&maxRows=${maxRows}&username=${import.meta.env.VITE_GEONAMES_KEY}`);

            let geonames = []

            response.data.geonames.forEach(geoname => {
                if (geoname.population > 2000)
                    geonames.push(geoname)
            })

            return geonames;
        } catch (error) {
            console.error("Oops! There was an error:", error);
        }
    }

    async function getNearbyWeatherObservations(cities) {
        let observations = []

        for (let city of cities) {
            const { data } = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lng}&current=temperature_2m&temperature_unit=fahrenheit`)

            observations.push({
                weather: data.current,
                location: city,
            })
        }

        return observations
    }

    onMount(async () => {
        // const { Threebox } = await import("threebox-plugin")

        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY
        
        const coordinates = [-81.2081, 28.67]
        
        nearbyCities = await getCitiesByGeocode(coordinates[1], coordinates[0])

        const map = new mapboxgl.Map({
            container: 'container',
            style: "mapbox://styles/mapbox/dark-v9",
            center: coordinates,
            zoom: 11,
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

        const RADAR_LAYER_NAME = "radar"
        const TEMP_LAYER_NAME = "temp"
        const CLOUDS_LAYER_NAME = "clouds"

        async function refreshRadar() {
            if (map.getLayer(RADAR_LAYER_NAME)) {
                map.removeLayer(RADAR_LAYER_NAME);
                map.removeSource(RADAR_LAYER_NAME);
            }

            if (map.getLayer(TEMP_LAYER_NAME)) {
                map.removeLayer(TEMP_LAYER_NAME);
                map.removeSource(TEMP_LAYER_NAME);
            }

            if (map.getLayer(CLOUDS_LAYER_NAME)) {
                map.removeLayer(CLOUDS_LAYER_NAME);
                map.removeSource(CLOUDS_LAYER_NAME);
            }

            const radarData = await fetch("https://api.rainviewer.com/public/weather-maps.json")
                .then(res => res.json())

            const past = radarData.radar.past
            const recentUrl = past[past.length - 1].path

            map.addLayer({
                id: RADAR_LAYER_NAME,
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

            map.addLayer({
                id: TEMP_LAYER_NAME,
                type: "raster",
                source: {
                    type: "raster",
                    tiles: [
                        `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${import.meta.env.VITE_OWM_KEY}`
                    ],
                    tileSize: 256
                },
                paint: {
                    "raster-opacity": 0.8,
                },
            })

            map.addLayer({
                id: CLOUDS_LAYER_NAME,
                type: "raster",
                source: {
                    type: "raster",
                    tiles: [
                        `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${import.meta.env.VITE_OWM_KEY}`
                    ],
                    tileSize: 256
                },
                paint: {
                    "raster-opacity": 0.3,
                },
            })
        }

        map.on('style.load', async () => {
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

            getNearbyWeatherObservations(nearbyCities).then(observations => {
                observations.forEach(obs => {
                    const uid = `obs_${obs.location.name}`

                    map.addSource(uid, {
                        type: 'geojson',
                        data: {
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: [obs.location.lng, obs.location.lat]
                            },
                        }
                    });

                    map.addLayer({
                        'id': uid,
                        'type': 'symbol',
                        'source': uid,
                        'layout': {
                            'text-field': Math.round(obs.weather.temperature_2m).toString() + "°", // The text you want to display
                            'text-size': 20 // Text size
                        },
                        'paint': {
                            'text-color': '#ffffff',
                        }
                    });
                })
            })


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
  