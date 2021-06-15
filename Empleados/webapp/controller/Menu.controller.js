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

        function onAfterRendering() {

            // Error en el framework: Al agregar la dirección URL de "Firmar pedidos", el componente GenericTile debería 
            // navegar directamente a dicha URL, // pero no funciona en la versión 1.78. Por tanto, una solución encontrada 
            // es eliminando la propiedad id del componente por jquery
            var genericTileFirmarPedido = this.byId("tileFirmarPedido");

            //Id del dom
            var idGenericTileFirmarPedido = genericTileFirmarPedido.getId();

            //Se vacía el id
            jQuery("#" + idGenericTileFirmarPedido)[0].id = "";
        };


        function onCrearEmpleado() {

            // Obtener las rutas de la aplicación
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            // Navegar hacia vista Crear Empleado
            oRouter.navTo("RouteCrearEmpleado");
        };


        function onVerEmpleado() {

            // Obtener las rutas de la aplicación
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            // Navegar hacia vista Ver Empleado
            oRouter.navTo("RouteVerEmpleado");
        };


        var Menu = Controller.extend("logaligroup.Empleados.controller.Menu", {});

        Menu.prototype.onInit = onInit;
        Menu.prototype.onAfterRendering = onAfterRendering;
        Menu.prototype.onCrearEmpleado = onCrearEmpleado;
        Menu.prototype.onVerEmpleado = onVerEmpleado;

        return Menu;

    });