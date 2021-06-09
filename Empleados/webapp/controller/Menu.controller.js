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

        function onInit() {

        };


        function onCrearEmpleado() {
            sap.m.MessageToast.show("Crear Empleado");
        };


        function onVerEmpleado() {
            sap.m.MessageToast.show("Ver Empleado");
        };

        var Menu = Controller.extend("logaligroup.Empleados.controller.Menu", {});

        Menu.prototype.onInit = onInit;
        Menu.prototype.onCrearEmpleado = onCrearEmpleado;
        Menu.prototype.onVerEmpleado = onVerEmpleado;
        return Menu;

    });