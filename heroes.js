/*=========================================================
 BUILD GOD'S HOUSE (BGH)
 HEROES ENGINE v2.0
=========================================================*/

"use strict";

/*---------------------------------------------------------
INDIVIDUAL HEROES
---------------------------------------------------------*/
function calculateIndividualHeroes(donations){

    const today =
        new Date().toISOString().substring(0,10);

    return donations

        .filter(function(d){

            return d.created &&
                   d.created.substring(0,10)===today;

        })

        .sort(function(a,b){

            return Number(b.amount)-Number(a.amount);

        });

}

/*---------------------------------------------------------
GROUP HEROES
---------------------------------------------------------*/
function calculateGroupHeroes(donations){

    const today =
        new Date().toISOString().substring(0,10);

    const groups={};

    donations.forEach(function(d){

        if(!d.created) return;

        if(d.created.substring(0,10)!==today) return;

        const group=d.group || "Unknown";

        if(!groups[group]){

            groups[group]={

                group:group,

                amount:0,

                builders:0

            };

        }

        groups[group].amount+=Number(d.amount||0);

        groups[group].builders++;

    });

    return Object.values(groups)

        .sort(function(a,b){

            return b.amount-a.amount;

        });

}/*---------------------------------------------------------
RENDER INDIVIDUALS
---------------------------------------------------------*/
function renderIndividuals(donations){

    const heroes =
        calculateIndividualHeroes(donations);

    let html = "";

    html += "<table class='performanceTable'>";

    html += "<tr>";

    html += "<th>#</th>";

    html += "<th>Donor</th>";

    html += "<th>Amount</th>";

    html += "</tr>";

    heroes.forEach(function(h,index){

        html += "<tr>";

        html += "<td>"+(index+1)+"</td>";

        html += "<td>"+h.donor+"</td>";

        html += "<td>KSh "+Number(h.amount).toLocaleString()+"</td>";

        html += "</tr>";

    });

    html += "</table>";

    return html;

}

/*---------------------------------------------------------
RENDER GROUPS
---------------------------------------------------------*/
function renderGroups(donations){

    const groups =
        calculateGroupHeroes(donations);

    let html = "";

    html += "<table class='performanceTable'>";

    html += "<tr>";

    html += "<th>Group</th>";

    html += "<th>Builders</th>";

    html += "<th>Raised</th>";

    html += "</tr>";

    groups.forEach(function(g){

        html += "<tr>";

        html += "<td>"+g.group+"</td>";

        html += "<td>"+g.builders+"</td>";

        html += "<td>KSh "+g.amount.toLocaleString()+"</td>";

        html += "</tr>";

    });

    html += "</table>";

    return html;

}

/*---------------------------------------------------------
RENDER BOTH
---------------------------------------------------------*/
function renderBoth(donations){

    return (
        "<h3>👤 Individuals</h3>" +
        renderIndividuals(donations) +
        "<br><br>" +
        "<h3>👥 Groups</h3>" +
        renderGroups(donations)
    );

}

/*---------------------------------------------------------
PERFORMANCE CENTRE
---------------------------------------------------------*/
function renderPerformanceCentre(mode, donations){

    const area =
        document.getElementById("performanceArea");

    if(!area) return;

    switch(mode){

        case "GROUP":

            area.innerHTML =
                renderGroups(donations);

            break;

        case "BOTH":

            area.innerHTML =
                renderBoth(donations);

            break;

        default:

            area.innerHTML =
                renderIndividuals(donations);

    }

}

/*---------------------------------------------------------
PERFORMANCE BUTTONS
---------------------------------------------------------*/

function initializePerformanceControls(donations){

    const btnIndividuals =
        document.getElementById("showIndividuals");

    const btnGroups =
        document.getElementById("showGroups");

    const btnBoth =
        document.getElementById("showBoth");

    if(btnIndividuals){

        btnIndividuals.onclick=function(){

            renderPerformanceCentre("INDIVIDUAL", donations);

        };

    }

    if(btnGroups){

        btnGroups.onclick=function(){

            renderPerformanceCentre("GROUP", donations);

        };

    }

    if(btnBoth){

        btnBoth.onclick=function(){

            renderPerformanceCentre("BOTH", donations);

        };

    }

}