"use strict";

/*=========================================================
 BUILD GOD'S HOUSE
 EVENT NOTIFICATION ENGINE
 STB-002B
=========================================================*/

const EventBus = {

    emit(eventName, data = {}) {

        window.dispatchEvent(

            new CustomEvent(

                eventName,

                {

                    detail: data

                }

            )

        );

    },

    listen(eventName, callback) {

        window.addEventListener(

            eventName,

            callback

        );

    }

};