/* =========================================================
   DHRUV NETRA
   AI ANTARCTIC NAVIGATION DEMO
========================================================= */


/* =========================================================
   IMPORTANT LOCATIONS
========================================================= */

const INDIA = [
    18.65,
    72.30
];


/*
    Bharati Research Station vicinity.

    The vessel does NOT navigate directly
    onto the station itself.

    Instead we use an offshore approach point.
*/

const BHARATI = [
    -69.4068,
    76.19525
];


const APPROACH = [
    -69.15,
    76.20
];



/* =========================================================
   ROUTES
========================================================= */

const routes = {

    A: [

        INDIA,

        [16, 68],

        [7, 63],

        [-8, 60],

        [-25, 62],

        [-42, 65],

        [-56, 70],

        [-63, 75],

        APPROACH

    ],


    B: [

        INDIA,

        [16, 68],

        [6, 65],

        [-10, 64],

        [-27, 68],

        [-43, 72],

        [-57, 77],

        [-64, 78],

        APPROACH

    ],


    C: [

        INDIA,

        [16, 68],

        [6, 67],

        [-10, 69],

        [-26, 74],

        [-42, 82],

        [-56, 85],

        [-64, 82],

        APPROACH

    ]

};



/* =========================================================
   ROUTE INFORMATION
========================================================= */

const meta = {

    A: [

        "ROUTE A • SHORTEST",

        "DISTANCE OPTIMIZED",

        "Shortest water corridor; higher forecast ice exposure."

    ],


    B: [

        "ROUTE B • BALANCED",

        "AI OPTIMAL",

        "Balances distance, sea-ice exposure, current and iceberg risk."

    ],

    C: [

        "ROUTE C • ICE AVOIDANCE",

        "LOW ICE",

        "Wider eastern corridor designed to reduce predicted ice exposure."

    ]

};



/* =========================================================
   NAVIGATION STATE
========================================================= */

const S = {

    route: "B",

    path: routes.B.slice(),

    pending: null,

    progress: 0,

    running: false,

    paused: false,

    hazard: false,

    rerouted: false,

    layers: {

        route: true,

        iceberg: true,

        ice: true,

        current: true,

        risk: true,

        radar: true

    }

};



/* =========================================================
   MAP VARIABLES
========================================================= */

let map;

let mapViewport;

let vessel;

let iceberg;

let iceTrail;

let prediction;

let icebergLayers = [];

let radarLayer;

let nearestIceberg = null;

const RADAR_RADIUS_KM = 120;

const icebergTracks = [
    {
        id: "IB-042",
        start: [-24, 65],
        end: [-35, 74],
        color: "#ff5367"
    },
    {
        id: "IB-087",
        start: [-36, 76],
        end: [-48, 82],
        color: "#ffad5a"
    },
    {
        id: "IB-113",
        start: [-49, 68],
        end: [-60, 75],
        color: "#d98cff"
    }
];

let routeLayers = {};

let pendingLayer;

let iceLayer;

let currentLayer;

let riskLayer;

let animationFrame;

let lastFrameTime = 0;



/* =========================================================
   DOM HELPER
========================================================= */

function $(id) {

    return document.getElementById(id);

}



/* =========================================================
   INITIALIZE
========================================================= */

function init() {

    mapViewport = document.getElementById("mapViewport");


    map = L.map(
        "liveMap",
        {

            minZoom: 2,

            maxZoom: 7,

            zoomControl: true

        }

    ).setView(
        [-37, 76],
        3
    );


    /*
        Satellite base layer.
    */

    L.tileLayer(

        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",

        {

            maxZoom: 19,

            attribution:
                "Imagery © Esri"

        }

    ).addTo(map);



    drawEnvironment();

    drawRoutes();

    drawMarkers();

    nearestIceberg = moveIcebergs(0);

    updateRouteUI();

    updateVessel(INDIA);



    map.fitBounds(

        [

            [25, 55],

            [-72, 92]

        ],

        {

            padding: [25, 25]

        }

    );

    map.setView(INDIA, 3);
    updateVessel(INDIA);



    addEvent(

        "info",

        "Navigation initialized",

        "AI route monitoring is active. Vessel is ready for departure."

    );

}



/* =========================================================
   ENVIRONMENT LAYERS
========================================================= */

function drawEnvironment() {


    /*
        Sea-ice visualization.

        Prototype polygons only.
    */

    iceLayer =
        L.layerGroup()
            .addTo(map);


    [

        [

            [-58, 58],

            [-56, 66],

            [-62, 72],

            [-68, 72],

            [-68, 62],

            [-64, 56]

        ],


        [

            [-63, 69],

            [-61, 78],

            [-67, 84],

            [-71, 87],

            [-72, 75],

            [-69, 67]

        ],


        [

            [-52, 63],

            [-48, 72],

            [-55, 78],

            [-62, 77],

            [-61, 68]

        ]

    ].forEach(

        polygon => {

            L.polygon(

                polygon,

                {

                    color: "#8de7ff",

                    weight: 1,

                    opacity: 0.25,

                    fillColor: "#8de7ff",

                    fillOpacity: 0.08

                }

            ).addTo(iceLayer);

        }

    );



    /*
        Ocean current layer.
    */

    currentLayer =
        L.layerGroup()
            .addTo(map);



    [

        [-35, 68, -25, 5],

        [-42, 73, -30, 8],

        [-50, 79, -25, 12],

        [-58, 78, -35, 7]

    ].forEach(

        ([lat, lon, bearingValue, distance]) => {

            const endpoint =
                destinationPoint(

                    [lat, lon],

                    bearingValue,

                    distance

                );


            L.polyline(

                [

                    [lat, lon],

                    endpoint

                ],

                {

                    color: "#55a9ff",

                    weight: 2,

                    opacity: 0.45

                }

            ).addTo(currentLayer);

        }

    );



    /*
        Risk corridor.
    */

    riskLayer =
        L.layerGroup()
            .addTo(map);


    L.circle(

        [-52, 80],

        {

            radius: 85000,

            color: "#ffc857",

            weight: 1,

            dashArray: "4 6",

            fillColor: "#ffc857",

            fillOpacity: 0.035

        }

    ).addTo(riskLayer);

}



/* =========================================================
   DRAW ROUTES
========================================================= */

function drawRoutes() {


    Object.keys(routes)
        .forEach(

            routeName => {

                routeLayers[routeName] =

                    L.polyline(

                        routes[routeName],

                        {

                            color:
                                routeName === "B"
                                    ? "#56d9ff"
                                    : "#90a5b1",

                            weight:
                                routeName === "B"
                                    ? 4
                                    : 2,

                            opacity:
                                routeName === "B"
                                    ? 0.9
                                    : 0.32,

                            dashArray:
                                routeName === "B"
                                    ? null
                                    : "7 8"

                        }

                    ).addTo(map);



                routeLayers[routeName].on(

                    "click",

                    () => {

                        selectRoute(
                            routeName
                        );

                    }

                );

            }

        );

}



/* =========================================================
   MARKERS
========================================================= */

function drawMarkers() {


    /*
        Mumbai marker.
    */

    L.marker(

        INDIA,

        {

            icon:

                L.divIcon(

                    {

                        className: "",

                        html:

                            `<div style="
                                width:12px;
                                height:12px;
                                border-radius:50%;
                                background:#ffb84d;
                                border:2px solid white;
                            "></div>`,

                        iconSize: [12, 12]

                    }

                )

        }

    )
        .addTo(map)

        .bindTooltip(
            "MUMBAI DEPARTURE"
        );



    /*
        Bharati approach marker.
    */

    L.marker(

        APPROACH,

        {

            icon:

                L.divIcon(

                    {

                        className: "",

                        html:

                            `<div class="station-icon"></div>`,

                        iconSize: [19, 19]

                    }

                )

        }

    )
        .addTo(map)

        .bindTooltip(
            "BHARATI OFFSHORE APPROACH"
        );



    /*
        Multiple moving iceberg predictions.
    */

    icebergTracks.forEach((track, index) => {
        const trail = L.polyline(
            [track.start, track.end],
            {
                color: track.color,
                weight: 2,
                dashArray: "5 6",
                opacity: 0.8
            }
        ).addTo(map);

        const forecast = L.polyline(
            [track.start, track.end],
            {
                color: track.color,
                weight: 1,
                dashArray: "2 7",
                opacity: 0.35
            }
        ).addTo(map);

        const marker = L.marker(
            track.start,
            {
                icon: L.divIcon({
                    className: "",
                    html: `<div class="iceberg-icon" style="--iceberg-color:${track.color}"></div>`,
                    iconSize: [16, 16]
                })
            }
        ).addTo(map).bindTooltip(`${track.id} • PREDICTED TRACK`);

        icebergLayers.push({
            track,
            trail,
            forecast,
            marker,
            progressOffset: index * 0.13
        });
    });

    iceberg = icebergLayers[0].marker;
    iceTrail = icebergLayers[0].trail;
    prediction = icebergLayers[0].forecast;

    radarLayer = L.circle(INDIA, {
        radius: RADAR_RADIUS_KM * 1000,
        color: "#ffad5a",
        weight: 1.5,
        dashArray: "6 7",
        fillColor: "#ffad5a",
        fillOpacity: 0.05
    }).addTo(map);



    /*
        Vessel.
    */

    vessel =

        L.marker(

            INDIA,

            {

                zIndexOffset: 1000,

                icon:

                    L.divIcon(

                        {

                            className: "",

                            html:

                                `

                                <div class="custom-vessel">
                                    <span class="vessel-arrow">▲</span>
                                </div>

                                <div class="vessel-label">
                                    SARASWATI
                                </div>

                                `,

                            iconSize:
                                [90, 55],

                            iconAnchor:
                                [45, 22]

                        }

                    )

            }

        ).addTo(map);

}



/* =========================================================
   SELECT ROUTE
========================================================= */

function selectRoute(routeName) {


    if (S.running) {

        addEvent(

            "warning",

            "Route selection locked",

            "Manual selection is disabled after vessel movement begins."

        );

        return;

    }


    S.route =
        routeName;


    S.path =
        routes[routeName].slice();


    S.progress =
        0;


    S.pending =
        null;


    updateRouteUI();

    updateVessel(INDIA);

    styleRoutes();

    document
        .querySelectorAll("[data-route-option]")
        .forEach(option => {
            option.classList.toggle(
                "selected",
                option.dataset.routeOption === routeName
            );
        });

}



/* =========================================================
   STYLE ROUTES
========================================================= */

function styleRoutes() {


    Object.keys(routeLayers)
        .forEach(

            routeName => {

                routeLayers[routeName]
                    .setStyle(

                        {

                            color:
                                routeName === S.route
                                    ? "#56d9ff"
                                    : "#90a5b1",

                            weight:
                                routeName === S.route
                                    ? 4
                                    : 2,

                            opacity:
                                routeName === S.route
                                    ? 0.9
                                    : 0.32,

                            dashArray:
                                routeName === S.route
                                    ? null
                                    : "7 8"

                        }

                    );

            }

        );

}



/* =========================================================
   UPDATE ROUTE PANEL
========================================================= */

function updateRouteUI() {


    const info =
        meta[S.route];


    $("routeName")
        .textContent =
        info[0];


    $("routeBadge")
        .textContent =
        info[1];


    $("routeReason")
        .textContent =
        info[2];


    updatePanel();

}



/* =========================================================
   UPDATE VESSEL
========================================================= */

function updateVessel(position) {


    vessel.setLatLng(
        position
    );

    const nextPoint = pointAlongPath(
        Math.min(1, S.progress + 0.002),
        S.path
    );

    const calculatedHeading = calculateBearing(
        position,
        nextPoint
    );

    const heading = Number.isFinite(calculatedHeading)
        ? calculatedHeading
        : 180;

    const element = vessel
        .getElement()
        ?.querySelector(".vessel-arrow");

    if (element) {
        element.style.transform = `rotate(${heading}deg)`;
    }

    orientMapToVessel(heading);

    if (radarLayer) {
        radarLayer.setLatLng(position);

    }

    if (S.running && map) {
        map.panTo(position, { animate: false });
    }


    $("coords")
        .textContent =

        `${Math.abs(position[0]).toFixed(3)}° ${position[0] >= 0 ? "N" : "S"} • ` +

        `${Math.abs(position[1]).toFixed(3)}° ${position[1] >= 0 ? "E" : "W"}`;


    $("heading")
        .textContent =
        `${Math.round(heading)}°`;

}


function orientMapToVessel(heading) {

    if (!map || !mapViewport) {
        return;
    }

    mapViewport.style.transform = "none";
}



/* =========================================================
   START VOYAGE
========================================================= */

function startVoyage() {


    S.running =
        true;


    S.paused =
        false;


    $("start")
        .textContent =
        "▶ RUNNING";


    addEvent(

        "info",

        "Voyage started",

        `Route ${S.route} active. Environmental monitoring is running.`

    );


    lastFrameTime =
        performance.now();


    cancelAnimationFrame(
        animationFrame
    );


    animationFrame =
        requestAnimationFrame(
            animateVoyage
        );

}



/* =========================================================
   PAUSE / RESUME VOYAGE
========================================================= */

function pauseVoyage() {

    if (!S.running) {
        return;
    }

    S.paused = !S.paused;

    $("pause")
        .textContent =
        S.paused
            ? "▶ RESUME"
            : "Ⅱ PAUSE";

    setStatus(
        S.paused
            ? "VOYAGE PAUSED"
            : "NAVIGATION NOMINAL",
        true
    );

    addEvent(
        "info",
        S.paused ? "Voyage paused" : "Voyage resumed",
        S.paused
            ? "Vessel motion paused pending operator action."
            : "Vessel has resumed movement."
    );
}



/* =========================================================
   RESET
========================================================= */

function resetVoyage() {


    cancelAnimationFrame(
        animationFrame
    );


    S.route =
        "B";


    S.path =
        routes.B.slice();


    S.pending =
        null;


    S.progress =
        0;


    S.running =
        false;


    S.paused =
        false;


    S.hazard =
        false;


    S.rerouted =
        false;



    if (pendingLayer) {

        map.removeLayer(
            pendingLayer
        );

        pendingLayer =
            null;

    }



    $("hazard")
        .classList
        .remove("show");


    $("start")
        .textContent =
        "▶ START VOYAGE";


    $("pause")
        .textContent =
        "Ⅱ PAUSE";


    setStatus(

        "NAVIGATION NOMINAL",

        true

    );


    updateRouteUI();

    nearestIceberg = moveIcebergs(0);

    updateVessel(
        INDIA
    );


    addEvent(

        "info",

        "Simulation reset",

        "Vessel returned to Mumbai departure point."

    );

}



/* =========================================================
   VOYAGE ANIMATION
========================================================= */

function animateVoyage(timestamp) {


    if (!S.running) {

        return;

    }


    const delta =
        Math.min(

            0.05,

            (timestamp - lastFrameTime) / 1000

        );


    lastFrameTime =
        timestamp;



    if (!S.paused) {


        /*
            Vessel simulation speed.
        */

        S.progress +=
            delta * 0.0045;



        if (S.progress >= 1) {

            S.progress =
                1;


            S.running =
                false;


            setStatus(

                "ARRIVED • BHARATI APPROACH",

                true

            );


            addEvent(

                "info",

                "Voyage completed",

                "Vessel reached the Bharati offshore approach point."

            );

        }



        const position =

            pointAlongPath(

                S.progress,

                S.path

            );


        updateVessel(
            position
        );



        /*
            Move iceberg.
        */

        nearestIceberg = moveIcebergs(S.progress);

        const currentDistance = nearestIceberg
            ? nearestIceberg.distance
            : Infinity;


        $("cpa")
            .textContent =
            nearestIceberg
                ? `${currentDistance.toFixed(1)} km`
                : "—";



        /*
            Automatically trigger hazard.
        */

        if (

            !S.hazard &&

            !S.rerouted &&

            currentDistance <= RADAR_RADIUS_KM

        ) {

            triggerHazard(nearestIceberg);

        }



        /*
            Simulated sea ice.
        */

        $("ice")
            .textContent =

            `${Math.round(

                Math.max(

                    24,

                    Math.min(

                        78,

                        27 +
                        Math.max(

                            0,

                            -position[0] - 35

                        ) * 0.45

                    )

                )

            )}%`;



        updatePanel();

    }



    animationFrame =

        requestAnimationFrame(
            animateVoyage
        );

}



/* =========================================================
   MOVE ICEBERG
========================================================= */

function moveIcebergs(progress) {

    let closest = null;

    icebergLayers.forEach(layer => {
        const trackProgress = Math.max(
            0,
            Math.min(1, progress * 1.15 - 0.08 + layer.progressOffset)
        );

        const position = interpolatePoint(
            layer.track.start,
            layer.track.end,
            trackProgress
        );

        layer.marker.setLatLng(position);

        const distance = calculateDistance(
            pointAlongPath(progress, S.path),
            position
        );

        if (!closest || distance < closest.distance) {
            closest = {
                id: layer.track.id,
                position,
                distance
            };
        }
    });

    return closest;
}



function interpolatePoint(start, end, progress) {
    return [
        start[0] + (end[0] - start[0]) * progress,
        start[1] + (end[1] - start[1]) * progress
    ];
}



/* =========================================================
   ICEBERG HAZARD
========================================================= */

function triggerHazard(conflict = nearestIceberg) {


    if (
        S.hazard ||
        S.rerouted
    ) {

        return;

    }


    S.hazard =
        true;


    S.paused =
        true;



    /*
        Show alert.
    */

    $("hazard")
        .classList
        .add("show");

    const currentPosition = pointAlongPath(
        S.progress,
        S.path
    );

    const activeConflict = conflict?.distance <= RADAR_RADIUS_KM
        ? conflict
        : {
            id: "IB-042",
            position: [currentPosition[0] - 1, currentPosition[1] + 0.6],
            distance: 80
        };

    const conflictDistance = activeConflict.distance;

    $("alertCpa")
        .textContent =
        `${conflictDistance.toFixed(1)} km`;


    $("alertTime")
        .textContent =

        `${Math.max(

            12,

            Math.round(

                42 -
                S.progress * 18

            )

        )} min`;

    $("predictionWindow")
        .textContent =
        $("alertTime").textContent;

    $("predictionCpa")
        .textContent =
        $("alertCpa").textContent;

    $("alertText")
        .textContent =
        `${activeConflict.id} entered the ${RADAR_RADIUS_KM} km radar safety zone. AI generated a clearance route before collision risk could develop.`;



    setStatus(

        "HAZARD • CAPTAIN DECISION REQUIRED",

        false

    );



    $("routeReason")
        .textContent =

        `${activeConflict.id} entered the radar zone. AI has generated a clearance route with additional safety margin.`;



    /*
        Generate route from current
        vessel position.
    */

    const clearanceSide = activeConflict.position[1] >= currentPosition[1]
        ? -1
        : 1;

    S.pending = [
        currentPosition,
        [currentPosition[0] - 2, currentPosition[1] + clearanceSide * 3.2],
        [currentPosition[0] - 7, currentPosition[1] + clearanceSide * 5.5],
        [currentPosition[0] - 14, currentPosition[1] + clearanceSide * 4.5],
        ...S.path.slice(-3)
    ];



    /*
        Draw proposed route.
    */

    if (pendingLayer) {

        map.removeLayer(
            pendingLayer
        );

    }


    pendingLayer =

        L.polyline(

            S.pending,

            {

                color:
                    "#ffc857",

                weight:
                    4,

                dashArray:
                    "10 7"

            }

        ).addTo(map);



    addEvent(

        "critical",

        "Iceberg conflict predicted",

        "IB-042 trajectory is converging with the active navigation corridor. AI route regenerated."

    );

}



/* =========================================================
   APPROVE AI REROUTE
========================================================= */

function approveReroute() {


    if (!S.pending) {

        return;

    }


    /*
        New route becomes active.
    */

    S.path =
        S.pending.slice();


    S.progress =
        0;


    S.hazard =
        false;


    S.rerouted =
        true;


    S.paused =
        false;



    $("hazard")
        .classList
        .remove("show");



    if (pendingLayer) {

        map.removeLayer(
            pendingLayer
        );

        pendingLayer =
            null;

    }



    $("routeName")
        .textContent =
        "AI REROUTE • ICEBERG AVOIDANCE";


    $("routeBadge")
        .textContent =
        "CAPTAIN APPROVED";


    $("routeReason")
        .textContent =

        "Captain approved the AI-generated detour. Vessel is following the new safety corridor.";



    setStatus(

        "REROUTE ACTIVE • CAPTAIN APPROVED",

        true

    );



    addEvent(

        "critical",

        "Captain approved AI reroute",

        "Vessel changed course from its current position and is proceeding on the regenerated corridor."

    );


    updatePanel();

}



/* =========================================================
   REJECT REROUTE
========================================================= */

function rejectReroute() {


    S.hazard =
        false;


    S.paused =
        false;


    $("hazard")
        .classList
        .remove("show");



    setStatus(

        "CURRENT ROUTE RETAINED • RISK ACKNOWLEDGED",

        false

    );


    $("routeReason")
        .textContent =

        "Captain retained the current route. AI continues monitoring the iceberg trajectory.";



    addEvent(

        "warning",

        "Reroute rejected by captain",

        "Current route retained. Continuous hazard monitoring remains active."

    );

}



/* =========================================================
   STATUS
========================================================= */

function setStatus(
    text,
    normal
) {


    $("mapStatus")
        .textContent =
        text;


    const dot =
        $("statusDot");


    dot.style.background =

        normal

            ? "#42e4a6"

            : "#ff5367";


    dot.style.boxShadow =

        `0 0 10px ${
            normal
                ? "#42e4a6"
                : "#ff5367"
        }`;

}



/* =========================================================
   UPDATE TELEMETRY PANEL
========================================================= */

function updatePanel() {


    const distance =
        calculatePathLength(
            S.path
        );


    const remaining =
        distance *
        (1 - S.progress);


    const hours =
        remaining /
        14.8;



    $("distance")
        .textContent =

        `${Math.round(distance).toLocaleString()} km`;



    $("eta")
        .textContent =

        hours > 24

            ? `${Math.floor(hours / 24)}d ${Math.round(hours % 24)}h`

            : `${Math.round(hours)}h`;



    $("fuel")
        .textContent =

        S.rerouted

            ? "+6.2%"

            : "BASE";



    $("speed")
        .textContent =

        S.paused

            ? "0.0 kn"

            : "14.8 kn";

}



/* =========================================================
   POINT ALONG ROUTE
========================================================= */

function pointAlongPath(
    progress,
    path
) {


    if (
        path.length < 2
    ) {

        return path[0];

    }



    const segmentDistances =

        path
            .slice(0, -1)
            .map(

                (point, index) =>

                    calculateDistance(

                        point,

                        path[index + 1]

                    )

            );



    let targetDistance =

        segmentDistances.reduce(

            (
                total,
                value
            ) =>

                total + value,

            0

        ) *

        Math.max(

            0,

            Math.min(

                1,

                progress

            )

        );



    for (

        let i = 0;

        i < segmentDistances.length;

        i++

    ) {


        if (
            targetDistance <=
            segmentDistances[i]
        ) {


            const ratio =

                targetDistance /
                segmentDistances[i];


            return [

                path[i][0] +

                (
                    path[i + 1][0] -
                    path[i][0]
                ) *

                ratio,


                path[i][1] +

                (
                    path[i + 1][1] -
                    path[i][1]
                ) *

                ratio

            ];

        }


        targetDistance -=
            segmentDistances[i];

    }



    return path[
        path.length - 1
    ];

}



/* =========================================================
   ROUTE LENGTH
========================================================= */

function calculatePathLength(
    path
) {


    return path
        .slice(0, -1)
        .reduce(

            (
                total,
                point,
                index
            ) =>

                total +

                calculateDistance(

                    point,

                    path[index + 1]

                ),

            0

        );

}



/* =========================================================
   HAVERSINE DISTANCE
========================================================= */

function calculateDistance(
    a,
    b
) {


    const R =
        6371;


    const radians =
        Math.PI / 180;


    const dLat =
        (b[0] - a[0]) *
        radians;


    const dLon =
        (b[1] - a[1]) *
        radians;


    const x =

        Math.sin(
            dLat / 2
        ) ** 2 +

        Math.cos(
            a[0] * radians
        ) *

        Math.cos(
            b[0] * radians
        ) *

        Math.sin(
            dLon / 2
        ) ** 2;



    return (

        2 *

        R *

        Math.asin(
            Math.sqrt(x)
        )

    );

}



/* =========================================================
   BEARING
========================================================= */

function calculateBearing(
    a,
    b
) {


    const radians =
        Math.PI / 180;


    const lat1 =
        a[0] *
        radians;


    const lat2 =
        b[0] *
        radians;


    const deltaLon =
        (
            b[1] -
            a[1]
        ) *
        radians;



    const y =
        Math.sin(
            deltaLon
        ) *
        Math.cos(
            lat2
        );


    const x =

        Math.cos(lat1) *
        Math.sin(lat2)

        -

        Math.sin(lat1) *
        Math.cos(lat2) *
        Math.cos(deltaLon);



    return (

        (
            180 /
            Math.PI *

            Math.atan2(
                y,
                x
            )

            +

            360

        ) % 360

    );

}



/* =========================================================
   DESTINATION POINT
========================================================= */

function destinationPoint(
    start,
    bearing,
    distance
) {


    const R =
        6371;


    const radians =
        Math.PI / 180;


    const bearingRad =
        bearing *
        radians;


    const lat1 =
        start[0] *
        radians;


    const lon1 =
        start[1] *
        radians;


    const angularDistance =
        distance /
        R;



    const lat2 =

        Math.asin(

            Math.sin(lat1) *
            Math.cos(
                angularDistance
            )

            +

            Math.cos(lat1) *
            Math.sin(
                angularDistance
            ) *
            Math.cos(
                bearingRad
            )

        );



    const lon2 =

        lon1 +

        Math.atan2(

            Math.sin(
                bearingRad
            ) *

            Math.sin(
                angularDistance
            ) *

            Math.cos(lat1),

            Math.cos(
                angularDistance
            )

            -

            Math.sin(lat1) *
            Math.sin(lat2)

        );



    return [

        lat2 / radians,

        lon2 / radians

    ];

}



/* =========================================================
   EVENT FEED
========================================================= */

function addEvent(
    type,
    title,
    message
) {


    const feed =
        $("eventFeed");


    const event =
        document.createElement(
            "article"
        );


    event.className =
        `event ${type}`;


    event.innerHTML = `

        <strong>
            ${title}
        </strong>

        <time>
            ${new Date()
                .toLocaleTimeString(
                    [],
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                )}
        </time>

        <p>
            ${message}
        </p>

    `;


    feed.prepend(
        event
    );


    while (
        feed.children.length > 4
    ) {

        feed.lastElementChild
            .remove();

    }

}



/* =========================================================
   LAYER CONTROL
========================================================= */

function toggleLayer(
    name,
    enabled
) {


    const groups = {

        route: [

            ...Object.values(
                routeLayers
            ),

            pendingLayer

        ].filter(Boolean),


        iceberg: [

            ...icebergLayers.flatMap(layer => [
                layer.marker,
                layer.trail,
                layer.forecast
            ])

        ],


        ice: [

            iceLayer

        ],


        current: [

            currentLayer

        ],


        risk: [

            riskLayer

        ],

        radar: [

            radarLayer

        ]

    };


    const layers =
        groups[name] ||
        [];


    layers.forEach(

        layer => {


            if (
                enabled &&
                !map.hasLayer(layer)
            ) {

                layer.addTo(map);

            }


            if (
                !enabled &&
                map.hasLayer(layer)
            ) {

                map.removeLayer(layer);

            }

        }

    );

}



/* =========================================================
   BUTTON EVENTS
========================================================= */

$("start")
    .onclick =
    startVoyage;


$("pause")
    .onclick =
    pauseVoyage;


$("reset")
    .onclick =
    resetVoyage;


$("testHazard")
    .onclick =
    triggerHazard;


$("approve")
    .onclick =
    approveReroute;


$("reject")
    .onclick =
    rejectReroute;



/* =========================================================
   LAYER EVENTS
========================================================= */

document
    .querySelectorAll(
        "[data-layer]"
    )
    .forEach(

        checkbox => {

            checkbox.onchange =

                event => {

                    toggleLayer(

                        event.target
                            .dataset
                            .layer,

                        event.target.checked

                    );

                };

        }

    );


document
    .querySelectorAll(
        "[data-route-option]"
    )
    .forEach(
        option => {
            option.onclick = () => {
                selectRoute(option.dataset.routeOption);
            };
        }
    );



/* =========================================================
   START APPLICATION
========================================================= */

init();