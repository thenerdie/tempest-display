<script>
    import { onMount, afterUpdate } from "svelte"
    import { format } from 'date-fns'

    import { getEmojiForCondition } from "$lib/utf8"

    export let hourly = []
    
    let chart
    let render

    function setChartColor(color) {
        chart?.update({
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

    function generateChartOptions() {
        const HOURS = 24 * 2

        const chartOptions = {
            chart: {
                type: 'spline', 
                renderTo: render,
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
                text: 'Hourly Forecast',
                style: {
                    "font-family": "Gabarito"
                }
            },
            xAxis: {
                categories: hourly.map(hour => format(hour.time * 1000, "EEE h aa")).slice(0, HOURS),
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
                    data: hourly.map((hour, hourNum) => {
                        return {
                            name: getEmojiForCondition(hour.conditions),
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
                    data: hourly.map(hour => hour.relative_humidity).slice(0, HOURS),
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
                    data: hourly.map(hour => hour.precip_probability).slice(0, HOURS),
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
                    data: hourly.map(hour => hour.wind_avg).slice(0, HOURS),
                    lineWidth: 5,
                    marker: {
                        enabled: false,
                    },
                    color: "#b3b3b3",
                    yAxis: 3,
                    depth: 75,
                    zIndex: 1,
                },
            ]
        };

        return chartOptions
    }

    onMount(async () => {
        const Highcharts = await import("highcharts")
        const Highcharts3D = await import("highcharts/highcharts-3d")
        
        Highcharts3D.default(Highcharts)
        
        chart = Highcharts.chart(generateChartOptions());
        
        setChartColor("#e2e2e2")
    })
    
    afterUpdate(async () => {
        console.log(hourly)
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