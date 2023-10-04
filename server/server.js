import 'dotenv/config'

import fastify from "fastify"
import axios from "axios"

import cors from "@fastify/cors"

const units = {
    units_temp: "f",
    units_wind: 'mph',
    units_pressure: 'mb',
    units_precip: 'in',
    units_distance: 'mi'
}

const server = fastify({
    logger: true
})

server.register(cors)

server.get("/", async (_, reply) => {
    const { data } = await axios.get("https://swd.weatherflow.com/swd/rest/better_forecast", {
        params: {
            station_id: process.env.TEMPEST_STATION_ID,
            token: process.env.TEMPEST_KEY,
            ...units
        }
    })

    reply.send(data)
})

server.listen({
    port: 3001
})