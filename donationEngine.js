/*======================================
 BGH DONATION ENGINE
=======================================*/

function calculateStones(amount){

    const campaign=read(DB.keys.campaign);

    return Math.round(amount/campaign.stonePrice);

}

function generateDonationID(){

    return "DON"+Date.now();

}

function saveDonation(data){

    let donations=read(DB.keys.donations);

    data.id = generateDonationID();

data.stones = calculateStones(data.amount);

data.status = "APPROVED";

/*----------------------------------
Creation Date
----------------------------------*/

if (data.isHistorical && data.historicalDate) {

    data.created = new Date(data.historicalDate).toISOString();

} else {

    if(
    data.isHistorical &&
    data.historicalDate
){

    data.created =
    new Date(
        data.historicalDate
    ).toISOString();

}
else{

    data.created =
    new Date().toISOString();

}

}

    donations.push(data);

write(

    DB.keys.donations,

    donations

);

/*----------------------------------*
 * Synchronize Construction Progress
 *----------------------------------*/

if(

    typeof ConstructionProgressEngine !==

    "undefined"

){

    try{

        ConstructionProgressEngine.sync();

    }

    catch(err){

        console.error(

            "Construction Progress synchronization failed:",

            err

        );

    }

}

/*----------------------------------*
 * Refresh Church Visualization
 *----------------------------------*/

if (typeof updateConstructionVisual === "function") {
    try {
        updateConstructionVisual();
    } catch (err) {
        console.error("Visualization refresh failed:", err);
    }
}

logHistory(

    "Donation",

    data.donor +

    " donated KSh " +

    data.amount

);

/*----------------------------------
Notify Backup System
----------------------------------*/

if(

    typeof BackupMonitor !== "undefined"

){

    BackupMonitor.markDirty();

}

if(

    typeof BackupScheduler !== "undefined"

){

    BackupScheduler.restart();

}

/*----------------------------------
Notify Dashboard
----------------------------------*/

if(

    typeof refreshApplication === "function"

){

    refreshApplication();

}

return data;

}