/*=========================================
 BGH STATISTICS ENGINE v3.0.1
=========================================*/

function getTodayDate() {

    const d = new Date();

    return d.getFullYear() + "-" +
        String(d.getMonth() + 1).padStart(2, "0") + "-" +
        String(d.getDate()).padStart(2, "0");

}

function getCampaignTotals() {

    const campaign = read(DB.keys.campaign);

    const donations = read(DB.keys.donations);

    let totalAmount = campaign.openingBalance;

    let totalStones = 0;

    donations.forEach(function(d) {

        totalAmount += Number(d.amount);

        totalStones += Number(d.stones);

    });

    return {

        amount: totalAmount,

        stones: totalStones,

        percent: (totalAmount / campaign.target) * 100

    };

}

function getTodayTotals() {

    const donations = read(DB.keys.donations);

    const today = getTodayDate();

    let amount = 0;

    let stones = 0;

    let builders = 0;

    donations.forEach(function(d) {

        if (d.created.substring(0, 10) === today) {

            amount += Number(d.amount);

            stones += Number(d.stones);

            builders++;

        }

    });

    return {

        amount,

        stones,

        builders

    };

}