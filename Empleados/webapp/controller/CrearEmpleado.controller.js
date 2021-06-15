//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/UploadCollectionParameter"
],
    /**
     * 
     * @param {typeof sap.ui.core.mvc.Controller} Controller 
     * @param {typeof sap.m.UploadCollectionParameter} UploadCollectionParameter
     */
    function (Controller, MessageBox, UploadCollectionParameter) {

        "use strict";

        function onInit() {

        };

        function onBeforeRendering() {

            // Se obtiene el Wizard
            this._wizard = this.getView().byId("wizard");

            // Se crea y asigna el modelo de datos JSON a la vista
            this._model = new sap.ui.model.json.JSONModel({});
            this.getView().setModel(this._model);

            // Se inicializa los pasos del wizard
            var oPrimerPaso = this._wizard.getSteps()[0];
            this._wizard.discardProgress(oPrimerPaso);

            // scroll to top
            this._wizard.goToStep(oPrimerPaso);

            // Se invalida el Primer Paso
            oPrimerPaso.setValidated(false);

        };


        // Funcion para Cancelar vista actual y volver al menu principal.
        // Al cancelar se inicializa el modelo, se setea el wizard al primer paso
        // y se navega en el contenedor del wizard a la primera pagina (Pasos)
        function onCancelar() {

            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            var wizardNavContainer = this.getView().byId("wizardContainer");
            var wizardPage = this.getView().byId("wizardPage")
            var wizard = this._wizard = this.getView().byId("wizard");
            var tipoEmpleadoStep = this.getView().byId("tipoEmpleadoStep");
            var oModel = this._model;

            sap.m.MessageBox.confirm(oResourceBundle.getText("confirmaCancelar"), {
                onClose: function (oAction) {
                    if (oAction == "OK") {
                        
                        wizard.discardProgress(tipoEmpleadoStep);
                        wizard.goToStep(tipoEmpleadoStep);
                        tipoEmpleadoStep.setValidated(false);
                        wizardNavContainer.to(wizardPage);
                        oModel.setData({});

                        // Se navega hacia la vista del Menú
                        oRouter.navTo("RouteMenu", {}, true);
                    }
                }
            });
        };


        function onPaso2(oEvent) {

            // Paso 1
            var tipoEmpleadoStep = this.getView().byId("tipoEmpleadoStep");

            //Paso 2
            var datosEmpleadoStep = this.getView().byId("datosEmpleadoStep");

            // Se obtiene el tipo de empleado seleccionado
            var oSource = oEvent.getSource();
            var tipoEmpleado = oSource.data("tipoEmpleado");

            // Sueldo y tipo de empleado
            var sueldo, tipo;


            // Se asigna Sueldo y Codigo de tipo de empleado segun el tipo de empleado
            switch (tipoEmpleado) {
                case "interno":
                    sueldo = 24000;
                    tipo = "0";
                    break;
                case "autonomo":
                    sueldo = 400;
                    tipo = "1";
                    break;
                case "gerente":
                    sueldo = 70000;
                    tipo = "2";
                    break;
                default:
                    break;
            }


            // Se actualiza el modelo de acuerdo al sueldo y tipo del empleado seleccionado
            this._model.setData({
                TipoEmp: tipoEmpleado,
                Tipo: tipo,
                Sueldo: sueldo,
                FirstNameState: "None",
                LastNameState: "None",
                DniState: "None",
                CreationDateState: "None"
            });


            //Se comprueba si se está en el paso 1, ya que se debe usar la función "nextStep" para activar el paso 2.
            if (this._wizard.getCurrentStep() == tipoEmpleadoStep.getId()) {
                this._wizard.nextStep();
            } else {
                // En caso de que ya se encuentre activo el paso 2, se navega directamente a este paso 
                this._wizard.goToStep(datosEmpleadoStep);
            }


        };


        function onValidarDatosEmpleado(oEvent, callback) {

            var oDataModel = this._model.getData();

            var datosValidos = true;

            // Validación Nombre
            if (!oDataModel.FirstName) {
                oDataModel.FirstNameState = "Error";
                datosValidos = false;
            } else {
                oDataModel.FirstNameState = "None";
            }


            // Validación Apellidos
            if (!oDataModel.LastName) {
                oDataModel.LastNameState = "Error";
                datosValidos = false;
            } else {
                oDataModel.LastNameState = "None";
            }

            // Validación DNI
            if (!oDataModel.Dni) {
                oDataModel.DniState = "Error";
                datosValidos = false;
            } else {
                oDataModel.DniState = "None";
            }

            // Validación Fecha de incorporacion
            if (!oDataModel.CreationDate) {
                oDataModel.CreationDateState = "Error";
                datosValidos = false;
            } else {
                oDataModel.CreationDateState = "None";
            }

            // Si todos los campos obligatorios son validos se valiada el Paso 2
            if (datosValidos) {
                this._wizard.validateStep(this.byId("datosEmpleadoStep"));
            } else {
                this._wizard.invalidateStep(this.byId("datosEmpleadoStep"));
            }

            // Si hay callback se devuelve el valor datosValidos
            if (callback) {
                callback(datosValidos);
            }

            this._model.setData(oDataModel);

        };


        function onValidarDNI(oEvent) {

            var oDataModel = this._model.getData();

            if (oDataModel.TipoEmp != "autonomo") {

                var oSource = oEvent.getSource();
                var dni = oSource.getValue();

                var number;
                var letter;
                var letterList;
                var regularExp = /^\d{8}[a-zA-Z]$/;

                //Se comprueba que el formato es válido
                if (regularExp.test(dni) === true) {

                    //Número
                    number = dni.substr(0, dni.length - 1);

                    //Letra
                    letter = dni.substr(dni.length - 1, 1);
                    number = number % 23;
                    letterList = "TRWAGMYFPDXBNJZSQVHLCKET";
                    letterList = letterList.substring(number, number + 1);
                    if (letterList !== letter.toUpperCase()) {
                        oDataModel.DniState = "Error";
                        oDataModel._DatosEmpValido = false;
                    } else {
                        oDataModel.DniState = "None";
                    }
                } else {
                    oDataModel.DniState = "Error";
                    oDataModel._DatosEmpValido = false;
                }

                this._model.setData(oDataModel);

            } else {
                oDataModel.DniState = "None";
            }
        };



        function onWizardComplete(oEvent) {

            // Se navega a la página revision
            var wizardNavContainer = this.getView().byId("wizardContainer");
            wizardNavContainer.to(this.byId("revisarPage"));

            // Se obtiene la lista de archivos cargados
            var uploadCollection = this.byId("uploadInfoAdicional");
            var archivos = uploadCollection.getItems();
            var numArchivos = uploadCollection.getItems().length;

            this._model.setProperty("/NumArchivos", numArchivos);
            if (numArchivos > 0) {

                var listaArchivos = [];
                for (var i in archivos) {
                    listaArchivos.push({
                        NombreArchivo: archivos[i].getFileName(),
                        MimeType: archivos[i].getMimeType()
                    });
                }

                this._model.setProperty("/ListaArchivos", listaArchivos);
            } else {
                this._model.setProperty("/ListaArchivos", []);
            }

        };


        function onEditarPaso1() {

            var wizardNavContainer = this.byId("wizardContainer");

            // Se añade una función al evento afterNavigate
            var fnAfterNavigate = function () {

                this._wizard.goToStep(this.byId("tipoEmpleadoStep"));

                // Se quita la función para que no vuelva a ejecutar al volver a nevagar
                wizardNavContainer.detachAfterNavigate(fnAfterNavigate);

            }.bind(this);

            wizardNavContainer.attachAfterNavigate(fnAfterNavigate);
            wizardNavContainer.back();

        };


        function onEditarPaso2() {

            var wizardNavContainer = this.byId("wizardContainer");

            // Se añade una función al evento afterNavigate
            var fnAfterNavigate = function () {

                this._wizard.goToStep(this.byId("datosEmpleadoStep"));

                // Se quita la función para que no vuelva a ejecutar al volver a nevagar
                wizardNavContainer.detachAfterNavigate(fnAfterNavigate);

            }.bind(this);

            wizardNavContainer.attachAfterNavigate(fnAfterNavigate);
            wizardNavContainer.back();

        };


        function onEditarPaso3() {

            var wizardNavContainer = this.byId("wizardContainer");

            // Se añade una función al evento afterNavigate
            var fnAfterNavigate = function () {

                this._wizard.goToStep(this.byId("infoAdicionalEstep"));

                // Se quita la función para que no vuelva a ejecutar al volver a nevagar
                wizardNavContainer.detachAfterNavigate(fnAfterNavigate);

            }.bind(this);

            wizardNavContainer.attachAfterNavigate(fnAfterNavigate);
            wizardNavContainer.back();

        };



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
                value: SapId + ";" + this.EmployeeId + ";" + fileName
            });

            oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);


        };


        function onUploadAttach() {

            var oView = this.getView();
            var oUploadCollection = oView.byId("uploadInfoAdicional");

            oUploadCollection.upload();

        }


        function onGrabarDatosEmp() {

            var oDataModel = this.getView().getModel().getData();
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            var body = {
                SapId: this.getOwnerComponent().SapId,
                Type: oDataModel.Tipo,
                FirstName: oDataModel.FirstName,
                LastName: oDataModel.LastName,
                Dni: oDataModel.Dni,
                CreationDate: oDataModel.CreationDate,
                Comments: oDataModel.Comentario
            };

            body.UserToSalary = [{
                Ammount: parseFloat(oDataModel.Sueldo).toString(),
                Comments: oDataModel.Comentario,
                Waers: "EUR"
            }];

            this.getView().setBusy(true);

            this.getView().getModel("odataGestionModel").create("/Users", body, {
                success: function (data) {

                    this.getView().setBusy(false);
                    this.EmployeeId = data.EmployeeId;

                    sap.m.MessageBox.information(oResourceBundle.getText("nuevoEmpleado") + ": " + data.EmployeeId, {
                        onClose: function () {
                            var wizardNavContainer = this.byId("wizardContainer");
                            wizardNavContainer.back();

                            oRouter.navTo("RouteMenu", {}, true);
                        }.bind(this)
                    });

                    this.onUploadAttach();

                }.bind(this),

                error: function () {

                    this.getView().setBusy(false);
                }.bind(this)

            });

            this.getView().getModel("odataGestionModel").refresh();

        };



        var crearEmp = Controller.extend("logaligroup.Empleados.controller.CrearEmpleado", {});

        crearEmp.prototype.onInit = onInit;
        crearEmp.prototype.onBeforeRendering = onBeforeRendering;
        crearEmp.prototype.onCancelar = onCancelar;
        crearEmp.prototype.onPaso2 = onPaso2;
        crearEmp.prototype.onValidarDatosEmpleado = onValidarDatosEmpleado;
        crearEmp.prototype.onValidarDNI = onValidarDNI;
        crearEmp.prototype.onWizardComplete = onWizardComplete;
        crearEmp.prototype.onEditarPaso1 = onEditarPaso1;
        crearEmp.prototype.onEditarPaso2 = onEditarPaso2;
        crearEmp.prototype.onEditarPaso3 = onEditarPaso3;
        crearEmp.prototype.onGrabarDatosEmp = onGrabarDatosEmp;
        crearEmp.prototype.onFileChange = onFileChange;
        crearEmp.prototype.onFileBeforeUploadStarts = onFileBeforeUploadStarts;
        crearEmp.prototype.onUploadAttach = onUploadAttach;

        return crearEmp;

    });