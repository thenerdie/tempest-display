<script>
    // let minTemp = Math.min(...daily.map(day => day.air_temp_low));
    // let maxTemp = Math.max(...daily.map(day => day.air_temp_high));

    // const divMaxHeight = 90;

    // daily.forEach(day => {
    //     day._height = ((day.air_temp_high - day.air_temp_low) / (maxTemp - minTemp)) * divMaxHeight;
    //     day._margintop = ((maxTemp - day.air_temp_high) / (maxTemp - minTemp)) * divMaxHeight;
    // });

    import { onMount, afterUpdate } from "svelte"
    import { format } from 'date-fns'

    import { getEmojiForCondition } from "$lib/utf8"

    export let daily = []
    
    let chart
    let render

    

    function generateChartOptions() {
        const chartOptions = {
            chart: {
                type: 'columnrange', 
                renderTo: render,
                backgroundColor: "#00000000",
                style: {
                    color: "white"
                },
                options3d: {
                    enabled: false,
                    alpha: 25,
                    beta: 2,
                    depth: 100
                }
            },
            title: {
                text: 'Daily Forecast',
                style: {
                    "font-family": "Gabarito",
                    "color": "white"
                }
            },
            legend: {
                itemStyle: {
                    color: '#ffffff',
                    fontWeight: 'bold',
                    fontSize: 10,
                },
            },
            xAxis: {
                categories: daily.map(day => format(day.day_start_local * 1000, "EEEEEE")),
                labels: {
                    style: {
                        color: '#ffffff'
                    }
                },
                title: {
                    style: {
                        color: '#ffffff'
                    }
                }
            },
            plotOptions: {
                columnrange: {
                    borderRadius: '50%',
                    dataLabels: {
                        enabled: true,
                        format: '{y}°',
                        style: {
                            "font-family": "Gabarito",
                            "color": "white",
                            "font-size": "24px",
                        }
                    }
                }
            },
            yAxis: [
                {
                    labels: {
                        style: {
                            color: '#ffffff'
                        }
                    },
                    title: {
                        text: 'Temperature',
                        style: {
                            color: '#ffffff'
                        }
                    }
                },
                {
                    labels: {
                        style: {
                            color: '#ffffff'
                        }
                    },
                    title: {
                        text: 'Chance of Precipitation',
                        style: {
                            color: '#ffffff'
                        }
                    },
                    min: 0,
                    max: 100,
                },
            ],
            series: [
                {
                    name: 'Temperature',
                    data: daily.map(day => [ day.air_temp_low, day.air_temp_high ]),
                    yAxis: 0,
                },
                // {
                //     name: 'Humidity',
                //     data: hourly.map(hour => hour.relative_humidity).slice(0, HOURS),
                //     lineWidth: 5,
                //     marker: {
                //         enabled: false,
                //     },
                //     yAxis: 1,
                //     depth: 75,
                //     zIndex: 1,
                // },
                {
                    name: 'Chance of Precipitation',
                    type: "areaspline",
                    data: daily.map(day => day.precip_probability),
                    lineWidth: 5,
                    marker: {
                        enabled: false,
                    },
                    color: "#59eeff",
                    fillColor: "#46c1cf",
                    yAxis: 1,
                    depth: 75,
                    zIndex: 0,
                },
                // {
                //     name: 'Wind',
                //     data: hourly.map(hour => hour.wind_avg).slice(0, HOURS),
                //     lineWidth: 5,
                //     marker: {
                //         enabled: false,
                //     },
                //     color: "#b3b3b3",
                //     yAxis: 3,
                //     depth: 75,
                //     zIndex: 1,
                // },
            ]
        };

        return chartOptions
    }

    onMount(async () => {
        const Highcharts = await import("highcharts")
        const HighchartsMore = await import("highcharts/highcharts-more")

        HighchartsMore.default(Highcharts)
        
        chart = Highcharts.chart(generateChartOptions());

        // setChartColor("#e2e2e2")
    })
    
    afterUpdate(async () => {
        console.log(daily)
        chart?.update(generateChartOptions())
    })
</script>

<div bind:this={render}></div>

<style>
    div {
        margin-bottom: 20px;
        border-radius: 10px;
        width: 60%;
    }
</style>