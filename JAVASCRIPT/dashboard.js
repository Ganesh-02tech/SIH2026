/* =========================================================
   DHRUV NETRA — DASHBOARD JS
   Minimal dashboard interactions + demo live simulation
   ========================================================= */


/* =========================================================
   DASHBOARD STATE
   ========================================================= */

const dashboardState = {
    voyageProgress: 64,
    distanceCovered: 1940,
    distanceRemaining: 3020,

    speed: 16.8,
    heading: 184,

    fuel: 72,

    etaDays: 5,
    etaHours: 14,

    aiRouteStatus: "stable",

    lastUpdated: new Date()
};


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const elements = {
    progressFill: document.querySelector(".progress-fill"),
    shipMarker: document.querySelector(".ship-marker"),

    lastUpdated: document.getElementById("lastUpdated"),

    summaryValues: document.querySelectorAll(".summary-value"),

    voyageStats: document.querySelectorAll(".voyage-stat strong"),

    aiRouteStatus: document.querySelector(".ai-route-status"),
    aiStatusLabel: document.querySelector(".ai-status-safe"),
    aiRouteText: document.querySelector(".ai-route-content p"),

    fuelAI: document.querySelector(".fuel-ai"),
    etaAI: document.querySelector(".eta-ai"),

    missionStatus: document.querySelector(".mission-status strong"),
    missionStatusDot: document.querySelector(".mission-status .status-dot"),

    dataRows: document.querySelectorAll(".data-row strong")
};


/* =========================================================
   INITIALIZE DASHBOARD
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    updateDashboard();

    startLiveSimulation();

    initializeNavigation();

});


/* =========================================================
   UPDATE COMPLETE DASHBOARD
   ========================================================= */

function updateDashboard() {

    updateVoyageProgress();

    updateVoyageStats();

    updateFuel();

    updateETA();

    updateAIStatus();

    updateMissionStatus();

    updateLastUpdated();

}


/* =========================================================
   VOYAGE PROGRESS
   ========================================================= */

function updateVoyageProgress() {

    if (elements.progressFill) {

        elements.progressFill.style.width =
            `${dashboardState.voyageProgress}%`;

    }


    if (elements.shipMarker) {

        elements.shipMarker.style.left =
            `${dashboardState.voyageProgress}%`;

    }

}


/* =========================================================
   VOYAGE STATS
   ========================================================= */

function updateVoyageStats() {

    if (!elements.voyageStats.length) {
        return;
    }


    /*
        Current Voyage stats order:

        0 → Distance Covered
        1 → Remaining
        2 → Current Speed
        3 → Heading
    */

    if (elements.voyageStats[0]) {

        elements.voyageStats[0].textContent =
            `${dashboardState.distanceCovered.toLocaleString()} km`;

    }


    if (elements.voyageStats[1]) {

        elements.voyageStats[1].textContent =
            `${dashboardState.distanceRemaining.toLocaleString()} km`;

    }


    if (elements.voyageStats[2]) {

        elements.voyageStats[2].textContent =
            `${dashboardState.speed.toFixed(1)} kn`;

    }


    if (elements.voyageStats[3]) {

        elements.voyageStats[3].textContent =
            `${dashboardState.heading}° S`;

    }


    updateLiveDataRows();

}


/* =========================================================
   LIVE DATA ROWS
   ========================================================= */

function updateLiveDataRows() {

    if (!elements.dataRows.length) {
        return;
    }


    /*
        Current Voyage Data:

        0 → Latitude
        1 → Longitude
        2 → Speed
        3 → Heading
        4 → Sea State
        5 → Communication
    */


    if (elements.dataRows[2]) {

        elements.dataRows[2].textContent =
            `${dashboardState.speed.toFixed(1)} kn`;

    }


    if (elements.dataRows[3]) {

        elements.dataRows[3].textContent =
            `${dashboardState.heading}°`;

    }

}


/* =========================================================
   FUEL
   ========================================================= */

function updateFuel() {

    /*
        Fuel card is the third summary card.
    */

    if (elements.summaryValues[2]) {

        elements.summaryValues[2].textContent =
            `${Math.round(dashboardState.fuel)}%`;

    }


    if (!elements.fuelAI) {
        return;
    }


    const fuelText =
        elements.fuelAI.querySelector("span:not(.ai-dot)");


    if (!fuelText) {
        return;
    }


    if (dashboardState.fuel >= 60) {

        fuelText.textContent =
            "Reserve within safe range";

    }

    else if (dashboardState.fuel >= 40) {

        fuelText.textContent =
            "Fuel consumption being monitored";

    }

    else {

        fuelText.textContent =
            "Higher fuel consumption expected";

    }

}


/* =========================================================
   ETA
   ========================================================= */

function updateETA() {

    /*
        ETA card is the second summary card.
    */

    if (!elements.summaryValues[1]) {
        return;
    }


    elements.summaryValues[1].textContent =
        `${dashboardState.etaDays}d ${dashboardState.etaHours}h`;


    if (!elements.etaAI) {
        return;
    }


    const etaText =
        elements.etaAI.querySelector("span:not(.ai-dot)");


    if (!etaText) {
        return;
    }


    if (dashboardState.aiRouteStatus === "stable") {

        etaText.textContent =
            "On schedule";

    }

    else if (dashboardState.aiRouteStatus === "warning") {

        etaText.textContent =
            "+3h delay possible";

    }

    else {

        etaText.textContent =
            "Delay expected";

    }

}


/* =========================================================
   AI ROUTE STATUS
   ========================================================= */

function updateAIStatus() {

    if (
        !elements.aiRouteStatus ||
        !elements.aiStatusLabel ||
        !elements.aiRouteText
    ) {
        return;
    }


    /*
        Remove previous states.
    */

    elements.aiRouteStatus.classList.remove(
        "warning",
        "danger"
    );


    /* =========================
       STABLE
       ========================= */

    if (dashboardState.aiRouteStatus === "stable") {

        elements.aiStatusLabel.textContent =
            "STABLE";

        elements.aiRouteText.textContent =
            "No significant environmental hazards predicted along the selected route for the next 12 hours.";

        return;
    }


    /* =========================
       WARNING
       ========================= */

    if (dashboardState.aiRouteStatus === "warning") {

        elements.aiRouteStatus.classList.add("warning");

        elements.aiStatusLabel.textContent =
            "WARNING";

        elements.aiRouteText.textContent =
            "Increased sea-ice concentration predicted approximately 120 km ahead. Review route conditions.";

        return;
    }


    /* =========================
       DANGER
       ========================= */

    if (dashboardState.aiRouteStatus === "danger") {

        elements.aiRouteStatus.classList.add("danger");

        elements.aiStatusLabel.textContent =
            "HIGH RISK";

        elements.aiRouteText.textContent =
            "Significant environmental hazard predicted ahead. Alternative route evaluation recommended.";

    }

}


/* =========================================================
   MISSION STATUS
   ========================================================= */

function updateMissionStatus() {

    if (
        !elements.missionStatus ||
        !elements.missionStatusDot
    ) {
        return;
    }


    if (dashboardState.aiRouteStatus === "stable") {

        elements.missionStatus.textContent =
            "Normal";

        elements.missionStatusDot.style.background =
            "var(--green)";

        elements.missionStatusDot.style.boxShadow =
            "0 0 0 4px rgba(53, 211, 154, 0.08)";

    }


    else if (
        dashboardState.aiRouteStatus === "warning"
    ) {

        elements.missionStatus.textContent =
            "Attention";

        elements.missionStatusDot.style.background =
            "var(--orange)";

        elements.missionStatusDot.style.boxShadow =
            "0 0 0 4px rgba(255, 173, 90, 0.08)";

    }


    else {

        elements.missionStatus.textContent =
            "Risk Detected";

        elements.missionStatusDot.style.background =
            "var(--red)";

        elements.missionStatusDot.style.boxShadow =
            "0 0 0 4px rgba(255, 101, 117, 0.08)";

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
   LIVE SIMULATION
   ========================================================= */

function startLiveSimulation() {

    /*
        This is only a frontend demonstration.

        Later this will be replaced by:
        API → Backend → AI Model → Dashboard
    */


    setInterval(() => {

        simulateVesselMovement();

        updateDashboard();

    }, 10000);

}


/* =========================================================
   SIMULATE VESSEL MOVEMENT
   ========================================================= */

function simulateVesselMovement() {

    /*
        Very small movement.
        Keeps the dashboard realistic
        without making values jump.
    */

    dashboardState.distanceCovered += 1;

    dashboardState.distanceRemaining =
        Math.max(
            0,
            dashboardState.distanceRemaining - 1
        );


    dashboardState.voyageProgress =
        (
            dashboardState.distanceCovered /
            (
                dashboardState.distanceCovered +
                dashboardState.distanceRemaining
            )
        ) * 100;


    /*
        Small speed variation.
    */

    const speedChange =
        (Math.random() - 0.5) * 0.2;

    dashboardState.speed =
        Math.max(
            14,
            Math.min(
                18,
                dashboardState.speed + speedChange
            )
        );


    /*
        Small heading variation.
    */

    const headingChange =
        Math.random() > 0.5 ? 1 : -1;

    dashboardState.heading += headingChange;


    /*
        Very small fuel consumption.
    */

    dashboardState.fuel =
        Math.max(
            0,
            dashboardState.fuel - 0.02
        );


    dashboardState.lastUpdated =
        new Date();

}


/* =========================================================
   DEMO AI STATUS CONTROLS
   ========================================================= */

/*
    These functions are useful during prototype/demo.

    Example:

    setAIStatus("warning");

    setAIStatus("danger");

    setAIStatus("stable");
*/


function setAIStatus(status) {

    const validStatuses = [
        "stable",
        "warning",
        "danger"
    ];


    if (!validStatuses.includes(status)) {

        console.warn(
            "Invalid AI status:",
            status
        );

        return;

    }


    dashboardState.aiRouteStatus =
        status;


    updateDashboard();

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function initializeNavigation() {

    const navItems =
        document.querySelectorAll(".nav-item");


    navItems.forEach(item => {

        item.addEventListener("click", event => {

            const href = item.getAttribute("href");

            if (!href || href === "#") {
                event.preventDefault();
            }


            /*
                Remove active state
                from all navigation items.
            */

            navItems.forEach(nav => {

                nav.classList.remove("active");

            });


            /*
                Activate clicked item.
            */

            item.classList.add("active");

        });

    });

}


/* =========================================================
   OPTIONAL DEMO FUNCTIONS
   ========================================================= */


/*
    Simulate an AI warning.

    Uncomment the line below
    if you want to test the warning state.

    setTimeout(() => {
        setAIStatus("warning");
    }, 5000);
*/


/*
    Simulate a high-risk situation.

    Example:

    setTimeout(() => {
        setAIStatus("danger");
    }, 10000);
*/


/* =========================================================
   END OF DASHBOARD JS
   ========================================================= */