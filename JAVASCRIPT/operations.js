document.addEventListener("DOMContentLoaded", () => {
    const toast = document.getElementById("toast");

    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add("show");
        window.setTimeout(() => toast.classList.remove("show"), 2200);
    }

    document.querySelectorAll("[data-alert-filter]").forEach(button => {
        button.addEventListener("click", () => {
            const filter = button.dataset.alertFilter;
            document.querySelectorAll("[data-alert-filter]").forEach(item => item.classList.remove("active"));
            button.classList.add("active");
            document.querySelectorAll(".alert-item").forEach(item => {
                item.hidden = filter !== "all" && item.dataset.status !== filter;
            });
        });
    });

    document.querySelectorAll("[data-action]").forEach(button => {
        button.addEventListener("click", () => showToast(button.dataset.action));
    });

    document.querySelectorAll(".toggle input").forEach(input => {
        input.addEventListener("change", () => showToast(`${input.dataset.label} ${input.checked ? "enabled" : "disabled"}`));
    });

    const updated = document.getElementById("operationsUpdated");
    if (updated) {
        updated.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
});
