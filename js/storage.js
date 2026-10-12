/*=========================================
 BGH STORAGE ENGINE v3.0
=========================================*/

const DB = {

    keys: {

        campaign: "bgh_campaign",

        donations: "bgh_donations",

        latestSnapshot: "BGH_LATEST_SNAPSHOT",

        groups: "bgh_groups",

        dailyGoal: "bgh_dailyGoal",

        dashboard: "bgh_dashboard",

        features: "bgh_features",

        history: "bgh_history",

        backupStatus: "bgh_backupStatus"

    }

};

/*==========================
 INITIALIZE DATABASE
==========================*/

function initializeDatabase() {

    if (!localStorage.getItem(DB.keys.campaign)) {

        localStorage.setItem(

            DB.keys.campaign,

            JSON.stringify({

                churchName: "",

                campaignName: "",

                target: 7500000,

                stonePrice: 50,

                openingBalance: 0

            })

        );

    }

    if (!localStorage.getItem(DB.keys.donations)) {

        localStorage.setItem(

            DB.keys.donations,

            JSON.stringify([])

        );

    }

    if (!localStorage.getItem(DB.keys.groups)) {

        localStorage.setItem(

            DB.keys.groups,

            JSON.stringify([

                "Zealots",

                "Beacons",

                "Zions",

                "Remnants",

                "Stewards",

                "Anonymous"

            ])

        );

    }

    if (!localStorage.getItem(DB.keys.dailyGoal)) {

        localStorage.setItem(

            DB.keys.dailyGoal,

            JSON.stringify({

                enabled:true,

                show:true,

                amount:150000

            })

        );

    }

    if (!localStorage.getItem(DB.keys.features)) {

        localStorage.setItem(

            DB.keys.features,

            JSON.stringify({

                showCampaign:true,

                showDaily:true,

                showHeroes:true,

                showLeaderboard:true,

                showRecent:true,

                showChurch:true

            })

        );

    }

    if (!localStorage.getItem(DB.keys.history)) {

        localStorage.setItem(

            DB.keys.history,

            JSON.stringify([])

        );

    }

    if(!localStorage.getItem(DB.keys.backupStatus)){

    localStorage.setItem(

        DB.keys.backupStatus,

        JSON.stringify({

            dirty:false,

            lastBackup:null

        })

    );

}

}

initializeDatabase();

/*==========================
 READ
==========================*/

function read(key){

    return JSON.parse(

        localStorage.getItem(key)

    );

}

/*==========================
 WRITE
==========================*/

function write(key,data){

    localStorage.setItem(

        key,

        JSON.stringify(data)

    );

}

/*==========================
 HISTORY LOG
==========================*/

function logHistory(action,details){

    let history=read(DB.keys.history);

    history.unshift({

        time:new Date().toLocaleString(),

        action,

        details

    });

    write(DB.keys.history,history);

}