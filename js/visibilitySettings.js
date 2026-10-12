"use strict";

/*=========================================================
 BUILD GOD'S HOUSE
 PUBLIC DASHBOARD VISIBILITY SETTINGS
 VERSION 1.0
=========================================================*/

const VisibilitySettings = {

    KEY: "bgh_public_visibility",

    /*-----------------------------------------------------
     DEFAULTS — all visible except Backup Centre
    -----------------------------------------------------*/
    DEFAULTS: {
        hero:                 true,
        campaignRaised:       true,
        todayBuild:           true,
        totalStones:          true,
        todayStones:          true,
        todayBuilders:        true,
        latestBuilder:        true,
        churchSVG:            true,
        overallConstruction:  true,
        currentStage:         true,
        performanceCentre:    true,
        campaignMilestone:    true,
        backupCentre:         false,
        receiptShowGroup:     true
    },

    /*-----------------------------------------------------
     Human-readable labels for the admin panel
    -----------------------------------------------------*/
    LABELS: {
        hero:                 "🏛 Church Hero Photo",
        campaignRaised:       "💰 Campaign Raised",
        todayBuild:           "📅 Today's Build",
        totalStones:          "🧱 Total Stones",
        todayStones:          "🧱 Today's Stones",
        todayBuilders:        "👤 Today's Builders",
        latestBuilder:        "🏆 Latest Builder",
        churchSVG:            "🏗 Church Construction Visualization",
        overallConstruction:  "📊 Overall Construction Progress",
        currentStage:         "🎯 Current Stage Label",
        performanceCentre:    "🏅 Today's Performance Centre",
        campaignMilestone:    "🏛 Campaign Milestone",
        backupCentre:         "💾 Backup Operations Centre (Admin)",
        receiptShowGroup:     "🏷 Show Group Name on Receipt"
    },

    /*-----------------------------------------------------
     READ CURRENT SETTINGS (merged with defaults)
    -----------------------------------------------------*/
    get() {
        let stored = {};
        try {
            const raw = localStorage.getItem(this.KEY);
            if (raw) stored = JSON.parse(raw) || {};
        } catch (e) {
            stored = {};
        }
        return Object.assign({}, this.DEFAULTS, stored);
    },

    /*-----------------------------------------------------
     SET ONE KEY
    -----------------------------------------------------*/
    set(key, value) {
        if (!this.DEFAULTS.hasOwnProperty(key)) return false;
        const current = this.get();
        current[key] = !!value;
        localStorage.setItem(this.KEY, JSON.stringify(current));
        return true;
    },

    /*-----------------------------------------------------
     SET ALL AT ONCE
    -----------------------------------------------------*/
    setAll(obj) {
        const current = this.get();
        Object.keys(obj).forEach(k => {
            if (this.DEFAULTS.hasOwnProperty(k)) {
                current[k] = !!obj[k];
            }
        });
        localStorage.setItem(this.KEY, JSON.stringify(current));
    },

    /*-----------------------------------------------------
     RESET TO DEFAULTS
    -----------------------------------------------------*/
    reset() {
        localStorage.setItem(this.KEY, JSON.stringify(this.DEFAULTS));
    },

    /*-----------------------------------------------------
     APPLY SETTINGS TO THE PUBLIC DASHBOARD
     Hides any [data-visibility] element whose key is false
    -----------------------------------------------------*/
    apply() {
        const settings = this.get();
        document.querySelectorAll("[data-visibility]").forEach(el => {
            const key = el.getAttribute("data-visibility");
            if (!settings.hasOwnProperty(key)) return;
            el.style.display = settings[key] ? "" : "none";
        });
    },

    /*-----------------------------------------------------
     RENDER ADMIN PANEL
    -----------------------------------------------------*/
    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const settings = this.get();

        let html = `
            <div class="visibility-panel">
                <h3>👁 Public Dashboard Visibility</h3>
                <p class="visibility-hint">
                    Toggle which sections appear on the public-facing dashboard.
                    Changes take effect immediately on next dashboard load.
                </p>
                <div class="visibility-grid">
        `;

        Object.keys(this.DEFAULTS).forEach(key => {
            const label = this.LABELS[key] || key;
            const checked = settings[key] ? "checked" : "";
            html += `
                <label class="visibility-item">
                    <input type="checkbox" data-vis-key="${key}" ${checked}>
                    <span>${label}</span>
                </label>
            `;
        });

        html += `
                </div>
                <div style="margin-top:16px; display:flex; gap:8px;">
                    <button id="visSaveBtn" style="flex:1; padding:10px; background:#1a5fb4; color:#fff; border:none; border-radius:6px; font-weight:600; cursor:pointer;">
                        💾 Save Visibility
                    </button>
                    <button id="visResetBtn" style="padding:10px; background:#fff; color:#1a5fb4; border:1px solid #1a5fb4; border-radius:6px; cursor:pointer;">
                        Reset to Defaults
                    </button>
                </div>
                <p style="margin:10px 0 0; font-size:12px; color:#666; text-align:center;">
                    <a href="index.html" target="_blank" style="color:#1a5fb4;">Preview Dashboard →</a>
                </p>
            </div>
        `;

        container.innerHTML = html;

        // Attach events — persist on each toggle
        container.querySelectorAll('input[data-vis-key]').forEach(cb => {
            cb.addEventListener("change", e => {
                VisibilitySettings.set(e.target.getAttribute("data-vis-key"), e.target.checked);
            });
        });

        const saveBtn = document.getElementById("visSaveBtn");
        if (saveBtn) {
            saveBtn.onclick = function () {
                alert("Visibility settings saved.");
            };
        }

        const resetBtn = document.getElementById("visResetBtn");
        if (resetBtn) {
            resetBtn.onclick = function () {
                if (!confirm("Reset all visibility settings to defaults?")) return;
                VisibilitySettings.reset();
                VisibilitySettings.render(containerId);
            };
        }
    }
};