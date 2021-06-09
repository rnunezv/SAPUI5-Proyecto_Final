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

        
        var crearEmp = Controller.extend("logaligroup.Empleados.controller.CrearEmpleado", {});

        crearEmp.prototype.onInit=onInit;
        return crearEmp;

    });