//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/UploadCollectionParameter",
    "sap/m/MessageToast"
],
    /**
     * 
     * @param {typeof sap.ui.core.mvc.Controller} Controller 
     * @param {typeof sap.ui.model.Filter} Filter 
     * @param {typeof sap.ui.model.FilterOperator} FilterOperator 
     * @param {typeof sap.m.UploadCollectionParameter} UploadCollectionParameter 
     */
    function (Controller, MessageBox, Filter, FilterOperator, UploadCollectionParameter, MessageToast) {

        "use strict";

        function onInit() {
            this._splitApp = this.getView().byId("splitApp");
        };

        function onAfterRendering() {

        };

        // Funcion para navegar a la vista del Menu
        function onNavBack() {

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            // Se navega hacia la vista del Menú
            oRouter.navTo("RouteMenu", {}, true);

        };


        // Funcion para buscar Empleados realizando un filtro
        function onFiltrarEmpleado(oEvent) {

            var filters = [];
            var searchField = oEvent.getSource().getValue();

            if (searchField) {

                filters.push(new Filter("LastName", FilterOperator.Contains, searchField));

                // Filtro para buscar empleados que cumplan aguno de los criterios (OR)
                // var filters = new Filter({
                //     filters: [
                //         new Filter({
                //             path: "FirstName",
                //             operator: FilterOperator.Contains,
                //             value1: searchField
                //         }),
                //         new Filter({
                //             path: "LastName",
                //             operator: FilterOperator.Contains,
                //             value1: searchField
                //         }),
                //         new Filter({
                //             path: "Dni",
                //             operator: FilterOperator.Contains,
                //             value1: searchField
                //         })
                //     ],
                //     and: false
                // });

            }

            var oList = this.getView().byId("listaEmpleados");
            var oBinding = oList.getBinding("items");
            oBinding.filter(filters);

        };


        // Funcion para Buscar la informacion del Empleado seleccionado
        function onBuscarEmpleado(oEvent) {

            //Se navega a la pagina del detalle del empleado
            this._splitApp.to(this.createId("detailEmpleadoPage"));

            var context = oEvent.getParameter("listItem").getBindingContext("odataGestionModel");

            //Se almacena el usuario seleccionado
            this.employeeId = context.getProperty("EmployeeId");
            var detailEmpleadoPage = this.getView().byId("detailEmpleadoPage");

            //Se agrega a la vista la entidad Users y las claves del id del empleado y el id del alumno
            detailEmpleadoPage.bindElement("odataGestionModel>/Users(EmployeeId='" + this.employeeId + "',SapId='" + this.getOwnerComponent().SapId + "')");



            // Lectura de archivos del empleado
            this.byId("uploadFicheros").bindAggregation("items", {
                path: "odataGestionModel>/Attachments",
                filters: [
                    new Filter("SapId", FilterOperator.EQ, this.getOwnerComponent().SapId),
                    new Filter("EmployeeId", FilterOperator.EQ, this.employeeId)
                ],
                template: new sap.m.UploadCollectionItem({
                    documentId: "{odataGestionModel>AttId}",
                    visibleEdit: false,
                    fileName: "{odataGestionModel>DocName}"
                }).attachPress(this.downloadFile)
            });

        };



        // Funcion para dar de Baja a un empleado
        function onDarBaja() {

            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            var splitApp = this._splitApp;
            var detailSeleccionPage = this.createId("detailSeleccionPage");
            var oModel = this.getView().getModel("odataGestionModel");
            var sapId = this.getOwnerComponent().SapId;
            var employeeId = this.employeeId;
            var oList = this.getView().byId("listaEmpleados");
            var oBinding = oList.getBinding("items");


            sap.m.MessageBox.confirm(oResourceBundle.getText("confirmarDarBaja"), {
                onClose: function (oAction) {
                    if (oAction == "OK") {

                        oModel.remove("/Users(EmployeeId='" + employeeId + "',SapId='" + sapId + "')", {
                            success: function (data) {
                                oBinding.refresh();
                                sap.m.MessageToast.show(oResourceBundle.getText("usuarioEliminado"));
                                splitApp.to(detailSeleccionPage);
                            }.bind(this),
                            error: function () {

                            }.bind(this)
                        });


                    }
                }
            });

        };


        // Funcion para ascender a un empleado
        function onAscender() {

            var oJSONModel = new sap.ui.model.json.JSONModel({});

            // Si el dialogo no ha sido vreado se crea uno nuevo
            if (!this.ascenderDialog) {

                this.ascenderDialog = sap.ui.xmlfragment("logaligroup/Empleados/fragment/AscenderEmpleado", this);
                this.getView().addDependent(this.ascenderDialog);
            }

            this.ascenderDialog.setModel(oJSONModel, "nuevoAscenso");
            this.ascenderDialog.open();

        };


        function onAceptarAscender() {

            
            var nuevoAscenso = this.ascenderDialog.getModel("nuevoAscenso");            
            var odata = nuevoAscenso.getData();
           
            var body = {
                Ammount: odata.Ammount,
                CreationDate: odata.CreationDate,
                Comments: odata.Comments,
                SapId: this.getOwnerComponent().SapId,
                EmployeeId: this.employeeId
            };

            this.getView().setBusy(true);
            this.getView().getModel("odataGestionModel").create("/Salaries", body, {
                success: function () {
                    this.getView().setBusy(false);
                    sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("ascensoCorrecto"));
                    this.onCancelarAscender();
                }.bind(this),
                error: function () {
                    this.getView().setBusy(false);
                    sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("ascensoIncorrecto"));
                }.bind(this)
            });

        };


        function onCancelarAscender() {
            this.ascenderDialog.close();
        };


        // Funciones para el manejo del componente UploadCollection

        function onFileChange(oEvent) {

            var oUploadCollection = oEvent.getSource();

            // Header Token CSRF
            var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
                name: "x-csrf-token",
                value: this.getView().getModel("odataGestionModel").getSecurityToken()
            });

            oUploadCollection.addHeaderParameter(oCustomerHeaderToken);

        };


        function onFileBeforeUploadStarts(oEvent) {

            var fileName = oEvent.getParameter("fileName");
            var SapId = this.getOwnerComponent().SapId;

            var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
                name: "slug",
                value: SapId + ";" + this.employeeId + ";" + fileName
            });

            oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);

        };


        function onFileUploadComplete(oEvent) {
            oEvent.getSource().getBinding("items").refresh();
        };


        function onFileDeleted(oEvent) {

            var oUploadCollection = oEvent.getSource();
            var sPath = oEvent.getParameter("item").getBindingContext("odataGestionModel").getPath();
            this.getView().getModel("odataGestionModel").remove(sPath, {
                success: function () {
                    oUploadCollection.getBinding("items").refresh();
                },
                error: function () {

                }
            });
        };

        function downloadFile(oEvent) {

            var sPath = oEvent.getSource().getBindingContext("odataGestionModel").getPath();
            window.open("/sap/opu/odata/sap/ZEMPLOYEES_SRV" + sPath + "/$value");
        };




        var verEmp = Controller.extend("logaligroup.Empleados.controller.VerEmpleado", {});

        verEmp.prototype.onInit = onInit;
        verEmp.onAfterRendering = onAfterRendering;
        verEmp.prototype.onNavBack = onNavBack;
        verEmp.prototype.onFiltrarEmpleado = onFiltrarEmpleado;
        verEmp.prototype.onBuscarEmpleado = onBuscarEmpleado;
        verEmp.prototype.onDarBaja = onDarBaja;
        verEmp.prototype.onAscender = onAscender;
        verEmp.prototype.onAceptarAscender = onAceptarAscender;
        verEmp.prototype.onCancelarAscender = onCancelarAscender;
        verEmp.prototype.onFileChange = onFileChange;
        verEmp.prototype.onFileBeforeUploadStarts = onFileBeforeUploadStarts;
        verEmp.prototype.onFileUploadComplete = onFileUploadComplete;
        verEmp.prototype.onFileDeleted = onFileDeleted;
        verEmp.prototype.downloadFile = downloadFile;

        return verEmp;

    });