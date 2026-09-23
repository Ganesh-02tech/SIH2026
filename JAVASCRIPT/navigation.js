/* =========================================================
   DHRUV NETRA — LIVE NAVIGATION
   navigation.js

   Prototype features:
   - Satellite map
   - India → Antarctica route
   - Route A/B/C/D
   - Moving research vessel
   - 30 km radar
   - Sea-ice zone
   - Moving iceberg
   - Hazard detection
   - AI route insight
   - ETA / fuel impact
   - Weather / ocean updates
   - Timed + event-based AI insights
========================================================= */


/* =========================================================
   GLOBAL STATE
========================================================= */

const navigationState = {

    /* -------------------------
       Voyage
    ------------------------- */

    isRunning: false,

    isPaused: false,

    voyageProgress: 0,

    voyageSpeed: 1,

    simulationTime: 0,

    selectedRoute: "B",


    /* -------------------------
       Vessel
    ------------------------- */

    vesselSpeed: 16.8,

    vesselHeading: 182,

    fuel: 72,

    distanceRemaining: 10097,

    etaHours: 134,


    /* -------------------------
       Radar
    ------------------------- */

    radarRadiusKm: 30,

    radarActive: true,


    /* -------------------------
       Environment
    ------------------------- */

    windSpeed: 32,

    windDirection: "NE",

    waveHeight: 2.4,

    currentSpeed: 1.6,

    currentDirection: "SW",

    seaIceConcentration: 46,


    /* -------------------------
       AI
    ------------------------- */

    aiRisk: "low",

    aiPriority: "normal",

    aiEtaImpact: 0,

    aiFuelImpact: 0,

    aiNextUpdate: 30,

    lastAIUpdate: 0,


    /* -------------------------
       Detection
    ------------------------- */

    icebergDetected: false,

    icebergAlertActive: false,

    icebergDistance: null,

    icebergConflictHours: null,

    icebergTriggered: false,


    /* -------------------------
       Event system
    ------------------------- */

    weatherEventTriggered: false,

    seaIceEventTriggered: false,

    fuelEventTriggered: false,

    routeConflictTriggered: false,


    /* -------------------------
       Animation
    ------------------------- */

    animationFrame: null,

    lastFrameTime: null

};


/* =========================================================
   ROUTE DATA
========================================================= */

/*
    Prototype route coordinates.

    Route B is the initial AI-selected route.

    Destination:
    Bharati Research Station area,
    Antarctica.

    Bharati coordinates are approximately
    69.407° S, 76.195° E.
*/

const routes = {

    A: [

        [19.0760, 72.8777],

        [11.5, 70.0],

        [2.0, 67.5],

        [-9.0, 65.5],

        [-22.0, 67.0],

        [-35.0, 70.0],

        [-48.0, 72.0],

        [-59.0, 73.5],

        [-69.4089, 76.1902]

    ],


    B: [

        [19.0760, 72.8777],

        [12.0, 78.0],

        [2.0, 80.0],

        [-10.0, 82.0],

        [-23.0, 84.0],

        [-36.0, 84.0],

        [-49.0, 82.0],

        [-60.0, 80.0],

        [-69.4089, 76.1902]

    ],


    C: [

        [19.0760, 72.8777],

        [13.0, 82.0],

        [3.0, 87.0],

        [-10.0, 90.0],

        [-24.0, 91.0],

        [-38.0, 90.0],

        [-52.0, 86.0],

        [-62.0, 82.0],

        [-69.4089, 76.1902]

    ],


    D: [

        [19.0760, 72.8777],

        [10.0, 66.0],

        [-1.0, 61.0],

        [-13.0, 61.0],

        [-26.0, 64.0],

        [-40.0, 68.0],

        [-53.0, 71.0],

        [-63.0, 74.0],

        [-69.4089, 76.1902]

    ]

};


/* =========================================================
   ROUTE INFORMATION
========================================================= */

const routeInfo = {

    A: {

        distance: 10020,

        fuelImpact: 8,

        iceRisk: "High",

        icebergRisk: "Moderate",

        etaImpact: 1,

        label: "Base distance"

    },


    B: {

        distance: 10050,

        fuelImpact: 4,

        iceRisk: "Low",

        icebergRisk: "Low",

        etaImpact: 2,

        label: "AI Selected"

    },


    C: {

        distance: 10380,

        fuelImpact: 6,

        iceRisk: "Very Low",

        icebergRisk: "Low",

        etaImpact: 3,

        label: "Lower ice exposure"

    },


    D: {

        distance: 10190,

        fuelImpact: 9,

        iceRisk: "Moderate",

        icebergRisk: "Moderate",

        etaImpact: 2,

        label: "Extended route"

    }

};


/* =========================================================
   DOM REFERENCES
========================================================= */

const DOM = {

    map: document.getElementById("liveMap"),

    mapLoading:
        document.getElementById("mapLoading"),


    lastUpdated:
        document.getElementById("lastUpdated"),


    currentLocation:
        document.getElementById("currentLocation"),


    voyageStatus:
        document.getElementById("voyageStatus"),


    voyageProgress:
        document.getElementById("voyageProgress"),


    vesselSpeed:
        document.getElementById("vesselSpeed"),


    vesselHeading:
        document.getElementById("vesselHeading"),


    vesselFuel:
        document.getElementById("vesselFuel"),


    vesselProgress:
        document.getElementById("vesselProgress"),


    coordinates:
        document.getElementById("coordinates"),


    distanceRemaining:
        document.getElementById("distanceRemaining"),


    estimatedArrival:
        document.getElementById("estimatedArrival"),


    currentHeading:
        document.getElementById("currentHeading"),


    startButton:
        document.getElementById("startVoyageBtn"),


    pauseButton:
        document.getElementById("pauseVoyageBtn"),


    resetButton:
        document.getElementById("resetVoyageBtn"),


    centerButton:
        document.getElementById("centerShipBtn"),


    generateRouteButton:
        document.getElementById("generateRouteBtn"),


    simulationDot:
        document.getElementById("simulationDot"),


    simulationText:
        document.getElementById("simulationText"),


    nextAIUpdate:
        document.getElementById("nextAiUpdate"),


    aiTitle:
        document.getElementById("aiInsightTitle"),


    aiMessage:
        document.getElementById("aiInsightMessage"),


    aiPriority:
        document.getElementById("aiPriority"),


    aiRisk:
        document.getElementById("aiRisk"),


    aiEta:
        document.getElementById("aiEta"),


    aiFuel:
        document.getElementById("aiFuel"),


    routeAI:
        document.getElementById("routeAiInsight"),


    eventFeed:
        document.getElementById("eventFeed")

};


/* =========================================================
   MAP VARIABLES
========================================================= */

let map = null;

let satelliteLayer = null;

let routeLayers = {};

let selectedRouteLayer = null;

let vesselMarker = null;

let radarCircle = null;

let radarVisual = null;

let seaIceLayer = null;

let icebergMarker = null;

let icebergTrail = null;

let destinationMarker = null;

let indiaMarker = null;


/* =========================================================
   MAP INITIALIZATION
========================================================= */

function initializeMap() {

    if (
        typeof L === "undefined"
    ) {

        console.error(
            "Leaflet could not be loaded."
        );

        showMapError(
            "Map library could not be loaded. Check the Leaflet CDN link in navigation.html."
        );

        return;

    }


    if (!DOM.map) {

        console.error(
            "Map container not found."
        );

        return;

    }


    /*
        Initial view:
        India → Antarctica
    */

    map = L.map(
        "liveMap",
        {

            zoomControl: true,

            attributionControl: true,

            minZoom: 2,

            maxZoom: 12

        }
    );


    /*
        Satellite imagery.

        Esri World Imagery is used as the
        prototype satellite basemap.
    */

    satelliteLayer = L.tileLayer(

        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",

        {

            maxZoom: 19,

            attribution:
                "Imagery © Esri, Maxar, Earthstar Geographics, and the GIS User Community"

        }

    );


    satelliteLayer.addTo(map);


    /*
        Fit the complete selected route.
    */

    const routeBounds =
        L.latLngBounds(
            routes[navigationState.selectedRoute]
        );


    map.fitBounds(
        routeBounds,
        {
            padding: [35, 35]
        }
    );


    /*
        Create routes.
    */

    createRouteLayers();


    /*
        Create vessel.
    */

    createVessel();


    /*
        Create radar.
    */

    createRadar();


    /*
        Create sea ice.
    */

    createSeaIceLayer();


    /*
        Destination.
    */

    createDestination();


    /*
        India marker.
    */

    createIndiaMarker();


    /*
        Hide loading screen.
    */

    setTimeout(
        () => {

            if (DOM.mapLoading) {

                DOM.mapLoading.classList.add(
                    "hidden"
                );

            }

        },
        1200
    );

}


/* =========================================================
   CREATE ROUTES
========================================================= */

function createRouteLayers() {

    Object.keys(routes).forEach(
        routeName => {

            const route =
                routes[routeName];


            routeLayers[routeName] =
                L.polyline(

                    route,

                    {

                        className:
                            routeName === navigationState.selectedRoute
                                ? "route-line selected"
                                : "route-line alternative",

                        color:
                            routeName === navigationState.selectedRoute
                                ? "#63caff"
                                : "#9db6c6",

                        weight:
                            routeName === navigationState.selectedRoute
                                ? 4
                                : 2,

                        opacity:
                            routeName === navigationState.selectedRoute
                                ? 0.9
                                : 0.42,

                        dashArray:
                            routeName === navigationState.selectedRoute
                                ? null
                                : "8 7"

                    }

                );


            routeLayers[routeName]
                .addTo(map);


            routeLayers[routeName]
                .bindTooltip(

                    `Route ${routeName}`,

                    {

                        sticky: true,

                        direction: "top"

                    }

                );


            routeLayers[routeName].on(
                "click",
                () => {

                    selectRoute(
                        routeName,
                        true
                    );

                }
            );

        }
    );


    selectedRouteLayer =
        routeLayers[
            navigationState.selectedRoute
        ];

}


/* =========================================================
   CREATE VESSEL
========================================================= */

function createVessel() {

    const start =
        routes[
            navigationState.selectedRoute
        ][0];


    const vesselIcon =
        L.divIcon({

            className:
                "custom-vessel-icon",

            html: `

                <div class="vessel-marker">

                    <div class="vessel-pulse"></div>

                    <div class="vessel-body">

                        <div class="vessel-light"></div>

                        <div class="vessel-bridge"></div>

                    </div>

                </div>

            `,

            iconSize:
                [42, 42],

            iconAnchor:
                [21, 21]

        });


    vesselMarker =
        L.marker(

            start,

            {

                icon: vesselIcon,

                zIndexOffset: 1000

            }

        )
        .addTo(map);


    vesselMarker.bindTooltip(

        "ARV-01 • Research Vessel",

        {

            direction: "top",

            offset: [0, -18]

        }

    );


    updateVesselPosition(
        start
    );

}


/* =========================================================
   CREATE RADAR
========================================================= */

function createRadar() {

    if (!map || !vesselMarker) {
        return;
    }


    const position =
        vesselMarker.getLatLng();


    /*
        Actual geographical radar radius.
        30 km = 30,000 meters.
    */

    radarCircle =
        L.circle(

            position,

            {

                radius:
                    navigationState.radarRadiusKm *
                    1000,

                color:
                    "#67d9ff",

                weight:
                    1.5,

                opacity:
                    0.75,

                fillColor:
                    "#67d9ff",

                fillOpacity:
                    0.035,

                interactive:
                    false

            }

        ).addTo(map);


    /*
        Visual radar sweep.
        This is a UI representation that remains
        visible while the geographical circle
        represents the actual 30 km range.
    */

    radarVisual =
        L.marker(

            position,

            {

                icon:
                    L.divIcon({

                        className:
                            "radar-visual-icon",

                        html: `

                            <div
                                class="radar-visual"
                                style="
                                    width:160px;
                                    height:160px;
                                    border-radius:50%;
                                    position:relative;
                                    border:1px solid rgba(103,217,255,.28);
                                    background:
                                      conic-gradient(
                                        from 0deg,
                                        transparent 0deg,
                                        rgba(103,217,255,.16) 22deg,
                                        transparent 48deg
                                      );
                                    animation:
                                      radarSweep 3s linear infinite;
                                "
                            ></div>

                        `,

                        iconSize:
                            [160, 160],

                        iconAnchor:
                            [80, 80]

                    }),

                interactive:
                    false,

                zIndexOffset:
                    -100

            }

        ).addTo(map);

}


/* =========================================================
   UPDATE RADAR POSITION
========================================================= */

function updateRadarPosition(
    position
) {

    if (!position) {
        return;
    }


    if (radarCircle) {

        radarCircle.setLatLng(
            position
        );

    }


    if (radarVisual) {

        radarVisual.setLatLng(
            position
        );

    }

}


/* =========================================================
   CREATE SEA ICE
========================================================= */

function createSeaIceLayer() {

    /*
        Prototype sea-ice polygons.

        These are visual simulation zones.
        Later they can be replaced with
        real sea-ice raster/vector data.
    */


    const iceZones = [

        {

            coords: [

                [-55, 77],
                [-55, 87],
                [-67, 88],
                [-68, 78]

            ],

            concentration: 55

        },

        {

            coords: [

                [-60, 70],
                [-60, 80],
                [-69, 82],
                [-69, 72]

            ],

            concentration: 42

        },

        {

            coords: [

                [-50, 85],
                [-50, 95],
                [-65, 95],
                [-67, 86]

            ],

            concentration: 62

        }

    ];


    const group =
        L.layerGroup();


    iceZones.forEach(
        zone => {

            const polygon =
                L.polygon(

                    zone.coords,

                    {

                        className:
                            "sea-ice-zone",

                        color:
                            zone.concentration >= 60
                                ? "#7ee8f4"
                                : "#69d9e9",

                        weight:
                            1,

                        opacity:
                            0.55,

                        fillColor:
                            zone.concentration >= 60
                                ? "#51bed7"
                                : "#70ddeb",

                        fillOpacity:
                            zone.concentration >= 60
                                ? 0.30
                                : 0.18

                    }

                );


            polygon.bindTooltip(

                `Sea-ice concentration: ${zone.concentration}%`,

                {

                    sticky: true

                }

            );


            polygon.addTo(group);

        }
    );


    group.addTo(map);


    seaIceLayer = group;

}


/* =========================================================
   CREATE DESTINATION
========================================================= */

function createDestination() {

    const destination =
        routes.B[
            routes.B.length - 1
        ];


    destinationMarker =
        L.circleMarker(

            destination,

            {

                radius:
                    6,

                color:
                    "#ffffff",

                weight:
                    2,

                fillColor:
                    "#42b9ff",

                fillOpacity:
                    0.95

            }

        ).addTo(map);


    destinationMarker.bindTooltip(

        "Bharati • Antarctica",

        {

            direction: "top"

        }

    );

}


/* =========================================================
   CREATE INDIA MARKER
========================================================= */

function createIndiaMarker() {

    const start =
        routes.B[0];


    indiaMarker =
        L.circleMarker(

            start,

            {

                radius:
                    6,

                color:
                    "#ffffff",

                weight:
                    2,

                fillColor:
                    "#27d39b",

                fillOpacity:
                    0.95

            }

        ).addTo(map);


    indiaMarker.bindTooltip(

        "India Port",

        {

            direction: "top"

        }

    );

}


/* =========================================================
   VESSEL POSITION
========================================================= */

function updateVesselPosition(
    position
) {

    if (!vesselMarker) {
        return;
    }


    vesselMarker.setLatLng(
        position
    );


    updateRadarPosition(
        position
    );


    updateLocationText(
        position
    );


    updateCoordinates(
        position
    );

}


/* =========================================================
   GET CURRENT ROUTE
========================================================= */

function getCurrentRoute() {

    return routes[
        navigationState.selectedRoute
    ];

}


/* =========================================================
   ROUTE POSITION INTERPOLATION
========================================================= */

function getPositionOnRoute(
    progress
) {

    const route =
        getCurrentRoute();


    if (!route || route.length < 2) {

        return route
            ? route[0]
            : [0, 0];

    }


    const clamped =
        Math.max(
            0,
            Math.min(
                1,
                progress
            )
        );


    /*
        Approximate segment lengths.
    */

    const lengths = [];

    let totalLength = 0;


    for (
        let i = 0;
        i < route.length - 1;
        i++
    ) {

        const length =
            haversineKm(
                route[i],
                route[i + 1]
            );


        lengths.push(
            length
        );


        totalLength +=
            length;

    }


    const targetDistance =
        totalLength *
        clamped;


    let travelled = 0;


    for (
        let i = 0;
        i < lengths.length;
        i++
    ) {

        const segmentLength =
            lengths[i];


        if (
            travelled +
            segmentLength >=
            targetDistance
        ) {

            const localProgress =
                (
                    targetDistance -
                    travelled
                ) /
                segmentLength;


            return interpolatePoint(

                route[i],

                route[i + 1],

                localProgress

            );

        }


        travelled +=
            segmentLength;

    }


    return route[
        route.length - 1
    ];

}


/* =========================================================
   INTERPOLATE POINT
========================================================= */

function interpolatePoint(
    a,
    b,
    t
) {

    return [

        a[0] +
        (b[0] - a[0]) *
        t,

        a[1] +
        (b[1] - a[1]) *
        t

    ];

}


/* =========================================================
   HAVERSINE
========================================================= */

function haversineKm(
    a,
    b
) {

    const R =
        6371;


    const lat1 =
        toRadians(a[0]);

    const lat2 =
        toRadians(b[0]);


    const dLat =
        toRadians(
            b[0] - a[0]
        );

    const dLon =
        toRadians(
            b[1] - a[1]
        );


    const x =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

        Math.cos(lat1) *
        Math.cos(lat2) *

        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);


    return (
        2 *
        R *
        Math.asin(
            Math.sqrt(x)
        )
    );

}


/* =========================================================
   RADIANS
========================================================= */

function toRadians(
    degrees
) {

    return degrees *
        Math.PI /
        180;

}


/* =========================================================
   BEARING
========================================================= */

function calculateBearing(
    a,
    b
) {

    const lat1 =
        toRadians(a[0]);

    const lat2 =
        toRadians(b[0]);

    const dLon =
        toRadians(
            b[1] - a[1]
        );


    const y =
        Math.sin(dLon) *
        Math.cos(lat2);


    const x =
        Math.cos(lat1) *
        Math.sin(lat2) -

        Math.sin(lat1) *
        Math.cos(lat2) *
        Math.cos(dLon);


    const bearing =
        Math.atan2(
            y,
            x
        );


    return (
        (bearing *
            180 /
            Math.PI +
            360) %
        360
    );

}


/* =========================================================
   UPDATE LOCATION TEXT
========================================================= */

function updateLocationText(
    position
) {

    if (!DOM.currentLocation) {
        return;
    }


    const lat =
        position[0];

    const lng =
        position[1];


    let location = "Indian Ocean";


    if (lat < -50) {

        location =
            "Southern Ocean";

    }

    else if (lat < -30) {

        location =
            "South Indian Ocean";

    }

    else if (lat > 5) {

        location =
            "Indian Ocean";

    }


    DOM.currentLocation.textContent =
        location;

}


/* =========================================================
   UPDATE COORDINATES
========================================================= */

function updateCoordinates(
    position
) {

    if (!DOM.coordinates) {
        return;
    }


    const lat =
        Math.abs(
            position[0]
        ).toFixed(4);


    const lng =
        Math.abs(
            position[1]
        ).toFixed(4);


    const latDirection =
        position[0] >= 0
            ? "N"
            : "S";


    const lngDirection =
        position[1] >= 0
            ? "E"
            : "W";


    DOM.coordinates.textContent =
        `${lat}° ${latDirection}, ${lng}° ${lngDirection}`;

}


/* =========================================================
   UPDATE VESSEL TELEMETRY
========================================================= */

function updateVesselTelemetry(
    position
) {

    const route =
        getCurrentRoute();


    const nextPoint =
        getNextRoutePoint(
            navigationState.voyageProgress
        );


    const bearing =
        calculateBearing(
            position,
            nextPoint
        );


    navigationState.vesselHeading =
        bearing;


    /*
        Small realistic speed variations.
    */

    navigationState.vesselSpeed =
        16.2 +
        Math.sin(
            navigationState.simulationTime /
            7000
        ) *
        1.1;


    /*
        Environmental impact.
    */

    if (
        navigationState.seaIceConcentration >
        55
    ) {

        navigationState.vesselSpeed -=
            1.5;

    }


    if (
        navigationState.windSpeed >
        38
    ) {

        navigationState.vesselSpeed -=
            1.0;

    }


    navigationState.vesselSpeed =
        Math.max(
            10,
            navigationState.vesselSpeed
        );


    /*
        Fuel slowly decreases.
    */

    if (
        navigationState.isRunning &&
        !navigationState.isPaused
    ) {

        navigationState.fuel -=
            0.0014;

    }


    navigationState.fuel =
        Math.max(
            0,
            navigationState.fuel
        );


    /*
        Remaining distance.
    */

    const totalDistance =
        routeDistance(
            route
        );


    navigationState.distanceRemaining =
        totalDistance *
        (
            1 -
            navigationState.voyageProgress
        );


    /*
        ETA.
    */

    const speed =
        navigationState.vesselSpeed;


    navigationState.etaHours =
        navigationState.distanceRemaining /
        (
            speed *
            1.852
        );


    updateTelemetryDOM();

}


/* =========================================================
   GET NEXT ROUTE POINT
========================================================= */

function getNextRoutePoint(
    progress
) {

    const route =
        getCurrentRoute();


    const index =
        Math.min(

            route.length - 1,

            Math.floor(
                progress *
                (
                    route.length - 1
                )
            ) + 1

        );


    return route[index];

}


/* =========================================================
   ROUTE DISTANCE
========================================================= */

function routeDistance(
    route
) {

    let total = 0;


    for (
        let i = 0;
        i < route.length - 1;
        i++
    ) {

        total +=
            haversineKm(
                route[i],
                route[i + 1]
            );

    }


    return total;

}


/* =========================================================
   TELEMETRY DOM
========================================================= */

function updateTelemetryDOM() {

    if (DOM.vesselSpeed) {

        DOM.vesselSpeed.textContent =
            `${navigationState.vesselSpeed.toFixed(1)} kn`;

    }


    if (DOM.vesselHeading) {

        DOM.vesselHeading.textContent =
            `${Math.round(
                navigationState.vesselHeading
            )}°`;

    }


    if (DOM.vesselFuel) {

        DOM.vesselFuel.textContent =
            `${Math.round(
                navigationState.fuel
            )}%`;

    }


    if (DOM.vesselProgress) {

        DOM.vesselProgress.textContent =
            `${Math.round(
                navigationState.voyageProgress *
                100
            )}%`;

    }


    if (DOM.vesselProgress) {

        DOM.voyageProgress.style.width =
            `${navigationState.voyageProgress * 100}%`;

    }


    if (DOM.distanceRemaining) {

        DOM.distanceRemaining.textContent =
            `${Math.round(
                navigationState.distanceRemaining
            ).toLocaleString()} km`;

    }


    if (DOM.estimatedArrival) {

        DOM.estimatedArrival.textContent =
            formatETA(
                navigationState.etaHours
            );

    }


    if (DOM.currentHeading) {

        DOM.currentHeading.textContent =
            `${Math.round(
                navigationState.vesselHeading
            )}°`;

    }

}


/* =========================================================
   ETA FORMAT
========================================================= */

function formatETA(
    hours
) {

    if (
        !isFinite(hours)
    ) {

        return "--";

    }


    const totalHours =
        Math.max(
            0,
            Math.round(hours)
        );


    const days =
        Math.floor(
            totalHours / 24
        );


    const remainingHours =
        totalHours %
        24;


    if (
        days === 0
    ) {

        return `${remainingHours}h`;

    }


    return `${days}d ${remainingHours}h`;

}


/* =========================================================
   START VOYAGE
========================================================= */

function startVoyage() {

    if (
        navigationState.voyageProgress >=
        1
    ) {

        resetVoyage();

    }


    navigationState.isRunning =
        true;


    navigationState.isPaused =
        false;


    if (DOM.startButton) {

        DOM.startButton.disabled =
            true;

        DOM.startButton.style.opacity =
            "0.45";

    }


    if (DOM.pauseButton) {

        DOM.pauseButton.disabled =
            false;

    }


    if (DOM.voyageStatus) {

        DOM.voyageStatus.textContent =
            "Voyage In Progress";

    }


    if (DOM.simulationDot) {

        DOM.simulationDot.classList.add(
            "active"
        );

    }


    if (DOM.simulationText) {

        DOM.simulationText.textContent =
            "Live voyage simulation running";

    }


    addEvent(

        "normal",

        "Voyage started",

        `Route ${navigationState.selectedRoute} is active. Vessel is proceeding toward Antarctica.`,

        "Now",

        "navigation"

    );


    setAIInsight(

        "Voyage monitoring active",

        "The vessel is now moving along the selected route. Environmental, radar and route conditions are being evaluated continuously.",

        "NORMAL",

        "low",

        "On Schedule",

        "Normal"

    );


    /*
        Zoom into vessel after start
        so the 30 km radar becomes
        visually meaningful.
    */

    if (vesselMarker) {

        const position =
            vesselMarker.getLatLng();


        map.flyTo(

            position,

            5.5,

            {

                duration:
                    1.8

            }

        );

    }


    navigationState.lastFrameTime =
        performance.now();


    requestAnimationFrame(
        animateVoyage
    );

}


/* =========================================================
   PAUSE VOYAGE
========================================================= */

function pauseVoyage() {

    if (
        !navigationState.isRunning
    ) {

        return;

    }


    navigationState.isPaused =
        !navigationState.isPaused;


    if (
        navigationState.isPaused
    ) {

        if (DOM.pauseButton) {

            DOM.pauseButton.innerHTML = `

                <i data-lucide="play"></i>

                <span>
                    Resume
                </span>

            `;

        }


        if (DOM.voyageStatus) {

            DOM.voyageStatus.textContent =
                "Voyage Paused";

        }


        if (DOM.simulationText) {

            DOM.simulationText.textContent =
                "Voyage simulation paused";

        }


        addEvent(

            "warning",

            "Voyage paused",

            "Vessel movement has been paused for simulation review.",

            "Now",

            "pause"

        );

    }

    else {

        if (DOM.pauseButton) {

            DOM.pauseButton.innerHTML = `

                <i data-lucide="pause"></i>

                <span>
                    Pause
                </span>

            `;

        }


        if (DOM.voyageStatus) {

            DOM.voyageStatus.textContent =
                "Voyage In Progress";

        }


        if (DOM.simulationText) {

            DOM.simulationText.textContent =
                "Live voyage simulation running";

        }


        navigationState.lastFrameTime =
            performance.now();


        requestAnimationFrame(
            animateVoyage
        );

    }


    refreshIcons();

}


/* =========================================================
   RESET VOYAGE
========================================================= */

function resetVoyage() {

    navigationState.isRunning =
        false;

    navigationState.isPaused =
        false;

    navigationState.voyageProgress =
        0;

    navigationState.simulationTime =
        0;

    navigationState.fuel =
        72;

    navigationState.icebergDetected =
        false;

    navigationState.icebergAlertActive =
        false;

    navigationState.icebergTriggered =
        false;

    navigationState.weatherEventTriggered =
        false;

    navigationState.seaIceEventTriggered =
        false;

    navigationState.fuelEventTriggered =
        false;

    navigationState.routeConflictTriggered =
        false;


    /*
        Remove iceberg.
    */

    removeIceberg();


    /*
        Restore environment.
    */

    navigationState.windSpeed =
        32;

    navigationState.waveHeight =
        2.4;

    navigationState.currentSpeed =
        1.6;

    navigationState.seaIceConcentration =
        46;


    /*
        Restore vessel position.
    */

    const start =
        getCurrentRoute()[0];


    updateVesselPosition(
        start
    );


    updateVesselTelemetry(
        start
    );


    if (DOM.startButton) {

        DOM.startButton.disabled =
            false;

        DOM.startButton.style.opacity =
            "1";

    }


    if (DOM.pauseButton) {

        DOM.pauseButton.disabled =
            true;

        DOM.pauseButton.innerHTML = `

            <i data-lucide="pause"></i>

            <span>
                Pause
            </span>

        `;

    }


    if (DOM.voyageStatus) {

        DOM.voyageStatus.textContent =
            "Ready to Start";

    }


    if (DOM.simulationDot) {

        DOM.simulationDot.classList.remove(
            "active"
        );

    }


    if (DOM.simulationText) {

        DOM.simulationText.textContent =
            "Voyage simulation ready";

    }


    setAIInsight(

        "Route Monitoring",

        "Current environmental conditions are being monitored continuously along the selected route.",

        "NORMAL",

        "low",

        "On Schedule",

        "Normal"

    );


    if (map) {

        map.fitBounds(

            L.latLngBounds(
                getCurrentRoute()
            ),

            {
                padding:
                    [35, 35]
            }

        );

    }


    addEvent(

        "normal",

        "Voyage reset",

        "Simulation returned to the initial departure state.",

        "Now",

        "rotate-ccw"

    );


    refreshIcons();

}


/* =========================================================
   ANIMATE VOYAGE
========================================================= */

function animateVoyage(
    timestamp
) {

    if (
        !navigationState.isRunning ||
        navigationState.isPaused
    ) {

        return;

    }


    if (
        !navigationState.lastFrameTime
    ) {

        navigationState.lastFrameTime =
            timestamp;

    }


    const delta =
        timestamp -
        navigationState.lastFrameTime;


    navigationState.lastFrameTime =
        timestamp;


    /*
        Simulation speed.

        This is intentionally accelerated
        for prototype demonstration.
    */

    const progressPerSecond =
        1 /
        120;


    navigationState.voyageProgress +=
        (
            delta / 1000
        ) *
        progressPerSecond;


    navigationState.simulationTime +=
        delta;


    /*
        End of voyage.
    */

    if (
        navigationState.voyageProgress >=
        1
    ) {

        navigationState.voyageProgress =
            1;


        finishVoyage();

        return;

    }


    const position =
        getPositionOnRoute(
            navigationState.voyageProgress
        );


    updateVesselPosition(
        position
    );


    updateVesselTelemetry(
        position
    );


    updateEnvironmentalSimulation();


    checkVoyageEvents();


    updateAIClock(
        delta
    );


    updateIcebergMovement();


    /*
        Follow vessel gently.
    */

    if (
        navigationState.voyageProgress >
            0.03 &&
        navigationState.voyageProgress <
            0.98
    ) {

        const currentCenter =
            map.getCenter();


        const distanceToCenter =
            haversineKm(

                [
                    currentCenter.lat,
                    currentCenter.lng
                ],

                position

            );


        if (
            distanceToCenter >
            80
        ) {

            map.panTo(
                position,
                {
                    animate:
                        true,

                    duration:
                        0.7

                }
            );

        }

    }


    navigationState.animationFrame =
        requestAnimationFrame(
            animateVoyage
        );

}


/* =========================================================
   FINISH VOYAGE
========================================================= */

function finishVoyage() {

    navigationState.isRunning =
        false;

    navigationState.isPaused =
        false;


    if (DOM.voyageStatus) {

        DOM.voyageStatus.textContent =
            "Arrived at Antarctica";

    }


    if (DOM.simulationDot) {

        DOM.simulationDot.classList.add(
            "active"
        );

    }


    if (DOM.simulationText) {

        DOM.simulationText.textContent =
            "Voyage completed";

    }


    if (DOM.startButton) {

        DOM.startButton.disabled =
            false;

        DOM.startButton.style.opacity =
            "1";

    }


    if (DOM.pauseButton) {

        DOM.pauseButton.disabled =
            true;

    }


    setAIInsight(

        "Voyage completed",

        "The vessel has reached the Antarctic destination. Final route, fuel and environmental conditions can now be reviewed.",

        "NORMAL",

        "low",

        "Arrived",

        `${Math.round(
            navigationState.fuel
        )}% remaining`

    );


    addEvent(

        "normal",

        "Antarctic destination reached",

        "Vessel has completed the selected voyage route.",

        "Completed",

        "flag"

    );


    refreshIcons();

}


/* =========================================================
   ENVIRONMENT SIMULATION
========================================================= */

function updateEnvironmentalSimulation() {

    /*
        Small changes only.
    */

    navigationState.windSpeed +=
        (
            Math.random() -
            0.5
        ) *
        0.18;


    navigationState.windSpeed =
        clamp(
            navigationState.windSpeed,
            26,
            44
        );


    navigationState.waveHeight +=
        (
            Math.random() -
            0.5
        ) *
        0.025;


    navigationState.waveHeight =
        clamp(
            navigationState.waveHeight,
            1.8,
            4.2
        );


    navigationState.currentSpeed +=
        (
            Math.random() -
            0.5
        ) *
        0.015;


    navigationState.currentSpeed =
        clamp(
            navigationState.currentSpeed,
            1.0,
            2.4
        );


    /*
        Sea ice gradually becomes
        more important as the vessel
        approaches Antarctica.
    */

    if (
        navigationState.voyageProgress >
        0.48
    ) {

        navigationState.seaIceConcentration +=
            0.002;

    }


    navigationState.seaIceConcentration =
        clamp(
            navigationState.seaIceConcentration,
            42,
            68
        );

}


/* =========================================================
   CHECK VOYAGE EVENTS
========================================================= */

function checkVoyageEvents() {

    const progress =
        navigationState.voyageProgress;


    /*
        WEATHER EVENT
    */

    if (
        progress > 0.20 &&
        !navigationState.weatherEventTriggered
    ) {

        navigationState.weatherEventTriggered =
            true;


        navigationState.windSpeed =
            37;


        navigationState.aiEtaImpact +=
            1;


        setAIInsight(

            "Weather conditions changing",

            "Headwinds are increasing along the selected route. Vessel speed may temporarily reduce as the system enters the changing weather zone.",

            "ATTENTION",

            "moderate",

            "+1 hr",

            "+2%"

        );


        addEvent(

            "warning",

            "Wind conditions changed",

            "Headwind intensity increased along the selected route.",

            "Now",

            "wind"

        );

    }


    /*
        SEA ICE EVENT
    */

    if (
        progress > 0.38 &&
        !navigationState.seaIceEventTriggered
    ) {

        navigationState.seaIceEventTriggered =
            true;


        navigationState.seaIceConcentration =
            53;


        setAIInsight(

            "Sea-ice concentration increasing",

            "Sea-ice concentration ahead of the vessel is increasing. The AI predicts moderate additional resistance over the next several hours.",

            "ATTENTION",

            "moderate",

            "+1.5 hrs",

            "+3%"

        );


        addEvent(

            "warning",

            "Sea-ice increase detected",

            "Higher sea-ice concentration is predicted ahead of Route B.",

            "Now",

            "snowflake"

        );

    }


    /*
        ICEBERG EVENT
    */

    if (
        progress > 0.49 &&
        !navigationState.icebergTriggered
    ) {

        navigationState.icebergTriggered =
            true;


        spawnIceberg();


    }


    /*
        FUEL EVENT
    */

    if (
        progress > 0.62 &&
        !navigationState.fuelEventTriggered
    ) {

        navigationState.fuelEventTriggered =
            true;


        navigationState.aiFuelImpact =
            4;


        setAIInsight(

            "Fuel forecast updated",

            "Environmental resistance is increasing fuel demand. Current reserves remain within the operational safety range.",

            "UPDATE",

            "moderate",

            "+2 hrs",

            "+4%"

        );


        addEvent(

            "warning",

            "Fuel forecast updated",

            "Predicted fuel consumption increased due to environmental resistance.",

            "Now",

            "fuel"

        );

    }

}


/* =========================================================
   SPAWN ICEBERG
========================================================= */

function spawnIceberg() {

    if (!map || !vesselMarker) {
        return;
    }


    const vesselPosition =
        vesselMarker.getLatLng();


    const route =
        getCurrentRoute();


    const nextPoint =
        getNextRoutePoint(
            navigationState.voyageProgress
        );


    const bearing =
        calculateBearing(

            [
                vesselPosition.lat,
                vesselPosition.lng
            ],

            nextPoint

        );


    /*
        Put iceberg initially
        approximately 38 km ahead.
    */

    const icebergPosition =
        destinationPoint(

            [
                vesselPosition.lat,
                vesselPosition.lng
            ],

            bearing,

            38

        );


    navigationState.icebergDistance =
        38;


    icebergMarker =
        createIcebergMarker(
            icebergPosition
        );


    /*
        Predicted trajectory toward
        the selected route.
    */

    const trailStart =
        icebergPosition;


    const trailEnd =
        getPositionOnRoute(

            Math.min(
                1,
                navigationState.voyageProgress +
                0.07
            )

        );


    icebergTrail =
        L.polyline(

            [

                trailStart,

                [

                    (
                        trailStart[0] +
                        trailEnd[0]
                    ) / 2,

                    (
                        trailStart[1] +
                        trailEnd[1]
                    ) / 2

                ],

                trailEnd

            ],

            {

                className:
                    "iceberg-trail",

                color:
                    "#ff5e6c",

                weight:
                    2,

                dashArray:
                    "5 6",

                opacity:
                    0.75

            }

        ).addTo(map);


    addEvent(

        "danger",

        "Iceberg detected",

        "A moving iceberg has entered the predicted approach corridor ahead of the vessel.",

        "Now",

        "triangle-alert"

    );


    setAIInsight(

        "Potential iceberg route conflict",

        "An iceberg detected approximately 38 km ahead is moving toward the selected route. Wind and current conditions indicate a possible route intersection within the next few hours.",

        "HIGH PRIORITY",

        "high",

        "+2.5 hrs",

        "+4%"

    );


    navigationState.icebergDetected =
        true;


    navigationState.icebergAlertActive =
        true;


    /*
        Zoom in so the detection
        is clearly visible.
    */

    map.flyTo(

        vesselPosition,

        6.2,

        {

            duration:
                1.4

        }

    );

}


/* =========================================================
   CREATE ICEBERG MARKER
========================================================= */

function createIcebergMarker(
    position
) {

    const icon =
        L.divIcon({

            className:
                "custom-iceberg-icon",

            html: `

                <div class="iceberg-marker">

                    <div class="iceberg-pulse"></div>

                    <div class="iceberg-symbol"></div>

                </div>

            `,

            iconSize:
                [34, 34],

            iconAnchor:
                [17, 17]

        });


    const marker =
        L.marker(

            position,

            {

                icon,

                zIndexOffset:
                    900

            }

        ).addTo(map);


    marker.bindTooltip(

        "Iceberg detected • Monitoring movement",

        {

            direction: "top"

        }

    );


    marker.on(
        "click",
        () => {

            showIcebergInsight();

        }
    );


    return marker;

}


/* =========================================================
   UPDATE ICEBERG MOVEMENT
========================================================= */

function updateIcebergMovement() {

    if (
        !icebergMarker ||
        !navigationState.icebergDetected
    ) {

        return;

    }


    /*
        Move iceberg gradually toward
        a future route intersection.

        This is a prototype simulation.
    */

    const current =
        icebergMarker.getLatLng();


    const target =
        getPositionOnRoute(

            Math.min(

                1,

                navigationState.voyageProgress +
                0.045

            )

        );


    const targetPoint = {

        lat:
            target[0],

        lng:
            target[1]

    };


    const factor =
        0.0018;


    const newPosition = [

        current.lat +
        (
            targetPoint.lat -
            current.lat
        ) *
        factor,

        current.lng +
        (
            targetPoint.lng -
            current.lng
        ) *
        factor

    ];


    icebergMarker.setLatLng(
        newPosition
    );


    /*
        Update trail.
    */

    if (icebergTrail) {

        const routeTarget =
            getPositionOnRoute(

                Math.min(

                    1,

                    navigationState.voyageProgress +
                    0.055

                )

            );


        icebergTrail.setLatLngs(

            [

                [
                    newPosition[0],
                    newPosition[1]
                ],

                [

                    (
                        newPosition[0] +
                        routeTarget[0]
                    ) / 2,

                    (
                        newPosition[1] +
                        routeTarget[1]
                    ) / 2

                ],

                routeTarget

            ]

        );

    }


    /*
        Distance from vessel.
    */

    const vessel =
        vesselMarker.getLatLng();


    const distance =
        haversineKm(

            [
                vessel.lat,
                vessel.lng
            ],

            newPosition

        );


    navigationState.icebergDistance =
        distance;


    /*
        Entered radar.
    */

    if (
        distance <=
        navigationState.radarRadiusKm &&
        !navigationState.icebergAlertActive
    ) {

        triggerRadarDetection(
            distance
        );

    }


    /*
        Critical route conflict.
    */

    if (
        distance <= 18 &&
        !navigationState.routeConflictTriggered
    ) {

        navigationState.routeConflictTriggered =
            true;


        const icebergElement =
            document.querySelector(
                ".iceberg-marker"
            );


        if (icebergElement) {

            icebergElement.classList.add(
                "danger"
            );

        }


        setAIInsight(

            "Critical iceberg warning",

            "The detected iceberg is now inside the 30 km radar range and its projected movement may intersect the current route. Alternative route evaluation is recommended.",

            "CRITICAL",

            "high",

            "+3 hrs",

            "+6%"

        );


        addEvent(

            "danger",

            "Potential route conflict",

            "Iceberg trajectory is approaching the selected route corridor.",

            "Now",

            "triangle-alert"

        );

    }

}


/* =========================================================
   RADAR DETECTION
========================================================= */

function triggerRadarDetection(
    distance
) {

    navigationState.icebergAlertActive =
        true;


    const icebergElement =
        document.querySelector(
            ".iceberg-marker"
        );


    if (icebergElement) {

        icebergElement.classList.add(
            "danger"
        );

    }


    setAIInsight(

        "Iceberg detected within radar range",

        `The vessel radar has detected a moving iceberg approximately ${distance.toFixed(1)} km away. AI analysis indicates that its projected movement may bring it closer to Route ${navigationState.selectedRoute}.`,

        "HIGH PRIORITY",

        "high",

        "+2.5 hrs",

        "+4%"

    );


    addEvent(

        "danger",

        "Radar detection confirmed",

        `Iceberg detected at ${distance.toFixed(1)} km from vessel.`,

        "Now",

        "radio"

    );

}


/* =========================================================
   ICEBERG INSIGHT
========================================================= */

function showIcebergInsight() {

    const distance =
        navigationState.icebergDistance
            ? navigationState.icebergDistance.toFixed(1)
            : "--";


    setAIInsight(

        "Iceberg movement analysis",

        `The iceberg is currently ${distance} km from the vessel. Current and wind conditions indicate continued movement toward the projected route corridor.`,

        "HIGH PRIORITY",

        "high",

        "+3 hrs",

        "+5%"

    );

}


/* =========================================================
   REMOVE ICEBERG
========================================================= */

function removeIceberg() {

    if (icebergMarker) {

        map.removeLayer(
            icebergMarker
        );

        icebergMarker =
            null;

    }


    if (icebergTrail) {

        map.removeLayer(
            icebergTrail
        );

        icebergTrail =
            null;

    }

}


/* =========================================================
   DESTINATION POINT
========================================================= */

function destinationPoint(
    start,
    bearingDegrees,
    distanceKm
) {

    const R =
        6371;


    const bearing =
        toRadians(
            bearingDegrees
        );


    const lat1 =
        toRadians(
            start[0]
        );

    const lon1 =
        toRadians(
            start[1]
        );


    const angularDistance =
        distanceKm /
        R;


    const lat2 =
        Math.asin(

            Math.sin(lat1) *
            Math.cos(angularDistance) +

            Math.cos(lat1) *
            Math.sin(angularDistance) *
            Math.cos(bearing)

        );


    const lon2 =
        lon1 +

        Math.atan2(

            Math.sin(bearing) *
            Math.sin(angularDistance) *
            Math.cos(lat1),

            Math.cos(angularDistance) -
            Math.sin(lat1) *
            Math.sin(lat2)

        );


    return [

        lat2 *
        180 /
        Math.PI,

        (
            lon2 *
            180 /
            Math.PI +
            540
        ) %
        360 -
        180

    ];

}


/* =========================================================
   AI CLOCK
========================================================= */

function updateAIClock(
    delta
) {

    navigationState.aiNextUpdate -=
        delta / 1000;


    if (
        navigationState.aiNextUpdate <=
        0
    ) {

        navigationState.aiNextUpdate =
            45;


        runPeriodicAIAnalysis();

    }


    if (DOM.nextAIUpdate) {

        DOM.nextAIUpdate.textContent =
            `00:${Math.max(
                0,
                Math.ceil(
                    navigationState.aiNextUpdate
                )
            )
                .toString()
                .padStart(2, "0")}`;

    }

}


/* =========================================================
   PERIODIC AI ANALYSIS
========================================================= */

function runPeriodicAIAnalysis() {

    if (
        !navigationState.isRunning
    ) {

        return;

    }


    const progress =
        navigationState.voyageProgress;


    /*
        Highest priority first.
    */

    if (
        navigationState.icebergDetected &&
        navigationState.icebergDistance !== null
    ) {

        const distance =
            navigationState.icebergDistance;


        if (
            distance <= 18
        ) {

            setAIInsight(

                "Critical route conflict",

                "The detected iceberg is approaching the selected route corridor. AI analysis indicates that the current route may require reassessment.",

                "CRITICAL",

                "high",

                "+3 hrs",

                "+6%"

            );

            return;

        }


        if (
            distance <= 30
        ) {

            setAIInsight(

                "Iceberg remains within radar range",

                `The moving iceberg remains ${distance.toFixed(1)} km from the vessel. Its predicted trajectory continues toward the route corridor.`,

                "HIGH PRIORITY",

                "high",

                "+2.5 hrs",

                "+4%"

            );

            return;

        }

    }


    /*
        Sea ice.
    */

    if (
        navigationState.seaIceConcentration >
        52
    ) {

        setAIInsight(

            "Sea-ice conditions changing",

            `Sea-ice concentration ahead is approximately ${Math.round(navigationState.seaIceConcentration)}%. AI analysis predicts increased resistance as the vessel approaches the Antarctic sector.`,

            "ATTENTION",

            "moderate",

            "+1.5 hrs",

            "+3%"

        );

        return;

    }


    /*
        Weather.
    */

    if (
        navigationState.windSpeed >
        35
    ) {

        setAIInsight(

            "Weather impact detected",

            `Wind speed has increased to approximately ${Math.round(navigationState.windSpeed)} knots. Headwind conditions may reduce vessel speed along the selected route.`,

            "UPDATE",

            "moderate",

            "+1 hr",

            "+2%"

        );

        return;

    }


    /*
        Fuel.
    */

    if (
        navigationState.fuel <
        60
    ) {

        setAIInsight(

            "Fuel forecast updated",

            "Environmental resistance is increasing projected fuel consumption. Current reserve remains under continuous monitoring.",

            "UPDATE",

            "moderate",

            "+1 hr",

            "+3%"

        );

        return;

    }


    /*
        Normal insight.
    */

    setAIInsight(

        "Route conditions stable",

        `Route ${navigationState.selectedRoute} remains within the current operational envelope. Vessel position, environment and radar conditions continue to be monitored.`,

        "NORMAL",

        "low",

        "On Schedule",

        "Normal"

    );

}


/* =========================================================
   SET AI INSIGHT
========================================================= */

function setAIInsight(
    title,
    message,
    priority,
    risk,
    eta,
    fuel
) {

    if (DOM.aiTitle) {

        DOM.aiTitle.textContent =
            title;

    }


    if (DOM.aiMessage) {

        DOM.aiMessage.textContent =
            message;

    }


    if (DOM.aiPriority) {

        DOM.aiPriority.textContent =
            priority;


        DOM.aiPriority.classList.remove(
            "warning",
            "danger"
        );


        if (
            risk === "moderate"
        ) {

            DOM.aiPriority.classList.add(
                "warning"
            );

        }


        if (
            risk === "high"
        ) {

            DOM.aiPriority.classList.add(
                "danger"
            );

        }

    }


    if (DOM.aiRisk) {

        DOM.aiRisk.textContent =
            capitalize(
                risk
            );


        DOM.aiRisk.className =
            "risk-" +
            risk;

    }


    if (DOM.aiEta) {

        DOM.aiEta.textContent =
            eta;

    }


    if (DOM.aiFuel) {

        DOM.aiFuel.textContent =
            fuel;

    }


    if (DOM.aiMessage) {

        DOM.aiMessage.classList.remove(
            "ai-map-event"
        );


        void DOM.aiMessage.offsetWidth;


        DOM.aiMessage.classList.add(
            "ai-map-event"
        );

    }


    navigationState.aiRisk =
        risk;


    navigationState.aiPriority =
        priority;

}


/* =========================================================
   SELECT ROUTE
========================================================= */

function selectRoute(
    routeName,
    userSelected = false
) {

    if (
        !routes[routeName]
    ) {

        return;

    }


    navigationState.selectedRoute =
        routeName;


    /*
        Update route styling.
    */

    Object.keys(
        routeLayers
    ).forEach(
        name => {

            const layer =
                routeLayers[name];


            if (
                name === routeName
            ) {

                layer.setStyle({

                    color:
                        "#63caff",

                    weight:
                        4,

                    opacity:
                        0.92,

                    dashArray:
                        null

                });

            }

            else {

                layer.setStyle({

                    color:
                        "#9db6c6",

                    weight:
                        2,

                    opacity:
                        0.42,

                    dashArray:
                        "8 7"

                });

            }

        }
    );


    selectedRouteLayer =
        routeLayers[
            routeName
        ];


    /*
        Update route option UI.
    */

    document.querySelectorAll(
        ".route-option"
    ).forEach(
        option => {

            option.classList.toggle(

                "selected",

                option.dataset.route ===
                routeName

            );

        }
    );


    updateRouteAI(
        routeName
    );


    /*
        If voyage has not started,
        move vessel to new route start.
    */

    if (
        !navigationState.isRunning
    ) {

        const start =
            routes[routeName][0];


        updateVesselPosition(
            start
        );

    }


    if (userSelected) {

        addEvent(

            "normal",

            `Route ${routeName} selected`,

            `Navigation route ${routeName} is now active for the prototype.`,

            "Now",

            "route"

        );

    }

}


/* =========================================================
   ROUTE AI
========================================================= */

function updateRouteAI(
    routeName
) {

    if (!DOM.routeAI) {
        return;
    }


    const info =
        routeInfo[routeName];


    if (!info) {
        return;
    }


    let message = "";


    if (
        routeName === "B"
    ) {

        message =
            "Route B is approximately 30 km longer than Route A, but current environmental forecasts indicate lower sea-ice concentration, lower iceberg exposure and improved fuel efficiency. AI therefore selected Route B for the initial voyage.";

    }

    else if (
        routeName === "A"
    ) {

        message =
            "Route A provides a shorter distance, but current environmental forecasts indicate higher sea-ice and iceberg exposure. This may increase resistance and fuel demand.";

    }

    else if (
        routeName === "C"
    ) {

        message =
            "Route C provides lower predicted ice exposure, but requires additional distance. The lower environmental risk is balanced against increased voyage time.";

    }

    else {

        message =
            "Route D provides another operational alternative, but current forecasts indicate higher fuel requirements compared with Route B.";

    }


    DOM.routeAI.innerHTML = `

        <div class="route-ai-title">

            <i data-lucide="sparkles"></i>

            <strong>
                Why Route ${routeName}?
            </strong>

        </div>


        <p>
            ${message}
        </p>

    `;


    refreshIcons();

}


/* =========================================================
   GENERATE ROUTES
========================================================= */

function generateRoutes() {

    setTimeout(
        () => {

            Object.keys(
                routes
            ).forEach(
                routeName => {

                    if (
                        !routeLayers[routeName]
                    ) {
                        return;
                    }


                    routeLayers[
                        routeName
                    ].setStyle({

                        opacity:
                            routeName ===
                            navigationState.selectedRoute
                                ? 0.92
                                : 0.42

                    });

                }
            );


            selectRoute(
                "B",
                false
            );


            setAIInsight(

                "Route B selected by AI",

                "Four candidate routes were evaluated. Route B provides a balanced combination of distance, sea-ice exposure, iceberg risk and expected fuel consumption.",

                "ROUTE DECISION",

                "low",

                "+2 hrs",

                "+4%"

            );


            addEvent(

                "normal",

                "Routes generated",

                "Routes A, B, C and D evaluated. Route B remains the AI-selected route.",

                "Now",

                "route"

            );

        },

        700
    );

}


/* =========================================================
   LAYER CONTROLS
========================================================= */

function initializeLayerControls() {

    const buttons =
        document.querySelectorAll(
            ".layer-button"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const layer =
                        button.dataset.layer;


                    button.classList.toggle(
                        "active"
                    );


                    toggleLayer(
                        layer,
                        button.classList.contains(
                            "active"
                        )
                    );

                }
            );

        }
    );

}


/* =========================================================
   TOGGLE LAYER
========================================================= */

function toggleLayer(
    layer,
    active
) {

    if (!map) {
        return;
    }


    if (
        layer === "route"
    ) {

        Object.values(
            routeLayers
        ).forEach(
            routeLayer => {

                if (active) {

                    if (
                        !map.hasLayer(
                            routeLayer
                        )
                    ) {

                        routeLayer.addTo(
                            map
                        );

                    }

                }

                else {

                    if (
                        map.hasLayer(
                            routeLayer
                        )
                    ) {

                        map.removeLayer(
                            routeLayer
                        );

                    }

                }

            }
        );

    }


    if (
        layer === "radar"
    ) {

        if (active) {

            if (radarCircle) {

                radarCircle.addTo(
                    map
                );

            }


            if (radarVisual) {

                radarVisual.addTo(
                    map
                );

            }

        }

        else {

            if (radarCircle) {

                map.removeLayer(
                    radarCircle
                );

            }


            if (radarVisual) {

                map.removeLayer(
                    radarVisual
                );

            }

        }

    }


    if (
        layer === "ice"
    ) {

        if (seaIceLayer) {

            if (active) {

                seaIceLayer.addTo(
                    map
                );

            }

            else {

                map.removeLayer(
                    seaIceLayer
                );

            }

        }

    }


    /*
        Weather and ocean are currently
        represented through the AI/environment
        layer. Their dedicated visual
        overlays will be added when the
        real data layer is connected.
    */

    if (
        layer === "weather"
    ) {

        showLayerMessage(
            active
                ? "Weather monitoring enabled"
                : "Weather layer hidden"
        );

    }


    if (
        layer === "ocean"
    ) {

        showLayerMessage(
            active
                ? "Ocean current monitoring enabled"
                : "Ocean layer hidden"
        );

    }

}


/* =========================================================
   CENTER VESSEL
========================================================= */

function centerVessel() {

    if (
        !map ||
        !vesselMarker
    ) {

        return;

    }


    const position =
        vesselMarker.getLatLng();


    map.flyTo(

        position,

        Math.max(
            map.getZoom(),
            6
        ),

        {

            duration:
                1.2

        }

    );

}


/* =========================================================
   ADD EVENT
========================================================= */

function addEvent(
    type,
    title,
    message,
    time,
    icon
) {

    if (!DOM.eventFeed) {
        return;
    }


    const event =
        document.createElement(
            "div"
        );


    event.className =
        `event-item ${type}`;


    event.innerHTML = `

        <div class="event-icon">

            <i data-lucide="${icon}"></i>

        </div>


        <div class="event-content">

            <strong>
                ${title}
            </strong>

            <span>
                ${message}
            </span>

        </div>


        <time>
            ${time}
        </time>

    `;


    DOM.eventFeed.prepend(
        event
    );


    /*
        Keep feed clean.
    */

    while (
        DOM.eventFeed.children.length >
        6
    ) {

        DOM.eventFeed.lastElementChild
            .remove();

    }


    refreshIcons();

}


/* =========================================================
   SHOW LAYER MESSAGE
========================================================= */

function showLayerMessage(
    message
) {

    addEvent(

        "normal",

        "Layer update",

        message,

        "Now",

        "layers"

    );

}


/* =========================================================
   MAP ERROR
========================================================= */

function showMapError(
    message
) {

    if (!DOM.map) {
        return;
    }


    DOM.map.innerHTML = `

        <div
            style="
                position:absolute;
                inset:0;
                display:flex;
                align-items:center;
                justify-content:center;
                padding:30px;
                text-align:center;
                background:#071522;
                color:#a9bfd1;
                font-size:12px;
                z-index:1000;
            "
        >

            ${message}

        </div>

    `;

}


/* =========================================================
   LAST UPDATED
========================================================= */

function updateLastUpdated() {

    if (!DOM.lastUpdated) {
        return;
    }


    const now =
        new Date();


    DOM.lastUpdated.textContent =
        now.toLocaleTimeString(
            [],
            {
                hour:
                    "2-digit",

                minute:
                    "2-digit"
            }
        );

}


/* =========================================================
   CLAMP
========================================================= */

function clamp(
    value,
    min,
    max
) {

    return Math.max(
        min,
        Math.min(
            max,
            value
        )
    );

}


/* =========================================================
   CAPITALIZE
========================================================= */

function capitalize(
    value
) {

    if (!value) {
        return "";
    }


    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );

}


/* =========================================================
   REFRESH ICONS
========================================================= */

function refreshIcons() {

    if (
        typeof lucide !== "undefined" &&
        typeof lucide.createIcons === "function"
    ) {

        lucide.createIcons();

    }

}


/* =========================================================
   EVENT LISTENERS
========================================================= */

function initializeControls() {


    /*
        Start
    */

    if (DOM.startButton) {

        DOM.startButton.addEventListener(
            "click",
            startVoyage
        );

    }


    /*
        Pause
    */

    if (DOM.pauseButton) {

        DOM.pauseButton.addEventListener(
            "click",
            pauseVoyage
        );

    }


    /*
        Reset
    */

    if (DOM.resetButton) {

        DOM.resetButton.addEventListener(
            "click",
            resetVoyage
        );

    }


    /*
        Center vessel
    */

    if (DOM.centerButton) {

        DOM.centerButton.addEventListener(
            "click",
            centerVessel
        );

    }


    /*
        Generate routes
    */

    if (
        DOM.generateRouteButton
    ) {

        DOM.generateRouteButton.addEventListener(
            "click",
            generateRoutes
        );

    }


    /*
        Route options
    */

    document.querySelectorAll(
        ".route-option"
    ).forEach(
        option => {

            option.addEventListener(
                "click",
                () => {

                    selectRoute(
                        option.dataset.route,
                        true
                    );

                }
            );

        }
    );


    /*
        Layer controls
    */

    initializeLayerControls();

}


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

function initializeKeyboardControls() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.code ===
                "Space"
            ) {

                event.preventDefault();


                if (
                    navigationState.isRunning
                ) {

                    pauseVoyage();

                }

                else {

                    startVoyage();

                }

            }


            if (
                event.key.toLowerCase() ===
                "r"
            ) {

                resetVoyage();

            }


            if (
                event.key.toLowerCase() ===
                "c"
            ) {

                centerVessel();

            }

        }
    );

}


/* =========================================================
   INITIAL STATE
========================================================= */

function initializeNavigation() {

    initializeMap();

    initializeControls();

    initializeKeyboardControls();


    /*
        Initial route.
    */

    selectRoute(
        "B",
        false
    );


    /*
        Initial telemetry.
    */

    const start =
        getCurrentRoute()[0];


    updateVesselTelemetry(
        start
    );


    updateLastUpdated();


    /*
        Initial AI insight.
    */

    setAIInsight(

        "Route B selected by AI",

        "Route B provides a balanced route between distance, sea-ice exposure, iceberg risk and fuel consumption. The vessel is ready to begin the simulated voyage.",

        "ROUTE DECISION",

        "low",

        "On Schedule",

        "Normal"

    );


    /*
        Update timestamp every 15 seconds.
    */

    setInterval(
        updateLastUpdated,
        15000
    );


    refreshIcons();

}


/* =========================================================
   START APPLICATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeNavigation();

    }
);


/* =========================================================
   END OF NAVIGATION JS
========================================================= */