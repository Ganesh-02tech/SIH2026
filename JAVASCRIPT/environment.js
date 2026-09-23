/* =========================================================
   DHRUV NETRA — ENVIRONMENT JS
   Environmental Monitoring + AI Decision Support
   ========================================================= */


/* =========================================================
   ENVIRONMENT STATE
   ========================================================= */

const environmentState = {

    /* -------------------------
       Weather
    ------------------------- */

    temperature: -8,
    windSpeed: 32,
    windDirection: "NE",
    pressure: 982,
    visibility: 8,
    precipitation: "Snow",


    /* -------------------------
       Sea Ice
    ------------------------- */

    iceConcentration: 46,
    iceThickness: 1.2,
    iceEdgeDistance: 180,
    iceDrift: 0.8,


    /* -------------------------
       Ocean
    ------------------------- */

    currentSpeed: 1.6,
    currentDirection: "SW",
    waveHeight: 2.4,
    waveDirection: "W",
    seaSurfaceTemperature: -1.2,
    seaState: "Moderate",


    /* -------------------------
       AI
    ------------------------- */

    overallRisk: "low",

    weatherImpact: "normal",

    iceRisk: "increasing",

    oceanImpact: "moderate",

    routeRisk: "moderate",

    predictedDelay: 3,

    fuelImpact: 4,

    predictionConfidence: "HIGH CONFIDENCE",


    /* -------------------------
       System
    ------------------------- */

    lastUpdated: new Date()

};


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const elements = {

    /* -------------------------
       Header
    ------------------------- */

    lastUpdated:
        document.getElementById("lastUpdated"),


    /* -------------------------
       Overview
    ------------------------- */

    overview:
        document.querySelector(".environment-overview"),

    overviewIcon:
        document.querySelector(".overview-icon"),

    overviewTitle:
        document.querySelector(".overview-heading h2"),

    overviewDescription:
        document.querySelector(".overview-description"),

    overviewAI:
        document.querySelector(".ai-overview .ai-content p"),


    /* -------------------------
       Weather
    ------------------------- */

    weatherCards:
        document.querySelectorAll(".weather-card"),

    weatherAI:
        document.querySelector(".weather-ai"),

    weatherAIText:
        document.querySelector(".weather-ai p"),


    /* -------------------------
       Sea Ice
    ------------------------- */

    iceCards:
        document.querySelectorAll(".ice-card"),

    iceAI:
        document.querySelector(".ice-ai"),

    iceAIText:
        document.querySelector(".ice-ai p"),

    iceImpact:
        document.querySelector(".impact-row strong"),


    /* -------------------------
       Ocean
    ------------------------- */

    oceanCards:
        document.querySelectorAll(".ocean-card"),

    oceanAI:
        document.querySelector(".ocean-ai"),

    oceanAIText:
        document.querySelector(".ocean-ai p"),


    /* -------------------------
       Forecast
    ------------------------- */

    forecastPoints:
        document.querySelectorAll(".forecast-point"),

    forecastAI:
        document.querySelector(".forecast-ai p"),


    /* -------------------------
       Route Impact
    ------------------------- */

    routeImpact:
        document.querySelector(".route-impact-section"),

    routeDelay:
        document.querySelector(
            ".impact-summary:nth-child(2) strong"
        ),

    routeRisk:
        document.querySelector(
            ".impact-summary:nth-child(3) strong"
        ),

    routeFuel:
        document.querySelector(
            ".impact-summary:nth-child(4) strong"
        ),

    routeAI:
        document.querySelector(".ai-route-conclusion p"),

    confidence:
        document.querySelector(".confidence")

};


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeIcons();

    updateEnvironment();

    startEnvironmentSimulation();

    initializeNavigation();

});


/* =========================================================
   LUCIDE ICONS
   ========================================================= */

function initializeIcons() {

    if (
        typeof lucide !== "undefined" &&
        typeof lucide.createIcons === "function"
    ) {

        lucide.createIcons();

    }

}


/* =========================================================
   UPDATE COMPLETE ENVIRONMENT
   ========================================================= */

function updateEnvironment() {

    updateWeather();

    updateSeaIce();

    updateOcean();

    updateOverallRisk();

    updateForecast();

    updateRouteImpact();

    updateLastUpdated();

}


/* =========================================================
   WEATHER
   ========================================================= */

function updateWeather() {

    if (!elements.weatherCards.length) {
        return;
    }


    /*
        Weather card order:

        0 → Temperature
        1 → Wind Speed
        2 → Wind Direction
        3 → Pressure
        4 → Visibility
        5 → Precipitation
    */


    const weatherValues = [

        `${environmentState.temperature}°C`,

        `${Math.round(environmentState.windSpeed)} kn`,

        environmentState.windDirection,

        `${Math.round(environmentState.pressure)} hPa`,

        `${environmentState.visibility.toFixed(1)} km`,

        environmentState.precipitation

    ];


    elements.weatherCards.forEach(
        (card, index) => {

            const value =
                card.querySelector(
                    ".data-content strong"
                );

            if (value && weatherValues[index]) {

                value.textContent =
                    weatherValues[index];

            }

        }
    );


    /*
        AI Weather Interpretation
    */

    if (!elements.weatherAIText) {
        return;
    }


    if (environmentState.windSpeed >= 40) {

        environmentState.weatherImpact =
            "high";

        elements.weatherAIText.textContent =
            "Strong winds may significantly reduce vessel speed and increase fuel consumption along the route.";

        setInsightState(
            elements.weatherAI,
            "danger"
        );

    }

    else if (environmentState.windSpeed >= 30) {

        environmentState.weatherImpact =
            "moderate";

        elements.weatherAIText.textContent =
            "Strong headwinds are expected to reduce vessel speed over the next 8 hours.";

        setInsightState(
            elements.weatherAI,
            "warning"
        );

    }

    else {

        environmentState.weatherImpact =
            "normal";

        elements.weatherAIText.textContent =
            "Current weather conditions are expected to have limited impact on vessel operations.";

        setInsightState(
            elements.weatherAI,
            "normal"
        );

    }

}


/* =========================================================
   SEA ICE
   ========================================================= */

function updateSeaIce() {

    if (!elements.iceCards.length) {
        return;
    }


    /*
        Ice card order:

        0 → Ice Concentration
        1 → Ice Thickness
        2 → Ice Edge Distance
        3 → Ice Drift
    */


    const iceValues = [

        `${Math.round(environmentState.iceConcentration)}%`,

        `${environmentState.iceThickness.toFixed(1)} m`,

        `${Math.round(environmentState.iceEdgeDistance)} km`,

        `${environmentState.iceDrift.toFixed(1)} kn`

    ];


    elements.iceCards.forEach(
        (card, index) => {

            const value =
                card.querySelector(
                    ".data-content strong"
                );

            if (value && iceValues[index]) {

                value.textContent =
                    iceValues[index];

            }

        }
    );


    /*
        AI Ice Forecast
    */

    if (
        !elements.iceAIText ||
        !elements.iceImpact
    ) {
        return;
    }


    if (
        environmentState.iceConcentration >= 60 ||
        environmentState.iceThickness >= 1.6
    ) {

        environmentState.iceRisk =
            "high";


        elements.iceAIText.textContent =
            "High sea-ice concentration is predicted along the selected route. Vessel speed reduction may be required.";


        elements.iceImpact.textContent =
            "High resistance and possible speed reduction";


        setInsightState(
            elements.iceAI,
            "danger"
        );

    }

    else if (
        environmentState.iceConcentration >= 45
    ) {

        environmentState.iceRisk =
            "increasing";


        elements.iceAIText.textContent =
            "Sea-ice concentration is expected to increase along the selected route within the next 6–12 hours.";


        elements.iceImpact.textContent =
            "Increased resistance and possible speed reduction";


        setInsightState(
            elements.iceAI,
            "warning"
        );

    }

    else {

        environmentState.iceRisk =
            "low";


        elements.iceAIText.textContent =
            "Sea-ice conditions are currently within manageable limits along the selected route.";


        elements.iceImpact.textContent =
            "Limited expected impact";


        setInsightState(
            elements.iceAI,
            "normal"
        );

    }

}


/* =========================================================
   OCEAN CONDITIONS
   ========================================================= */

function updateOcean() {

    if (!elements.oceanCards.length) {
        return;
    }


    /*
        Ocean card order:

        0 → Current Speed
        1 → Current Direction
        2 → Wave Height
        3 → Wave Direction
        4 → Sea Surface Temperature
        5 → Sea State
    */


    const oceanValues = [

        `${environmentState.currentSpeed.toFixed(1)} kn`,

        environmentState.currentDirection,

        `${environmentState.waveHeight.toFixed(1)} m`,

        environmentState.waveDirection,

        `${environmentState.seaSurfaceTemperature.toFixed(1)}°C`,

        environmentState.seaState

    ];


    elements.oceanCards.forEach(
        (card, index) => {

            const value =
                card.querySelector(
                    ".data-content strong"
                );

            if (value && oceanValues[index]) {

                value.textContent =
                    oceanValues[index];

            }

        }
    );


    /*
        AI Ocean Interpretation
    */

    if (!elements.oceanAIText) {
        return;
    }


    if (
        environmentState.waveHeight >= 4 ||
        environmentState.seaState === "Rough"
    ) {

        environmentState.oceanImpact =
            "high";


        elements.oceanAIText.textContent =
            "Rough sea conditions may reduce vessel speed and increase fuel consumption on the selected route.";


        setInsightState(
            elements.oceanAI,
            "danger"
        );

    }

    else if (
        environmentState.waveHeight >= 2.5 ||
        environmentState.currentSpeed >= 2
    ) {

        environmentState.oceanImpact =
            "moderate";


        elements.oceanAIText.textContent =
            "Ocean conditions may moderately affect vessel speed, while current direction remains manageable.";


        setInsightState(
            elements.oceanAI,
            "warning"
        );

    }

    else {

        environmentState.oceanImpact =
            "normal";


        elements.oceanAIText.textContent =
            "Current conditions are moderately favorable, with limited expected impact on the selected route.";


        setInsightState(
            elements.oceanAI,
            "normal"
        );

    }

}


/* =========================================================
   OVERALL ENVIRONMENTAL RISK
   ========================================================= */

function updateOverallRisk() {

    const riskLevels = [

        environmentState.weatherImpact,

        environmentState.iceRisk,

        environmentState.oceanImpact

    ];


    if (
        riskLevels.includes("high")
    ) {

        environmentState.overallRisk =
            "high";

    }

    else if (
        riskLevels.includes("moderate") ||
        riskLevels.includes("increasing")
    ) {

        environmentState.overallRisk =
            "moderate";

    }

    else {

        environmentState.overallRisk =
            "low";

    }


    if (
        !elements.overviewTitle ||
        !elements.overviewDescription
    ) {
        return;
    }


    elements.overview.classList.remove(
        "warning",
        "danger"
    );


    elements.overviewIcon.classList.remove(
        "safe",
        "warning",
        "danger"
    );


    /*
        LOW
    */

    if (
        environmentState.overallRisk === "low"
    ) {

        elements.overviewTitle.textContent =
            "Low Risk";


        elements.overviewDescription.textContent =
            "Current environmental conditions remain within the expected range for the selected route.";


        elements.overviewIcon.classList.add(
            "safe"
        );


        elements.overviewAI.textContent =
            "Conditions are currently manageable with no significant environmental threat predicted along the route.";

    }


    /*
        MODERATE
    */

    else if (
        environmentState.overallRisk === "moderate"
    ) {

        elements.overview.classList.add(
            "warning"
        );


        elements.overviewTitle.textContent =
            "Moderate Risk";


        elements.overviewDescription.textContent =
            "Some environmental conditions are changing and may affect vessel performance along the selected route.";


        elements.overviewIcon.classList.add(
            "warning"
        );


        elements.overviewAI.textContent =
            "Increasing sea-ice and weather conditions may affect vessel speed and voyage duration.";

    }


    /*
        HIGH
    */

    else {

        elements.overview.classList.add(
            "danger"
        );


        elements.overviewTitle.textContent =
            "High Risk";


        elements.overviewDescription.textContent =
            "Multiple environmental factors may significantly affect the selected route.";


        elements.overviewIcon.classList.add(
            "danger"
        );


        elements.overviewAI.textContent =
            "Multiple environmental hazards are predicted ahead. Route conditions should be reviewed by the navigation officer.";

    }

}


/* =========================================================
   ENVIRONMENTAL FORECAST
   ========================================================= */

function updateForecast() {

    if (
        !elements.forecastPoints.length
    ) {
        return;
    }


    /*
        Forecast structure:

        0 → Now
        1 → +3h
        2 → +6h
        3 → +12h
    */


    const forecastStates = [

        {
            label: "Stable",
            type: "safe"
        },

        {
            label: "Stable",
            type: "safe"
        },

        {
            label:
                environmentState.iceRisk === "high"
                    ? "High Risk"
                    : "Moderate",

            type:
                environmentState.iceRisk === "high"
                    ? "warning"
                    : "moderate"
        },

        {
            label:
                environmentState.overallRisk === "high"
                    ? "High Risk"
                    : "Increasing Risk",

            type:
                environmentState.overallRisk === "high"
                    ? "warning"
                    : "warning"
        }

    ];


    elements.forecastPoints.forEach(
        (point, index) => {

            if (!forecastStates[index]) {
                return;
            }


            const state =
                forecastStates[index];


            const marker =
                point.querySelector(
                    ".forecast-marker"
                );


            const label =
                point.querySelector(
                    "strong"
                );


            if (marker) {

                marker.classList.remove(
                    "safe",
                    "moderate",
                    "warning"
                );

                marker.classList.add(
                    state.type
                );

            }


            if (label) {

                label.textContent =
                    state.label;

            }

        }
    );


    if (elements.forecastAI) {

        if (
            environmentState.overallRisk === "high"
        ) {

            elements.forecastAI.textContent =
                "Multiple environmental factors are expected to deteriorate over the next 12 hours. Increased route risk is predicted.";

        }

        else {

            elements.forecastAI.textContent =
                "Environmental conditions are expected to deteriorate gradually over the next 12 hours, mainly due to increasing sea-ice concentration.";

        }

    }

}


/* =========================================================
   AI ROUTE IMPACT
   ========================================================= */

function updateRouteImpact() {

    if (
        !elements.routeAI
    ) {
        return;
    }


    /*
        Route impact is derived from
        the combined environmental state.
    */


    if (
        environmentState.overallRisk === "high"
    ) {

        environmentState.routeRisk =
            "high";

        environmentState.predictedDelay =
            6;

        environmentState.fuelImpact =
            8;


        elements.routeAI.textContent =
            "Multiple environmental conditions may significantly increase travel time and fuel consumption on the selected route. Alternative route evaluation is recommended.";

    }

    else if (
        environmentState.overallRisk === "moderate"
    ) {

        environmentState.routeRisk =
            "moderate";

        environmentState.predictedDelay =
            3;

        environmentState.fuelImpact =
            4;


        elements.routeAI.textContent =
            "Current environmental conditions may increase travel time by approximately 3 hours and increase fuel consumption on the selected route.";

    }

    else {

        environmentState.routeRisk =
            "low";

        environmentState.predictedDelay =
            0;

        environmentState.fuelImpact =
            1;


        elements.routeAI.textContent =
            "Current environmental conditions are expected to have limited impact on the selected route.";

    }


    /*
        Update summary values
    */

    if (elements.routeDelay) {

        elements.routeDelay.textContent =
            environmentState.predictedDelay === 0
                ? "On time"
                : `+${environmentState.predictedDelay} hrs`;

    }


    if (elements.routeRisk) {

        elements.routeRisk.textContent =
            capitalize(
                environmentState.routeRisk
            );

    }


    if (elements.routeFuel) {

        elements.routeFuel.textContent =
            `+${environmentState.fuelImpact}%`;

    }


    /*
        Route risk color
    */

    if (elements.routeRisk) {

        elements.routeRisk.classList.remove(
            "low-text",
            "moderate-text",
            "high-text"
        );


        if (
            environmentState.routeRisk === "low"
        ) {

            elements.routeRisk.classList.add(
                "low-text"
            );

        }

        else if (
            environmentState.routeRisk === "moderate"
        ) {

            elements.routeRisk.classList.add(
                "moderate-text"
            );

        }

        else {

            elements.routeRisk.classList.add(
                "high-text"
            );

        }

    }


    /*
        Confidence
    */

    if (elements.confidence) {

        elements.confidence.textContent =
            environmentState.predictionConfidence;

    }

}


/* =========================================================
   INSIGHT STATE HELPER
   ========================================================= */

function setInsightState(
    element,
    state
) {

    if (!element) {
        return;
    }


    element.classList.remove(
        "warning",
        "danger"
    );


    if (state === "warning") {

        element.classList.add(
            "warning"
        );

    }


    if (state === "danger") {

        element.classList.add(
            "danger"
        );

    }

}


/* =========================================================
   LAST UPDATED
   ========================================================= */

function updateLastUpdated() {

    if (!elements.lastUpdated) {
        return;
    }


    elements.lastUpdated.textContent =
        "Just now";

}


/* =========================================================
   LIVE ENVIRONMENT SIMULATION
   ========================================================= */

function startEnvironmentSimulation() {

    /*
        Frontend demonstration only.

        Later:

        Satellite
        Weather API
        Ocean API
        Vessel data
              ↓
        Backend
              ↓
        AI/ML model
              ↓
        This dashboard
    */


    setInterval(() => {

        simulateEnvironmentalChange();

        updateEnvironment();

    }, 15000);

}


/* =========================================================
   SIMULATE ENVIRONMENT CHANGE
   ========================================================= */

function simulateEnvironmentalChange() {

    /*
        Small natural variation.
    */


    /* -------------------------
       Wind
    ------------------------- */

    const windChange =
        (Math.random() - 0.5) * 1.5;


    environmentState.windSpeed =
        Math.max(
            20,
            Math.min(
                45,
                environmentState.windSpeed +
                windChange
            )
        );


    /* -------------------------
       Temperature
    ------------------------- */

    const temperatureChange =
        (Math.random() - 0.5) * 0.2;


    environmentState.temperature +=
        temperatureChange;


    /* -------------------------
       Visibility
    ------------------------- */

    const visibilityChange =
        (Math.random() - 0.5) * 0.3;


    environmentState.visibility =
        Math.max(
            3,
            Math.min(
                12,
                environmentState.visibility +
                visibilityChange
            )
        );


    /* -------------------------
       Sea Ice
    ------------------------- */

    const iceChange =
        Math.random() * 0.3;


    environmentState.iceConcentration =
        Math.min(
            70,
            environmentState.iceConcentration +
            iceChange
        );


    /* -------------------------
       Ice Drift
    ------------------------- */

    const driftChange =
        (Math.random() - 0.5) * 0.08;


    environmentState.iceDrift =
        Math.max(
            0.2,
            Math.min(
                1.5,
                environmentState.iceDrift +
                driftChange
            )
        );


    /* -------------------------
       Wave Height
    ------------------------- */

    const waveChange =
        (Math.random() - 0.5) * 0.15;


    environmentState.waveHeight =
        Math.max(
            1,
            Math.min(
                4.5,
                environmentState.waveHeight +
                waveChange
            )
        );


    environmentState.lastUpdated =
        new Date();

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function initializeNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(
        item => {

            item.addEventListener(
                "click",
                event => {

                    /*
                        Allow actual navigation
                        when href points to a page.
                    */

                    const href =
                        item.getAttribute(
                            "href"
                        );


                    if (
                        !href ||
                        href === "#"
                    ) {

                        event.preventDefault();

                    }


                    /*
                        Active visual state.
                    */

                    navItems.forEach(
                        nav => {

                            nav.classList.remove(
                                "active"
                            );

                        }
                    );


                    item.classList.add(
                        "active"
                    );

                }
            );

        }
    );

}


/* =========================================================
   UTILITY
   ========================================================= */

function capitalize(value) {

    if (!value) {
        return "";
    }


    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );

}


/* =========================================================
   DEMO CONTROL FUNCTIONS
   ========================================================= */

/*
    These functions are useful while testing
    the prototype.

    Example:

        setEnvironmentRisk("low");

        setEnvironmentRisk("moderate");

        setEnvironmentRisk("high");
*/


function setEnvironmentRisk(
    risk
) {

    const validRisks = [

        "low",
        "moderate",
        "high"

    ];


    if (
        !validRisks.includes(risk)
    ) {

        console.warn(
            "Invalid environmental risk:",
            risk
        );

        return;

    }


    environmentState.overallRisk =
        risk;


    if (
        risk === "low"
    ) {

        environmentState.weatherImpact =
            "normal";

        environmentState.iceRisk =
            "low";

        environmentState.oceanImpact =
            "normal";

    }


    else if (
        risk === "moderate"
    ) {

        environmentState.weatherImpact =
            "moderate";

        environmentState.iceRisk =
            "increasing";

        environmentState.oceanImpact =
            "moderate";

    }


    else {

        environmentState.weatherImpact =
            "high";

        environmentState.iceRisk =
            "high";

        environmentState.oceanImpact =
            "high";

    }


    updateEnvironment();

}


/* =========================================================
   END OF ENVIRONMENT JS
   ========================================================= */