export function getEmojiForCondition(condition) {
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

    if (condition) {
        return conditionToEmoji[condition]
    } else {
        return ""
    }
}