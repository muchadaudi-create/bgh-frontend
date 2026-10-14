"use strict";

/*=========================================================
 LIFE CM SANCTUARY PROJECT
 PUBLIC DONATION PAGE
=========================================================*/

(function () {

    const NAME_KEY_PREFIX = "bgh_donor_name_";
    const GROUP_KEY_PREFIX = "bgh_donor_group_";

    document.addEventListener("DOMContentLoaded", function () {

        /* ==========================================
           READ DATA HELPERS
           ========================================== */
        function readCampaign() {
            try { return JSON.parse(localStorage.getItem("bgh_campaign")) || {}; }
            catch (e) { return {}; }
        }

        function readDonations() {
            try { return JSON.parse(localStorage.getItem("bgh_donations")) || []; }
            catch (e) { return []; }
        }

        function readGroups() {
            try {
                const g = JSON.parse(localStorage.getItem("bgh_groups"));
                if (Array.isArray(g) && g.length > 0) return g;
            } catch (e) { }
            return ["Zealots", "Beacons", "Zions", "Remnants", "Stewards", "Anonymous"];
        }

        /* Check whether the group name should appear on the receipt */
        function groupVisibleOnReceipt() {
            try {
                const vis = JSON.parse(localStorage.getItem("bgh_public_visibility")) || {};
                return vis.receiptShowGroup !== false;
            } catch (e) {
                return true;
            }
        }

        /* ==========================================
           REFRESH SUMMARY
           ========================================== */
        function refreshSummary() {
            const campaign = readCampaign();
            const donations = readDonations();

            const opening = Number(campaign.openingBalance || 0);
            const target = Number(campaign.target || 7500000);

            const totalRaised = donations.reduce(function (sum, d) {
                return sum + Number(d.amount || 0);
            }, opening);

            const totalStones = donations.reduce(function (sum, d) {
                return sum + Number(d.stones || 0);
            }, 0);

            const today = new Date().toISOString().substring(0, 10);
            let todayRaised = 0;
            let todayBuilders = 0;
            donations.forEach(function (d) {
                if (d.created && d.created.substring(0, 10) === today) {
                    todayRaised += Number(d.amount || 0);
                    todayBuilders++;
                }
            });

            const percent = target > 0 ? (totalRaised / target) * 100 : 0;

            const elTotal = document.getElementById("totalRaisedDisplay");
            if (elTotal) elTotal.textContent = "KSh " + totalRaised.toLocaleString();

            const elTarget = document.getElementById("targetDisplay");
            if (elTarget) elTarget.textContent = "KSh " + target.toLocaleString();

            const elBar = document.getElementById("progressBar");
            if (elBar) elBar.style.width = Math.min(percent, 100) + "%";

            const elPct = document.getElementById("progressText");
            if (elPct) elPct.textContent = percent.toFixed(1) + "% Complete";

            const elToday = document.getElementById("todayRaised");
            if (elToday) elToday.textContent = "KSh " + todayRaised.toLocaleString();

            const elStones = document.getElementById("totalStones");
            if (elStones) elStones.textContent = totalStones.toLocaleString();

            const elBuilders = document.getElementById("todayBuilders");
            if (elBuilders) elBuilders.textContent = todayBuilders.toString();
        }

        /* ==========================================
           POPULATE GROUP DROPDOWNS
           ========================================== */
        function populateGroups() {
            const groups = readGroups();
            ["pubGroup", "recipientGroup"].forEach(function (id) {
                const select = document.getElementById(id);
                if (!select) return;
                select.innerHTML = '<option value="">— Select a group —</option>';
                groups.forEach(function (g) {
                    const opt = document.createElement("option");
                    opt.value = g;
                    opt.textContent = g;
                    select.appendChild(opt);
                });
            });
        }

        /* ==========================================
           STONE PREVIEW
           ========================================== */
        function updateStonePreview() {
            const amountInput = document.getElementById("pubAmount");
            if (!amountInput) return;
            const amount = Number(amountInput.value) || 0;
            const campaign = readCampaign();
            const stonePrice = Number(campaign.stonePrice || 50);
            const stones = amount > 0 ? Math.round(amount / stonePrice) : 0;
            const el = document.getElementById("pubStones");
            if (el) el.textContent = stones.toLocaleString();
        }

        /* ==========================================
           DATE STAMP
           ========================================== */
        function formatToday() {
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const months = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
            const now = new Date();
            return days[now.getDay()] + ", " + now.getDate() + " " +
                months[now.getMonth()] + " " + now.getFullYear();
        }

        /* ==========================================
           PEOPLE COUNT
           ========================================== */
        function updatePeopleCount() {
            const donations = readDonations();
            const distinct = new Set();
            donations.forEach(function (d) {
                if (d.phone) distinct.add("phone_" + d.phone);
                else if (d.donor && d.donor !== "Anonymous") distinct.add("name_" + d.donor);
                else distinct.add("anon_" + (d.id || Math.random()));
            });
            const el = document.getElementById("donatePeopleCount");
            if (el) el.textContent = distinct.size.toLocaleString();
        }

        /* ==========================================
           AUTO-FILL NAME FROM PHONE
           ========================================== */
        function setupPhoneAutofill() {
            const phoneInput = document.getElementById("pubPhone");
            const nameInput = document.getElementById("pubDonor");
            const groupSelect = document.getElementById("pubGroup");
            if (!phoneInput || !nameInput) return;

            phoneInput.addEventListener("blur", function () {
                const phone = phoneInput.value.trim();
                if (!phone) return;

                const savedName = localStorage.getItem(NAME_KEY_PREFIX + phone);
                const savedGroup = localStorage.getItem(GROUP_KEY_PREFIX + phone);

                if (savedName && !nameInput.value.trim()) {
                    nameInput.value = savedName;
                }
                if (savedGroup && groupSelect && !groupSelect.value) {
                    groupSelect.value = savedGroup;
                }
            });
        }

        /* ==========================================
           TOGGLE FORM
           ========================================== */
        function setupToggle() {
            const btn = document.getElementById("showDonationFormBtn");
            const wrapper = document.getElementById("donationFormWrapper");
            if (!btn || !wrapper) return;

            btn.addEventListener("click", function () {
                if (wrapper.style.display === "none" || wrapper.style.display === "") {
                    wrapper.style.display = "block";
                    btn.textContent = "✖ Hide Form";
                    setTimeout(function () {
                        wrapper.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 100);
                } else {
                    wrapper.style.display = "none";
                    btn.textContent = "✨ Contribute Now";
                }
            });
        }

        /* ==========================================
           TOGGLE "FOR SOMEONE ELSE"
           ========================================== */
        function setupForSomeoneToggle() {
            const cb = document.getElementById("pubForSomeone");
            const fields = document.getElementById("recipientFields");
            if (!cb || !fields) return;

            cb.addEventListener("change", function () {
                fields.style.display = cb.checked ? "block" : "none";
            });
        }

        /* ==========================================
           FORM SUBMIT
           ========================================== */
        function setupSubmit() {
            const form = document.getElementById("publicDonationForm");
            if (!form) return;

            form.addEventListener("submit", function (e) {
                e.preventDefault();

                const campaign = readCampaign();
                const stonePrice = Number(campaign.stonePrice || 50);

                const phone = document.getElementById("pubPhone").value.trim();
                const rawName = document.getElementById("pubDonor").value.trim();
                const rawAmount = Number(document.getElementById("pubAmount").value);
                const group = document.getElementById("pubGroup").value || "";
                const comment = document.getElementById("pubComment").value.trim();
                const isAnonymous = document.getElementById("pubAnonymous").checked;
                const forSomeoneElse = document.getElementById("pubForSomeone").checked;

                const recipientName = forSomeoneElse
                    ? document.getElementById("recipientName").value.trim()
                    : "";
                const recipientPhone = forSomeoneElse
                    ? document.getElementById("recipientPhone").value.trim()
                    : "";
                const recipientGroup = forSomeoneElse
                    ? document.getElementById("recipientGroup").value
                    : "";

                if (!phone) {
                    alert("Please enter your phone number.");
                    return;
                }
                if (!rawName && !isAnonymous) {
                    alert("Please enter your name (or check 'Keep me anonymous').");
                    return;
                }
                if (!rawAmount || rawAmount <= 0) {
                    alert("Please enter a valid contribution amount.");
                    return;
                }
                if (rawAmount > 100000000) {
                    alert("Contribution amount is too large. Please contact the church office.");
                    return;
                }
                if (forSomeoneElse && !recipientName) {
                    alert("Please enter the recipient's name (or uncheck 'Contribute on behalf of someone else').");
                    return;
                }

                const finalName = isAnonymous ? "Anonymous" : rawName;
                if (!isAnonymous && rawName) {
                    localStorage.setItem(NAME_KEY_PREFIX + phone, rawName);
                }
                if (group) {
                    localStorage.setItem(GROUP_KEY_PREFIX + phone, group);
                }

                const donation = {
                    id: "DON" + Date.now(),
                    donor: finalName,
                    phone: phone,
                    amount: rawAmount,
                    stones: Math.round(rawAmount / stonePrice),
                    group: group || "Anonymous",
                    comment: comment,
                    contributionType: "PUBLIC",
                    isHistorical: false,
                    historicalDate: "",
                    created: new Date().toISOString(),
                    status: "PENDING_SYNC",
                    source: "public_donate_page",
                    isAnonymous: isAnonymous,
                    forSomeoneElse: forSomeoneElse,
                    recipientName: recipientName,
                    recipientPhone: recipientPhone,
                    recipientGroup: recipientGroup,
                    countForDonor: !isAnonymous,
                    countForGroup: true,
                    countForDaily: true,
                    countForCampaign: true
                };

                try {
                    const donations = readDonations();
                    donations.push(donation);
                    localStorage.setItem("bgh_donations", JSON.stringify(donations));
                } catch (err) {
                    alert("Could not save your contribution. Please try again.");
                    console.error(err);
                    return;
                }

                /* ---- Populate Confirmation ---- */
                const confTitle = document.getElementById("confirmationTitle");
                if (confTitle) {
                    confTitle.textContent = isAnonymous
                        ? "✅ Thank You!"
                        : "✅ Thank You, " + finalName + "!";
                }

                const confAmount = document.getElementById("confAmount");
                if (confAmount) {
                    confAmount.textContent = "KSh " + rawAmount.toLocaleString();
                }

                const confStones = document.getElementById("confStones");
                if (confStones) {
                    confStones.textContent = donation.stones.toLocaleString();
                }

                const confRef = document.getElementById("confRef");
                if (confRef) confRef.textContent = donation.id;

                const confTime = document.getElementById("confTime");
                if (confTime) {
                    confTime.textContent = new Date(donation.created).toLocaleString();
                }

                /* ---- Group line (respect admin toggle) ---- */
                const showGroupOnReceipt = groupVisibleOnReceipt();
                const confGroupLine = document.getElementById("confGroupLine");
                const confGroup = document.getElementById("confGroup");

                if (confGroupLine && confGroup) {
                    if (showGroupOnReceipt && group) {
                        confGroupLine.style.display = "";
                        confGroup.textContent = group;
                    } else {
                        confGroupLine.style.display = "none";
                    }
                }

                /* ---- Recipient line ---- */
                const recipientLine = document.getElementById("confRecipientLine");
                if (recipientLine) {
                    if (forSomeoneElse && recipientName) {
                        const recipientText = recipientName +
                            (recipientGroup && showGroupOnReceipt ? " (" + recipientGroup + ")" : "");
                        const recipientEl = document.getElementById("confRecipient");
                        if (recipientEl) recipientEl.textContent = recipientText;
                        recipientLine.style.display = "block";
                    } else {
                        recipientLine.style.display = "none";
                    }
                }

                window.__lastDonation = donation;

                const formSection = document.getElementById("donateFormSection");
                if (formSection) formSection.style.display = "none";
                const confCard = document.getElementById("confirmationCard");
                if (confCard) {
                    confCard.style.display = "block";
                    confCard.scrollIntoView({ behavior: "smooth" });
                }

                // Update M-Pesa amount label
                const mpesaAmountLabel = document.getElementById("mpesaAmountLabel");
                if (mpesaAmountLabel) {
                    mpesaAmountLabel.textContent = rawAmount.toLocaleString();
                }

                updatePeopleCount();
            });
        }

        /* ==========================================
           DOWNLOAD RECEIPT AS IMAGE
           ========================================== */
        function setupDownloadReceipt() {
            const btn = document.getElementById("downloadReceiptBtn");
            if (!btn) return;

            btn.addEventListener("click", function () {
                const card = document.getElementById("receiptCaptureArea");
                if (!card) return;

                if (typeof html2canvas === "undefined") {
                    alert("Image export is not available. Please take a screenshot manually.");
                    return;
                }

                const originalText = btn.textContent;
                btn.textContent = "⏳ Generating...";
                btn.disabled = true;

                html2canvas(card, {
                    backgroundColor: "#ffffff",
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    windowWidth: card.scrollWidth,
                    windowHeight: card.scrollHeight
                }).then(function (canvas) {
                    const dataUrl = canvas.toDataURL("image/png");
                    const link = document.createElement("a");
                    const d = window.__lastDonation || {};
                    const safeRef = (d.id || "receipt").toString().replace(/[^a-zA-Z0-9]/g, "_");
                    link.download = "LifeCM_Contribution_" + safeRef + ".png";
                    link.href = dataUrl;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    btn.textContent = "✅ Downloaded!";
                    setTimeout(function () {
                        btn.textContent = originalText;
                        btn.disabled = false;
                    }, 2000);
                }).catch(function (err) {
                    console.error("html2canvas error:", err);
                    alert("Could not generate image. Please take a screenshot manually.");
                    btn.textContent = originalText;
                    btn.disabled = false;
                });
            });
        }

        /* ==========================================
           NEW CONTRIBUTION
           ========================================== */
        function setupNewDonation() {
            const btn = document.getElementById("pubNewDonationBtn");
            if (!btn) return;

            btn.addEventListener("click", function () {
                document.getElementById("publicDonationForm").reset();
                document.getElementById("pubStones").textContent = "0";
                document.getElementById("recipientFields").style.display = "none";
                document.getElementById("confirmationCard").style.display = "none";
                document.getElementById("donateFormSection").style.display = "block";
                document.getElementById("donationFormWrapper").style.display = "none";
                document.getElementById("showDonationFormBtn").textContent = "✨ Contribute Now";

                refreshSummary();
                updatePeopleCount();
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }

                /* ==========================================
            MPESA PAYMENT
            ========================================== */
        function setupMpesaPayment() {
    const btn = document.getElementById("mpesaPayBtn");
    const amountInput = document.getElementById("pubAmount");
    const mpesaAmountLabel = document.getElementById("mpesaAmountLabel");

    if (!btn || !amountInput || !mpesaAmountLabel) return;

    // Live update the button label as user types
    amountInput.addEventListener("input", function () {
        const amount = Number(amountInput.value) || 0;
        mpesaAmountLabel.textContent = amount.toLocaleString();
    });

    btn.addEventListener("click", async function () {
        const phone = document.getElementById("pubPhone").value.trim();
        const amount = document.getElementById("pubAmount").value;
        const statusEl = document.getElementById("mpesaStatus");

        // Validation
        if (!phone) {
            alert("Please enter your phone number above.");
            return;
        }
        if (!amount || amount <= 0) {
            alert("Please enter a valid amount above.");
            return;
        }

        // Set loading state
        btn.disabled = true;
        btn.textContent = "⏳ Sending prompt...";
        statusEl.textContent = "Connecting to Safaricom...";
        statusEl.style.color = "#0d47a1";

        try {
            const response = await fetch('https://ripeness-sandbag-whacking.ngrok-free.dev/api/mpesa/callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: phone, amount: amount })
            });

            const data = await response.json();

            if (data.ResponseCode === "0") {
                const checkoutId = data.CheckoutRequestID;
                statusEl.textContent = "Check your phone for the M-Pesa prompt...";

                // Start Polling
                let pollCount = 0;
                const maxPolls = 20; // 60 seconds

                const pollInterval = setInterval(async () => {
                    pollCount++;
                    try {
                        const statusResponse = await fetch(`https://ripeness-sandbag-whacking.ngrok-free.dev/api/mpesa/callback`);
                        const statusData = await statusResponse.json();

                        if (statusData.status === 'SUCCESS') {
                            clearInterval(pollInterval);
                            statusEl.textContent = `✅ Payment Successful! Receipt: ${statusData.receipt}`;
                            statusEl.style.color = "green";
                            btn.textContent = "Contribution Complete!";
                        } else if (statusData.status === 'FAILED') {
                            clearInterval(pollInterval);
                            statusEl.textContent = `❌ Failed: ${statusData.message}`;
                            statusEl.style.color = "red";
                            btn.disabled = false;
                            btn.textContent = `Pay KSh ${Number(amount).toLocaleString()} via M-Pesa`;
                        } else if (pollCount >= maxPolls) {
                            clearInterval(pollInterval);
                            statusEl.textContent = "⏳ Timed out. Please check your M-Pesa messages.";
                            statusEl.style.color = "orange";
                            btn.disabled = false;
                            btn.textContent = `Pay KSh ${Number(amount).toLocaleString()} via M-Pesa`;
                        }
                    } catch (err) {
                        console.error("Polling error:", err);
                    }
                }, 3000); // Poll every 3 seconds

            } else {
                throw new Error(data.ResponseDescription || data.error || "Failed to initiate");
            }
        } catch (error) {
            console.error("FETCH ERROR:", error);
            statusEl.textContent = `❌ Failed to send prompt: ${error.message}`;
            statusEl.style.color = "red";
            btn.disabled = false;
            btn.textContent = `Pay KSh ${Number(amount).toLocaleString()} via M-Pesa`;
        }
    });
}


        // ==========================================
        // INITIALIZE ALL COMPONENTS
        // ==========================================
        refreshSummary();
        populateGroups();
        updateStonePreview();
        updatePeopleCount();
        setupToggle();
        setupForSomeoneToggle();
        setupPhoneAutofill();
        setupSubmit();
        setupDownloadReceipt();
        setupNewDonation();
        setupMpesaPayment();

        console.log("Public donation page ready.");
    }); // Closes the DOMContentLoaded callback

})(); // Closes the outer IIFE wrapper