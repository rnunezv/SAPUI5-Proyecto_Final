//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * 
     * @param {typeof sap.ui.core.mvc.Controller} Controller 
     */
    function (Controller) {

        "use strict";

        function onInit(){

        };


        var verEmp = Controller.extend("logaligroup.Empleados.controller.VerEmpleado", {});

        verEmp.prototype.onInit=onInit;
        return verEmp;

    });