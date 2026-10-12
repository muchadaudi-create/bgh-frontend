"use strict";

/*=========================================================
 BUILD GOD'S HOUSE
 SYNC PUBLIC DONATION
 Bridge between the public donation page and admin master record
 VERSION 1.0
=========================================================*/

const SyncPublicDonation = {

    /*-----------------------------------------------------
     INIT — wire up the form
    -----------------------------------------------------*/
    init() {
        const form = document.getElementById("syncDonationForm");
        if (!form) return;

        // Populate group dropdown
        this.populateGroups();

        // Default date = today
        const dateInput = document.getElementById("syncDate");
        if (dateInput) {
            dateInput.value = new Date().toISOString().substring(0, 10);
        }

        // Attach submit handler
        const self = this;
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            self.handleSubmit();
        });

        console.log("Sync Public Donation form ready.");
    },

    /*-----------------------------------------------------
     Populate group dropdown
    -----------------------------------------------------*/
    populateGroups() {
        const select = document.getElementById("syncGroup");
        if (!select) return;

        let groups = ["Zealots", "Beacons", "Zions", "Remnants", "Stewards", "Anonymous"];
        try {
            const stored = JSON.parse(localStorage.getItem("bgh_groups"));
            if (Array.isArray(stored) && stored.length > 0) groups = stored;
        } catch (e) {}

        select.innerHTML = '<option value="">— Select a group —</option>';
        groups.forEach(function (g) {
            const opt = document.createElement("option");
            opt.value = g;
            opt.textContent = g;
            select.appendChild(opt);
        });
    },

    /*-----------------------------------------------------
     HANDLE SUBMIT
    -----------------------------------------------------*/
       handleSubmit() {
        const statusEl = document.getElementById("syncStatus");

        const mpesaCode = document.getElementById("syncMpesaCode").value.trim().toUpperCase();
        const name = document.getElementById("syncName").value.trim();
        const phone = document.getElementById("syncPhone").value.trim();
        const amount = Number(document.getElementById("syncAmount").value);
        const group = document.getElementById("syncGroup").value || "Anonymous";
        const recipient = document.getElementById("syncRecipient").value.trim();
        const date = document.getElementById("syncDate").value;
        const comment = document.getElementById("syncComment").value.trim();

        // Validation
        if (!mpesaCode) {
            this.showStatus("⚠️ M-Pesa Code is required (from the donor's SMS).", "warning");
            return;
        }

        if (!name) {
            this.showStatus("⚠️ Donor name is required.", "warning");
            return;
        }

        if (!phone) {
            this.showStatus("⚠️ Phone number is required.", "warning");
            return;
        }

        if (!amount || amount <= 0) {
            this.showStatus("⚠️ Enter a valid amount.", "warning");
            return;
        }

        if (amount > 100000000) {
            this.showStatus("⚠️ Amount is too large.", "warning");
            return;
        }

        // Duplicate M-Pesa code check — cannot be bypassed
        const existing = this.findByReference(mpesaCode);
        if (existing) {
            this.showStatus("❌ M-Pesa Code \"" + mpesaCode + "\" already exists.", "error");
            alert(
                "Duplicate M-Pesa Code detected!\n\n" +
                "Code: " + mpesaCode + "\n" +
                "Donor: " + existing.donor + "\n" +
                "Amount: KSh " + Number(existing.amount).toLocaleString() + "\n\n" +
                "This payment has already been recorded."
            );
            return;
        }

        // Build donation
        const campaign = this.readCampaign();
        const stonePrice = Number(campaign.stonePrice || 50);
        const donation = {
            id: mpesaCode,
            mpesaCode: mpesaCode,
            donor: name,
            phone: phone,
            amount: amount,
            stones: Math.round(amount / stonePrice),
            group: group,
            comment: comment,
            contributionType: "PUBLIC_SYNCED",
            isHistorical: false,
            historicalDate: "",
            created: date ? new Date(date).toISOString() : new Date().toISOString(),
            status: "APPROVED",
            source: "admin_sync",
            syncedAt: new Date().toISOString(),
            forSomeoneElse: !!recipient,
            recipientName: recipient,
            recipientPhone: "",
            recipientGroup: "",
            countForDonor: true,
            countForGroup: true,
            countForDaily: true,
            countForCampaign: true
        };

        // Save
        try {
            const donations = this.readDonations();
            donations.push(donation);
            localStorage.setItem("bgh_donations", JSON.stringify(donations));
        } catch (err) {
            console.error("Save failed:", err);
            this.showStatus("❌ Could not save. Storage may be full.", "error");
            return;
        }

        // Refresh
        if (typeof BackupMonitor !== "undefined") BackupMonitor.markDirty();
        if (typeof BackupScheduler !== "undefined") BackupScheduler.restart();
        if (typeof refreshApplication === "function") refreshApplication();
        localStorage.setItem("BGH_REFRESH", Date.now().toString());

        this.showStatus(
            "✅ Recorded! " + mpesaCode + " · " + name + " · KSh " + amount.toLocaleString(),
            "success"
        );

        document.getElementById("syncDonationForm").reset();
        const dateInput = document.getElementById("syncDate");
        if (dateInput) dateInput.value = new Date().toISOString().substring(0, 10);

        const mpesaInput = document.getElementById("syncMpesaCode");
        if (mpesaInput) mpesaInput.focus();
    },

    /*-----------------------------------------------------
     HELPERS
    -----------------------------------------------------*/
    readCampaign() {
        try { return JSON.parse(localStorage.getItem("bgh_campaign")) || {}; }
        catch (e) { return {}; }
    },

    readDonations() {
        try { return JSON.parse(localStorage.getItem("bgh_donations")) || []; }
        catch (e) { return []; }
    },

    findByReference(ref) {
        const donations = this.readDonations();
        const lower = ref.toLowerCase();
        return donations.find(function (d) {
            return d.id && d.id.toLowerCase() === lower;
        }) || null;
    },

    showStatus(message, type) {
        const el = document.getElementById("syncStatus");
        if (!el) return;

        let color = "#333";
        let bg = "transparent";

        if (type === "success") {
            color = "#0f5132";
            bg = "#d1e7dd";
        } else if (type === "warning") {
            color = "#664d03";
            bg = "#fff3cd";
        } else if (type === "error") {
            color = "#842029";
            bg = "#f8d7da";
        }

        el.style.color = color;
        el.style.background = bg;
        el.style.padding = bg !== "transparent" ? "8px 12px" : "0";
        el.style.borderRadius = "6px";
        el.textContent = message;

        if (type === "success") {
            setTimeout(function () {
                el.textContent = "";
                el.style.background = "transparent";
            }, 5000);
        }
    }
};