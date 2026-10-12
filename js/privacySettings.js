/*=========================================================
 BUILD GOD'S HOUSE
 PRIVACY SETTINGS PANEL
=========================================================*/

const PrivacySettings = {

    KEY: "bgh_privacy_mode",

    MODES: {
        individual: {
            label: "Show individual donor name",
            description: "The latest donor's full name appears on the dashboard."
        },
        group: {
            label: "Show group only (recommended)",
            description: "Only the donor's group is displayed. Individual names stay private."
        },
        anonymous: {
            label: "Fully anonymous",
            description: "The dashboard always shows 'Anonymous' regardless of who donates."
        }
    },

    get() {
        return localStorage.getItem(this.KEY) || "group";
    },

    set(mode) {
        if (!this.MODES[mode]) return false;
        localStorage.setItem(this.KEY, mode);
        console.log("Privacy mode set to:", mode);
        if (typeof refreshApplication === "function") {
            refreshApplication();
        }
        return true;
    },

    /*-----------------------------------------------------
     Render the settings UI into a given container element
    -----------------------------------------------------*/
    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const current = this.get();
        let html = '<div class="privacy-panel">';
        html += '<h3>Latest Builder Display</h3>';
        html += '<p class="privacy-hint">Choose how the newest donation appears on the public dashboard.</p>';

        Object.entries(this.MODES).forEach(([key, mode]) => {
            const checked = (key === current) ? "checked" : "";
            html += `
                <label class="privacy-option">
                    <input type="radio" name="privacyMode" value="${key}" ${checked}>
                    <div>
                        <strong>${mode.label}</strong>
                        <small>${mode.description}</small>
                    </div>
                </label>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

        // Attach listeners
        container.querySelectorAll('input[name="privacyMode"]').forEach(radio => {
            radio.addEventListener("change", (e) => {
                PrivacySettings.set(e.target.value);
            });
        });
    }
};