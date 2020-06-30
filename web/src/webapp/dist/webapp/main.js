(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ "./src/$$_lazy_route_resource lazy recursive":
/*!**********************************************************!*\
  !*** ./src/$$_lazy_route_resource lazy namespace object ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(function() {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "./src/$$_lazy_route_resource lazy recursive";

/***/ }),

/***/ "./src/app/acl/acl-action.service.ts":
/*!*******************************************!*\
  !*** ./src/app/acl/acl-action.service.ts ***!
  \*******************************************/
/*! exports provided: AclActionService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AclActionService", function() { return AclActionService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var _basecrud_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../basecrud.service */ "./src/app/basecrud.service.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var AclActionService = /** @class */ (function (_super) {
    __extends(AclActionService, _super);
    function AclActionService(http) {
        var _this = _super.call(this, http) || this;
        _this.http = http;
        return _this;
    }
    /**
    * List ACL actions
    */
    AclActionService.prototype.list = function (filters) {
        return _super.prototype.list.call(this, filters);
    };
    AclActionService.prototype.userHasAccess = function (userId, action) {
        return this.http.get(this.getURL("has-access") + "/" + userId + "/" + encodeURIComponent(action));
    };
    AclActionService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])({
            providedIn: 'root'
        }),
        __metadata("design:paramtypes", [_angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"]])
    ], AclActionService);
    return AclActionService;
}(_basecrud_service__WEBPACK_IMPORTED_MODULE_2__["BaseCrudService"]));



/***/ }),

/***/ "./src/app/acl/acl-role-modal.crud.html":
/*!**********************************************!*\
  !*** ./src/app/acl/acl-role-modal.crud.html ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<!-- New Role Modal -->\r\n<div class=\"modal-header\">\r\n\t<h4 class=\"modal-title\" id=\"modal-basic-title\" *ngIf=\"!currentRecord.id\">Nouveau rôle</h4>\r\n\t<h4 class=\"modal-title\" id=\"modal-basic-title\" *ngIf=\"currentRecord.id\">Rôle {{currentRecord.code}}</h4>\r\n\t<button type=\"button\" class=\"close\" aria-label=\"Close\" (click)=\"activeModal.close('close')\">\r\n\t  <span aria-hidden=\"true\">&times;</span>\r\n\t</button>\r\n</div>\r\n<div class=\"modal-body\">\r\n\t<form #aclRoleForm=\"ngForm\">\r\n    <div class=\"form-group row\">\r\n      <label for=\"code\" class=\"col-lg-2 control-label\">Code </label>\r\n      <div class=\"col-lg-10\">\r\n        <input type=\"text\" class=\"form-control\" name=\"code\" placeholder=\"Code...\"\r\n        \t   [(ngModel)]=\"currentRecord.code\" required />\r\n      </div>\r\n    </div>\r\n\t  <div class=\"form-group row\">\r\n      <label for=\"label\" class=\"col-lg-2 control-label\">Description </label>\r\n      <div class=\"col-lg-10\">\r\n        <input type=\"text\" class=\"form-control\" name=\"label\" placeholder=\"Description...\"\r\n        \t   [(ngModel)]=\"currentRecord.label\" required/>\r\n      </div>\r\n    </div>\r\n\t\t<!-- Role List -->\r\n\t\t<div class=\"form-group\" fillHeight=\"350\">\r\n\t\t\t<ag-grid-angular \r\n\t\t\t    style=\"height: 100%;\" \r\n\t\t\t    class=\"ag-theme-material\"\r\n\t\t\t    [gridOptions]=\"gridOptions\"\r\n\t\t\t    [rowData]=\"aclActions\" \r\n\t\t\t    [enableFilter]=\"true\"\r\n\t\t\t    rowSelection=\"multiple\"\r\n\t\t\t    (gridReady)=\"gridReady($event)\">\r\n\t\t\t</ag-grid-angular>\r\n\t\t</div>\t    \r\n  </form>\r\n</div>\r\n<div class=\"modal-footer\">\r\n\t<button type=\"button\" class=\"btn btn-success\" (click)=\"saveModal()\">Enregistrer</button>\r\n</div>"

/***/ }),

/***/ "./src/app/acl/acl-role-modal.crud.ts":
/*!********************************************!*\
  !*** ./src/app/acl/acl-role-modal.crud.ts ***!
  \********************************************/
/*! exports provided: ACLRoleModalCrud */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ACLRoleModalCrud", function() { return ACLRoleModalCrud; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ "./node_modules/@ng-bootstrap/ng-bootstrap/fesm5/ng-bootstrap.js");
/* harmony import */ var _basecrud__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../basecrud */ "./src/app/basecrud.ts");
/* harmony import */ var _acl_role_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./acl-role.service */ "./src/app/acl/acl-role.service.ts");
/* harmony import */ var _thesaurus_thesaurus_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../thesaurus/thesaurus.service */ "./src/app/thesaurus/thesaurus.service.ts");
/* harmony import */ var _acl_role__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./acl-role */ "./src/app/acl/acl-role.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};







var ACLRoleModalCrud = /** @class */ (function (_super) {
    __extends(ACLRoleModalCrud, _super);
    function ACLRoleModalCrud(aclRoleService, thService, router, activeModal) {
        var _this = _super.call(this, aclRoleService, thService, router) || this;
        _this.aclRoleService = aclRoleService;
        _this.thService = thService;
        _this.router = router;
        _this.activeModal = activeModal;
        _this.currentRecord = new _acl_role__WEBPACK_IMPORTED_MODULE_6__["AclRole"]();
        _this.gridOptions = {
            rowHeight: 30,
            headerHeight: 30
        };
        _this.gridOptions.columnDefs = [
            { headerName: 'Action', field: 'code', checkboxSelection: true },
            { headerName: 'Description', field: 'label' },
        ];
        return _this;
    }
    ACLRoleModalCrud.prototype.ngOnInit = function () {
        _super.prototype.init.call(this, this.aclRoleId);
    };
    ACLRoleModalCrud.prototype.gridReady = function (params) {
        var _this = this;
        this.dataLoaded.subscribe(function (currentRecord) {
            _this.gridOptions.api.forEachNode(function (node) {
                var selected = false;
                for (var _i = 0, _a = _this.currentRecord.actions; _i < _a.length; _i++) {
                    var action = _a[_i];
                    if (node.data.code == action.code) {
                        selected = true;
                        break;
                    }
                }
                node.setSelected(selected);
            });
            params.api.sizeColumnsToFit();
        });
    };
    ACLRoleModalCrud.prototype.saveModal = function () {
        var _this = this;
        this.currentRecord.actions = this.gridOptions.api.getSelectedRows();
        console.log("save", this.currentRecord.actions);
        this.save(false).subscribe(function (record) {
            _this.activeModal.close('Modal Closed');
        });
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])('aclActions'),
        __metadata("design:type", Array)
    ], ACLRoleModalCrud.prototype, "aclActions", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])('aclRoleId'),
        __metadata("design:type", String)
    ], ACLRoleModalCrud.prototype, "aclRoleId", void 0);
    ACLRoleModalCrud = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            template: __webpack_require__(/*! ./acl-role-modal.crud.html */ "./src/app/acl/acl-role-modal.crud.html"),
        }),
        __metadata("design:paramtypes", [_acl_role_service__WEBPACK_IMPORTED_MODULE_4__["AclRoleService"],
            _thesaurus_thesaurus_service__WEBPACK_IMPORTED_MODULE_5__["ThesaurusService"],
            _angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"],
            _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_2__["NgbActiveModal"]])
    ], ACLRoleModalCrud);
    return ACLRoleModalCrud;
}(_basecrud__WEBPACK_IMPORTED_MODULE_3__["BaseCrud"]));



/***/ }),

/***/ "./src/app/acl/acl-role.service.ts":
/*!*****************************************!*\
  !*** ./src/app/acl/acl-role.service.ts ***!
  \*****************************************/
/*! exports provided: AclRoleService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AclRoleService", function() { return AclRoleService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var _basecrud_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../basecrud.service */ "./src/app/basecrud.service.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var AclRoleService = /** @class */ (function (_super) {
    __extends(AclRoleService, _super);
    function AclRoleService(http) {
        var _this = _super.call(this, http) || this;
        _this.http = http;
        return _this;
    }
    AclRoleService.prototype.list = function (filters) {
        return _super.prototype.list.call(this, filters);
    };
    AclRoleService.prototype.save = function (aclRole) {
        return _super.prototype.save.call(this, aclRole);
    };
    AclRoleService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])({
            providedIn: 'root'
        }),
        __metadata("design:paramtypes", [_angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"]])
    ], AclRoleService);
    return AclRoleService;
}(_basecrud_service__WEBPACK_IMPORTED_MODULE_2__["BaseCrudService"]));



/***/ }),

/***/ "./src/app/acl/acl-role.ts":
/*!*********************************!*\
  !*** ./src/app/acl/acl-role.ts ***!
  \*********************************/
/*! exports provided: AclRole */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AclRole", function() { return AclRole; });
/* harmony import */ var _baserecord__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../baserecord */ "./src/app/baserecord.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var AclRole = /** @class */ (function (_super) {
    __extends(AclRole, _super);
    function AclRole() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AclRole;
}(_baserecord__WEBPACK_IMPORTED_MODULE_0__["BaseRecord"]));



/***/ }),

/***/ "./src/app/acl/acl-show.ts":
/*!*********************************!*\
  !*** ./src/app/acl/acl-show.ts ***!
  \*********************************/
/*! exports provided: AclShowDirective */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AclShowDirective", function() { return AclShowDirective; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _acl_action_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./acl-action.service */ "./src/app/acl/acl-action.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var AclShowDirective = /** @class */ (function () {
    function AclShowDirective(el, renderer, aclService) {
        this.el = el;
        this.renderer = renderer;
        this.aclService = aclService;
    }
    AclShowDirective.prototype.ngOnInit = function () {
        var _this = this;
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.aclService.userHasAccess(currentUser.user_main_id, this.action).subscribe(function (response) {
            if (response.data) {
                _this.renderer.setElementStyle(_this.el.nativeElement, 'display', 'inline');
            }
            else {
                _this.renderer.setElementStyle(_this.el.nativeElement, 'display', 'none');
            }
        });
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])("aclShow"),
        __metadata("design:type", String)
    ], AclShowDirective.prototype, "action", void 0);
    AclShowDirective = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Directive"])({
            selector: '[aclShow]'
        }),
        __metadata("design:paramtypes", [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"],
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["Renderer"],
            _acl_action_service__WEBPACK_IMPORTED_MODULE_1__["AclActionService"]])
    ], AclShowDirective);
    return AclShowDirective;
}());



/***/ }),

/***/ "./src/app/acl/acl-user-modal.crud.html":
/*!**********************************************!*\
  !*** ./src/app/acl/acl-user-modal.crud.html ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<!-- User Role Modal -->\r\n<div class=\"modal-header\">\r\n\t<h4 class=\"modal-title\" id=\"modal-basic-title\">{{currentRecord.firstname}} {{currentRecord.lastname}}</h4>\r\n\t<button type=\"button\" class=\"close\" aria-label=\"Close\" (click)=\"activeModal.close('close')\">\r\n\t  <span aria-hidden=\"true\">&times;</span>\r\n\t</button>\r\n</div>\r\n<div class=\"modal-body\" fillHeight>\r\n\t<form #aclUserForm=\"ngForm\">\r\n\t\t<!-- Role List -->\r\n\t\t<div class=\"form-group\" fillHeight=\"250\">\r\n      <label for=\"actions\" class=\"col-lg-2 control-label\">Rôles </label>\r\n\t\t\t<ag-grid-angular \t\t\t\t\t\r\n\t\t\t    style=\"height: 100%;\" \r\n\t\t\t    class=\"ag-theme-material\"\r\n\t\t\t    [gridOptions]=\"gridOptions\"\r\n\t\t\t    [rowData]=\"aclRoles\" \r\n\t\t\t    [enableFilter]=\"true\"\r\n\t\t\t    rowSelection=\"multiple\"\r\n\t\t\t    (gridReady)=\"gridReady($event)\">\r\n\t\t\t</ag-grid-angular>\r\n\t\t</div>\t    \r\n  </form>\r\n</div>\r\n<div class=\"modal-footer\">\r\n\t<button type=\"button\" class=\"btn btn-outline-dark\" (click)=\"saveModal()\">Enregistrer</button>\r\n</div>\r\n"

/***/ }),

/***/ "./src/app/acl/acl-user-modal.crud.ts":
/*!********************************************!*\
  !*** ./src/app/acl/acl-user-modal.crud.ts ***!
  \********************************************/
/*! exports provided: ACLUserModalCrud */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ACLUserModalCrud", function() { return ACLUserModalCrud; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ "./node_modules/@ng-bootstrap/ng-bootstrap/fesm5/ng-bootstrap.js");
/* harmony import */ var _basecrud__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../basecrud */ "./src/app/basecrud.ts");
/* harmony import */ var _user_user_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../user/user.service */ "./src/app/user/user.service.ts");
/* harmony import */ var _thesaurus_thesaurus_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../thesaurus/thesaurus.service */ "./src/app/thesaurus/thesaurus.service.ts");
/* harmony import */ var _user_user__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../user/user */ "./src/app/user/user.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};







var ACLUserModalCrud = /** @class */ (function (_super) {
    __extends(ACLUserModalCrud, _super);
    function ACLUserModalCrud(userService, thService, router, activeModal) {
        var _this = _super.call(this, userService, thService, router) || this;
        _this.userService = userService;
        _this.thService = thService;
        _this.router = router;
        _this.activeModal = activeModal;
        _this.currentRecord = new _user_user__WEBPACK_IMPORTED_MODULE_6__["User"]();
        _this.gridOptions = {
            rowHeight: 30,
            headerHeight: 30,
        };
        _this.gridOptions.columnDefs = [
            { headerName: 'Rôle', field: 'code', checkboxSelection: true },
            { headerName: 'Description', field: 'label' },
        ];
        return _this;
    }
    ACLUserModalCrud.prototype.ngOnInit = function () {
        _super.prototype.init.call(this, this.userId);
    };
    ACLUserModalCrud.prototype.gridReady = function (params) {
        var _this = this;
        this.dataLoaded.subscribe(function (currentRecord) {
            _this.gridOptions.api.forEachNode(function (node) {
                var selected = false;
                for (var _i = 0, _a = _this.currentRecord.roles; _i < _a.length; _i++) {
                    var role = _a[_i];
                    if (node.data.code == role.code) {
                        selected = true;
                        break;
                    }
                }
                node.setSelected(selected);
            });
            params.api.sizeColumnsToFit();
        });
    };
    ACLUserModalCrud.prototype.saveModal = function () {
        var _this = this;
        this.currentRecord.roles = this.gridOptions.api.getSelectedRows();
        console.log("save", this.currentRecord.roles);
        this.save(false).subscribe(function (record) {
            _this.activeModal.close('Modal Closed');
        });
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])('aclRoles'),
        __metadata("design:type", Array)
    ], ACLUserModalCrud.prototype, "aclRoles", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])('userId'),
        __metadata("design:type", String)
    ], ACLUserModalCrud.prototype, "userId", void 0);
    ACLUserModalCrud = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            template: __webpack_require__(/*! ./acl-user-modal.crud.html */ "./src/app/acl/acl-user-modal.crud.html"),
        }),
        __metadata("design:paramtypes", [_user_user_service__WEBPACK_IMPORTED_MODULE_4__["UserService"],
            _thesaurus_thesaurus_service__WEBPACK_IMPORTED_MODULE_5__["ThesaurusService"],
            _angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"],
            _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_2__["NgbActiveModal"]])
    ], ACLUserModalCrud);
    return ACLUserModalCrud;
}(_basecrud__WEBPACK_IMPORTED_MODULE_3__["BaseCrud"]));



/***/ }),

/***/ "./src/app/acl/acl.html":
/*!******************************!*\
  !*** ./src/app/acl/acl.html ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"container-fluid\">\r\n\t<alert-component></alert-component>\r\n\t<div class=\"row\">\t\r\n\t\t<div class=\"col-sm text-center\">\r\n\t\t\t<h4>Utilisateurs</h4>\r\n\t\t</div>\r\n\t\t<div class=\"col-sm text-center\">\r\n\t\t\t<span class=\"h4\">Rôles</span>\r\n\t\t\t<button type=\"button\" id=\"btn-add-role\" class=\"btn btn-success btn-sm float-right\" (click)=\"openRole()\">Nouveau rôle</button>\r\n\t\t</div>\r\n\t\t<div class=\"col-sm text-center\">\r\n\t\t\t<h4>Actions</h4>\r\n\t\t</div>\r\n\t</div>\r\n</div>\r\n<div class=\"container-fluid\">\r\n\t<div class=\"row\" fillHeight>\r\n\t\t<!-- Users List -->\r\n\t\t<div class=\"col-sm\">\r\n\t\t\t<ag-grid-angular \r\n\t\t\t    style=\"height: 100%;\" \r\n\t\t\t    class=\"ag-theme-material\"\r\n\t\t\t    [gridOptions]=\"gridOptionsUsers\"\r\n\t\t\t    [rowData]=\"users\" \r\n\t\t\t    [columnDefs]=\"userColumnDefs\"\r\n\t\t\t    [enableFilter]=\"true\"\r\n\t\t\t    rowSelection=\"single\"\r\n\t\t\t    (selectionChanged)=\"userSelected($event)\"\r\n\t\t\t    (gridSizeChanged)=\"onGridResized($event)\"\r\n\t\t\t    >\r\n\t\t\t</ag-grid-angular>\r\n\t\t</div>\r\n\r\n\t\t<!-- Role List -->\r\n\t\t<div class=\"col-sm\">\r\n\t\t\t<ag-grid-angular \r\n\t\t\t    style=\"height: 100%;\" \r\n\t\t\t    class=\"ag-theme-material\"\r\n\t\t\t    [gridOptions]=\"gridOptionsRoles\"\r\n\t\t\t    [rowData]=\"aclRoles\" \r\n\t\t\t    [columnDefs]=\"roleColumnDefs\"\r\n\t\t\t    [enableFilter]=\"true\"\r\n\t\t\t    rowSelection=\"multiple\"\r\n\t\t\t    (selectionChanged)=\"roleSelected($event)\"\r\n\t\t\t    (gridSizeChanged)=\"onGridResized($event)\"\r\n\t\t\t    >\r\n\t\t\t</ag-grid-angular>\r\n\t\t</div>\r\n\r\n\t\t<!-- Actions List -->\r\n\t\t<div class=\"col-sm\">\r\n\t\t\t\t<ag-grid-angular \r\n\t\t\t\t\t\tstyle=\"height: 100%;\" \t\t\t    \r\n\t\t\t\t    class=\"ag-theme-material\"\r\n\t\t\t\t    [gridOptions]=\"gridOptionsActions\"\r\n\t\t\t\t    [rowData]=\"aclActions\" \r\n\t\t\t\t    [columnDefs]=\"actionColumnDefs\"\r\n\t\t\t\t    [enableFilter]=\"true\"\r\n\t\t\t\t    rowSelection=\"multiple\"\r\n\t\t\t\t    (gridReady)=\"onGridResized($event)\"\r\n\t\t\t\t    (gridSizeChanged)=\"onGridResized($event)\"\r\n\t\t\t\t    >\r\n\t\t\t\t</ag-grid-angular>\r\n\t\t</div>\r\n\t</div>\r\n</div>"

/***/ }),

/***/ "./src/app/acl/acl.ts":
/*!****************************!*\
  !*** ./src/app/acl/acl.ts ***!
  \****************************/
/*! exports provided: ACL, ClickableComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ACL", function() { return ACL; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ClickableComponent", function() { return ClickableComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ "./node_modules/@ng-bootstrap/ng-bootstrap/fesm5/ng-bootstrap.js");
/* harmony import */ var _acl_user_modal_crud__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./acl-user-modal.crud */ "./src/app/acl/acl-user-modal.crud.ts");
/* harmony import */ var _acl_role_modal_crud__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./acl-role-modal.crud */ "./src/app/acl/acl-role-modal.crud.ts");
/* harmony import */ var _user_user_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../user/user.service */ "./src/app/user/user.service.ts");
/* harmony import */ var _acl_role_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./acl-role.service */ "./src/app/acl/acl-role.service.ts");
/* harmony import */ var _acl_action_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./acl-action.service */ "./src/app/acl/acl-action.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};







var ACL = /** @class */ (function () {
    function ACL(userService, aclActionService, aclRoleService, modalService) {
        this.userService = userService;
        this.aclActionService = aclActionService;
        this.aclRoleService = aclRoleService;
        this.modalService = modalService;
        this.userColumnDefs = [
            { headerName: 'Identifiant', field: 'login', cellRendererFramework: ClickableComponent },
            { headerName: 'Nom', field: 'lastname' },
        ];
        this.roleColumnDefs = [
            { headerName: 'Rôle', field: 'code', cellRendererFramework: ClickableComponent },
            { headerName: 'Description', field: 'label' },
        ];
        this.actionColumnDefs = [
            { headerName: 'Action', field: 'code', checkboxSelection: false },
            { headerName: 'Description', field: 'label' },
        ];
        this.gridOptionsUsers = {
            rowHeight: 30,
            headerHeight: 30,
            context: {
                code: "user",
                componentParent: this
            }
        };
        this.gridOptionsRoles = {
            rowHeight: 30,
            headerHeight: 30,
            context: {
                code: "role",
                componentParent: this
            }
        };
        this.gridOptionsActions = {
            rowHeight: 30,
            headerHeight: 30
        };
    }
    // Open Modal add / edit Role
    ACL.prototype.openUser = function (id) {
        var _this = this;
        var modalRef = this.modalService.open(_acl_user_modal_crud__WEBPACK_IMPORTED_MODULE_2__["ACLUserModalCrud"]);
        modalRef.componentInstance.userId = id;
        modalRef.componentInstance.aclRoles = this.aclRoles;
        modalRef.result.then(function (result) {
            // Update UI
            _this.loadData();
        }).catch(function (error) {
            console.log(error);
        });
    };
    // Update roles list - mark selected roles  
    ACL.prototype.userSelected = function (event) {
        var selectedUsers = event.api.getSelectedRows();
        if (selectedUsers.length == 1) {
            this.gridOptionsRoles.api.forEachNode(function (node) {
                var selected = false;
                for (var _i = 0, _a = selectedUsers[0].roles; _i < _a.length; _i++) {
                    var role = _a[_i];
                    if (node.data.code == role.code) {
                        selected = true;
                        break;
                    }
                }
                node.setSelected(selected);
            });
        }
    };
    // Open Modal add / edit Role
    ACL.prototype.openRole = function (id) {
        var _this = this;
        var modalRef = this.modalService.open(_acl_role_modal_crud__WEBPACK_IMPORTED_MODULE_3__["ACLRoleModalCrud"]);
        modalRef.componentInstance.aclRoleId = id;
        modalRef.componentInstance.aclActions = this.aclActions;
        modalRef.result.then(function (result) {
            // Update UI
            _this.loadData();
        }).catch(function (error) {
            console.log(error);
        });
    };
    // Update actions list - mark selected actions  
    ACL.prototype.roleSelected = function (event) {
        var selectedRoles = event.api.getSelectedRows();
        if (selectedRoles.length == 1) {
            this.gridOptionsActions.api.forEachNode(function (node) {
                var selected = false;
                for (var _i = 0, _a = selectedRoles[0].actions; _i < _a.length; _i++) {
                    var action = _a[_i];
                    if (node.data.code == action.code) {
                        selected = true;
                        break;
                    }
                }
                node.setSelected(selected);
            });
        }
    };
    ACL.prototype.ngOnInit = function () {
        this.loadData();
    };
    ACL.prototype.loadData = function () {
        var _this = this;
        this.userService.list({}).subscribe(function (users) { _this.users = users; });
        this.aclActionService.list({}).subscribe(function (aclActions) { return _this.aclActions = aclActions; });
        this.aclRoleService.list({}).subscribe(function (aclRoles) { return _this.aclRoles = aclRoles; });
    };
    ACL.prototype.onGridResized = function (params) {
        params.api.sizeColumnsToFit();
        // Ugly hack !!
        setTimeout(function () {
            params.api.sizeColumnsToFit();
        }, 1000);
    };
    ACL = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            template: __webpack_require__(/*! ./acl.html */ "./src/app/acl/acl.html"),
        }),
        __metadata("design:paramtypes", [_user_user_service__WEBPACK_IMPORTED_MODULE_4__["UserService"],
            _acl_action_service__WEBPACK_IMPORTED_MODULE_6__["AclActionService"],
            _acl_role_service__WEBPACK_IMPORTED_MODULE_5__["AclRoleService"],
            _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_1__["NgbModal"]])
    ], ACL);
    return ACL;
}());

var ClickableComponent = /** @class */ (function () {
    function ClickableComponent() {
    }
    ClickableComponent.prototype.agInit = function (params) {
        this.params = params;
        console.log(this.params);
    };
    ClickableComponent.prototype.click = function () {
        if (this.params.context.code == "role") {
            this.params.context.componentParent.openRole(this.params.node.data.id);
        }
        else {
            this.params.context.componentParent.openUser(this.params.node.data.id);
        }
    };
    ClickableComponent.prototype.refresh = function () {
        return false;
    };
    ClickableComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'ag-clickable',
            template: "<button (click)='click()' class='btn btn-link'>{{params.value}}</button>",
        })
    ], ClickableComponent);
    return ClickableComponent;
}());



/***/ }),

/***/ "./src/app/alert/alert.component.html":
/*!********************************************!*\
  !*** ./src/app/alert/alert.component.html ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div *ngIf=\"message\" \r\n\t[ngClass]=\"{ 'alert': message, 'alert-success': message.type === 'success', 'alert-danger': message.type === 'error' }\">\r\n\t{{message.text}}\r\n</div>"

/***/ }),

/***/ "./src/app/alert/alert.component.ts":
/*!******************************************!*\
  !*** ./src/app/alert/alert.component.ts ***!
  \******************************************/
/*! exports provided: AlertComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AlertComponent", function() { return AlertComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _alert_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./alert.service */ "./src/app/alert/alert.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var AlertComponent = /** @class */ (function () {
    function AlertComponent(alertService) {
        this.alertService = alertService;
    }
    AlertComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.subscription = this.alertService.getMessage().subscribe(function (message) {
            _this.message = message;
        });
    };
    AlertComponent.prototype.ngOnDestroy = function () {
        this.subscription.unsubscribe();
    };
    AlertComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'alert-component',
            template: __webpack_require__(/*! ./alert.component.html */ "./src/app/alert/alert.component.html")
        }),
        __metadata("design:paramtypes", [_alert_service__WEBPACK_IMPORTED_MODULE_1__["AlertService"]])
    ], AlertComponent);
    return AlertComponent;
}());



/***/ }),

/***/ "./src/app/alert/alert.service.ts":
/*!****************************************!*\
  !*** ./src/app/alert/alert.service.ts ***!
  \****************************************/
/*! exports provided: AlertService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AlertService", function() { return AlertService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/_esm5/index.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var AlertService = /** @class */ (function () {
    function AlertService(router) {
        var _this = this;
        this.router = router;
        this.subject = new rxjs__WEBPACK_IMPORTED_MODULE_2__["Subject"]();
        this.keepAfterNavigationChange = false;
        // clear alert message on route change
        router.events.subscribe(function (event) {
            if (event instanceof _angular_router__WEBPACK_IMPORTED_MODULE_1__["NavigationStart"]) {
                if (_this.keepAfterNavigationChange) {
                    // only keep for a single location change
                    _this.keepAfterNavigationChange = false;
                }
                else {
                    // clear alert
                    _this.subject.next();
                }
            }
        });
    }
    AlertService.prototype.success = function (message, keepAfterNavigationChange) {
        if (keepAfterNavigationChange === void 0) { keepAfterNavigationChange = false; }
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        this.subject.next({ type: 'success', text: message });
    };
    AlertService.prototype.error = function (message, keepAfterNavigationChange) {
        if (keepAfterNavigationChange === void 0) { keepAfterNavigationChange = false; }
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        this.subject.next({ type: 'error', text: message });
    };
    AlertService.prototype.getMessage = function () {
        return this.subject.asObservable();
    };
    AlertService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])(),
        __metadata("design:paramtypes", [_angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"]])
    ], AlertService);
    return AlertService;
}());



/***/ }),

/***/ "./src/app/app.component.css":
/*!***********************************!*\
  !*** ./src/app/app.component.css ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/app.component.html":
/*!************************************!*\
  !*** ./src/app/app.component.html ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<!--The content below is only a placeholder and can be replaced.-->\r\n<div>\r\n  <app-navbar></app-navbar>\r\n  <router-outlet></router-outlet>\r\n</div>"

/***/ }),

/***/ "./src/app/app.component.ts":
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/*! exports provided: AppComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppComponent", function() { return AppComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var AppComponent = /** @class */ (function () {
    function AppComponent() {
        this.title = 'webapp';
    }
    AppComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-root',
            template: __webpack_require__(/*! ./app.component.html */ "./src/app/app.component.html"),
            styles: [__webpack_require__(/*! ./app.component.css */ "./src/app/app.component.css")]
        })
    ], AppComponent);
    return AppComponent;
}());



/***/ }),

/***/ "./src/app/app.module.ts":
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/*! exports provided: AppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModule", function() { return AppModule; });
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/platform-browser */ "./node_modules/@angular/platform-browser/fesm5/platform-browser.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _ng_select_ng_select__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @ng-select/ng-select */ "./node_modules/@ng-select/ng-select/fesm5/ng-select.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ "./node_modules/@ng-bootstrap/ng-bootstrap/fesm5/ng-bootstrap.js");
/* harmony import */ var _fortawesome_angular_fontawesome__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @fortawesome/angular-fontawesome */ "./node_modules/@fortawesome/angular-fontawesome/fesm5/angular-fontawesome.js");
/* harmony import */ var ag_grid_angular__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ag-grid-angular */ "./node_modules/ag-grid-angular/main.js");
/* harmony import */ var ag_grid_angular__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(ag_grid_angular__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _helpers_error_interceptor__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./helpers/error.interceptor */ "./src/app/helpers/error.interceptor.ts");
/* harmony import */ var _helpers_session_interceptor__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./helpers/session.interceptor */ "./src/app/helpers/session.interceptor.ts");
/* harmony import */ var _helpers_fill_height__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./helpers/fill-height */ "./src/app/helpers/fill-height.ts");
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./app.component */ "./src/app/app.component.ts");
/* harmony import */ var _navbar_navbar_component__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./navbar/navbar.component */ "./src/app/navbar/navbar.component.ts");
/* harmony import */ var _home_home_component__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./home/home.component */ "./src/app/home/home.component.ts");
/* harmony import */ var _alert_alert_component__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./alert/alert.component */ "./src/app/alert/alert.component.ts");
/* harmony import */ var _login_login__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./login/login */ "./src/app/login/login.ts");
/* harmony import */ var _crud_navbar_crud_navbar__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./crud-navbar/crud-navbar */ "./src/app/crud-navbar/crud-navbar.ts");
/* harmony import */ var _crud_navbar_crud_navbar_modal_confirm__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./crud-navbar/crud-navbar-modal.confirm */ "./src/app/crud-navbar/crud-navbar-modal.confirm.ts");
/* harmony import */ var _crud_navbar_crud_navbar_modal_confirm_delete__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./crud-navbar/crud-navbar-modal.confirm-delete */ "./src/app/crud-navbar/crud-navbar-modal.confirm-delete.ts");
/* harmony import */ var _list_navbar_list_navbar__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./list-navbar/list-navbar */ "./src/app/list-navbar/list-navbar.ts");
/* harmony import */ var _site_site_list__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./site/site.list */ "./src/app/site/site.list.ts");
/* harmony import */ var _site_site_crud__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./site/site.crud */ "./src/app/site/site.crud.ts");
/* harmony import */ var _poi_poi_modal__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./poi/poi-modal */ "./src/app/poi/poi-modal.ts");
/* harmony import */ var _person_person_list__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./person/person.list */ "./src/app/person/person.list.ts");
/* harmony import */ var _person_person_crud__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./person/person.crud */ "./src/app/person/person.crud.ts");
/* harmony import */ var _person_person_establishments_modal__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./person/person.establishments-modal */ "./src/app/person/person.establishments-modal.ts");
/* harmony import */ var _vehicle_vehicle_list__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./vehicle/vehicle.list */ "./src/app/vehicle/vehicle.list.ts");
/* harmony import */ var _vehicle_vehicle_crud__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./vehicle/vehicle.crud */ "./src/app/vehicle/vehicle.crud.ts");
/* harmony import */ var _user_user_list__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ./user/user.list */ "./src/app/user/user.list.ts");
/* harmony import */ var _user_user_crud__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ./user/user.crud */ "./src/app/user/user.crud.ts");
/* harmony import */ var _login_authentication_service__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ./login/authentication.service */ "./src/app/login/authentication.service.ts");
/* harmony import */ var _alert_alert_service__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ./alert/alert.service */ "./src/app/alert/alert.service.ts");
/* harmony import */ var _acl_acl__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! ./acl/acl */ "./src/app/acl/acl.ts");
/* harmony import */ var _acl_acl_show__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! ./acl/acl-show */ "./src/app/acl/acl-show.ts");
/* harmony import */ var _acl_acl_role_modal_crud__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! ./acl/acl-role-modal.crud */ "./src/app/acl/acl-role-modal.crud.ts");
/* harmony import */ var _acl_acl_user_modal_crud__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! ./acl/acl-user-modal.crud */ "./src/app/acl/acl-user-modal.crud.ts");
/* harmony import */ var _map_leaflet_map_leaflet__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! ./map-leaflet/map-leaflet */ "./src/app/map-leaflet/map-leaflet.ts");
/* harmony import */ var _map_gl_map_gl__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! ./map-gl/map-gl */ "./src/app/map-gl/map-gl.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};








































var routes = [
    { path: 'login', component: _login_login__WEBPACK_IMPORTED_MODULE_16__["Login"] },
    { path: 'data/site/list', component: _site_site_list__WEBPACK_IMPORTED_MODULE_21__["SiteList"] },
    { path: 'data/site/crud/:id', component: _site_site_crud__WEBPACK_IMPORTED_MODULE_22__["SiteCrud"] },
    { path: 'data/site/crud', component: _site_site_crud__WEBPACK_IMPORTED_MODULE_22__["SiteCrud"] },
    { path: 'data/vehicle/list', component: _vehicle_vehicle_list__WEBPACK_IMPORTED_MODULE_27__["VehicleList"] },
    { path: 'data/vehicle/crud/:id', component: _vehicle_vehicle_crud__WEBPACK_IMPORTED_MODULE_28__["VehicleCrud"] },
    { path: 'data/person/list', component: _person_person_list__WEBPACK_IMPORTED_MODULE_24__["PersonList"] },
    { path: 'data/person/crud/:id', component: _person_person_crud__WEBPACK_IMPORTED_MODULE_25__["PersonCrud"] },
    { path: 'data/person/crud', component: _person_person_crud__WEBPACK_IMPORTED_MODULE_25__["PersonCrud"] },
    { path: 'data/user/list', component: _user_user_list__WEBPACK_IMPORTED_MODULE_29__["UserList"] },
    { path: 'data/user/crud/:id', component: _user_user_crud__WEBPACK_IMPORTED_MODULE_30__["UserCrud"] },
    { path: 'data/acl', component: _acl_acl__WEBPACK_IMPORTED_MODULE_33__["ACL"] },
    { path: '', component: _home_home_component__WEBPACK_IMPORTED_MODULE_14__["HomeComponent"] },
];
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
            declarations: [
                _app_component__WEBPACK_IMPORTED_MODULE_12__["AppComponent"],
                _navbar_navbar_component__WEBPACK_IMPORTED_MODULE_13__["NavbarComponent"],
                _home_home_component__WEBPACK_IMPORTED_MODULE_14__["HomeComponent"],
                _alert_alert_component__WEBPACK_IMPORTED_MODULE_15__["AlertComponent"],
                _login_login__WEBPACK_IMPORTED_MODULE_16__["Login"],
                _crud_navbar_crud_navbar__WEBPACK_IMPORTED_MODULE_17__["CrudNavbar"],
                _crud_navbar_crud_navbar_modal_confirm__WEBPACK_IMPORTED_MODULE_18__["CrudNavbarModalConfirm"],
                _crud_navbar_crud_navbar_modal_confirm_delete__WEBPACK_IMPORTED_MODULE_19__["CrudNavbarModalConfirmDelete"],
                _list_navbar_list_navbar__WEBPACK_IMPORTED_MODULE_20__["ListNavbar"],
                _map_gl_map_gl__WEBPACK_IMPORTED_MODULE_38__["MapGL"],
                _map_leaflet_map_leaflet__WEBPACK_IMPORTED_MODULE_37__["MapLeaflet"],
                _person_person_list__WEBPACK_IMPORTED_MODULE_24__["PersonList"],
                _person_person_crud__WEBPACK_IMPORTED_MODULE_25__["PersonCrud"],
                _site_site_list__WEBPACK_IMPORTED_MODULE_21__["SiteList"],
                _site_site_crud__WEBPACK_IMPORTED_MODULE_22__["SiteCrud"],
                _poi_poi_modal__WEBPACK_IMPORTED_MODULE_23__["POIModal"],
                _person_person_establishments_modal__WEBPACK_IMPORTED_MODULE_26__["PersonEstablishmentsModal"],
                _user_user_list__WEBPACK_IMPORTED_MODULE_29__["UserList"],
                _user_user_crud__WEBPACK_IMPORTED_MODULE_30__["UserCrud"],
                _vehicle_vehicle_list__WEBPACK_IMPORTED_MODULE_27__["VehicleList"],
                _vehicle_vehicle_crud__WEBPACK_IMPORTED_MODULE_28__["VehicleCrud"],
                _acl_acl__WEBPACK_IMPORTED_MODULE_33__["ACL"],
                _acl_acl__WEBPACK_IMPORTED_MODULE_33__["ClickableComponent"],
                _acl_acl_role_modal_crud__WEBPACK_IMPORTED_MODULE_35__["ACLRoleModalCrud"],
                _acl_acl_user_modal_crud__WEBPACK_IMPORTED_MODULE_36__["ACLUserModalCrud"],
                _acl_acl_show__WEBPACK_IMPORTED_MODULE_34__["AclShowDirective"],
                _helpers_fill_height__WEBPACK_IMPORTED_MODULE_11__["FillHeight"]
            ],
            imports: [
                _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
                _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClientModule"],
                _ng_select_ng_select__WEBPACK_IMPORTED_MODULE_4__["NgSelectModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_5__["FormsModule"],
                _fortawesome_angular_fontawesome__WEBPACK_IMPORTED_MODULE_7__["FontAwesomeModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_5__["ReactiveFormsModule"],
                _angular_router__WEBPACK_IMPORTED_MODULE_3__["RouterModule"].forRoot(routes),
                _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_6__["NgbModule"],
                ag_grid_angular__WEBPACK_IMPORTED_MODULE_8__["AgGridModule"].withComponents([])
            ],
            providers: [
                _login_authentication_service__WEBPACK_IMPORTED_MODULE_31__["AuthenticationService"],
                _alert_alert_service__WEBPACK_IMPORTED_MODULE_32__["AlertService"],
                { provide: _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HTTP_INTERCEPTORS"], useClass: _helpers_session_interceptor__WEBPACK_IMPORTED_MODULE_10__["SessionInterceptor"], multi: true },
                { provide: _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HTTP_INTERCEPTORS"], useClass: _helpers_error_interceptor__WEBPACK_IMPORTED_MODULE_9__["ErrorInterceptor"], multi: true },
            ],
            bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_12__["AppComponent"]],
            entryComponents: [
                _poi_poi_modal__WEBPACK_IMPORTED_MODULE_23__["POIModal"],
                _person_person_establishments_modal__WEBPACK_IMPORTED_MODULE_26__["PersonEstablishmentsModal"],
                _acl_acl_role_modal_crud__WEBPACK_IMPORTED_MODULE_35__["ACLRoleModalCrud"],
                _acl_acl_user_modal_crud__WEBPACK_IMPORTED_MODULE_36__["ACLUserModalCrud"],
                _acl_acl__WEBPACK_IMPORTED_MODULE_33__["ClickableComponent"],
                _crud_navbar_crud_navbar_modal_confirm__WEBPACK_IMPORTED_MODULE_18__["CrudNavbarModalConfirm"],
                _crud_navbar_crud_navbar_modal_confirm_delete__WEBPACK_IMPORTED_MODULE_19__["CrudNavbarModalConfirmDelete"]
            ]
        })
    ], AppModule);
    return AppModule;
}());



/***/ }),

/***/ "./src/app/basecrud.service.ts":
/*!*************************************!*\
  !*** ./src/app/basecrud.service.ts ***!
  \*************************************/
/*! exports provided: BaseCrudService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BaseCrudService", function() { return BaseCrudService; });
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/_esm5/index.js");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm5/operators/index.js");



/**
 Base Class for all Crud Services
**/
var BaseCrudService = /** @class */ (function () {
    function BaseCrudService(http) {
        this.http = http;
    }
    /**
     * Generates a rest service URL base on the service name
     * @param service : service name (for instance 'list')
     */
    BaseCrudService.prototype.getURL = function (service) {
        // Retrieve the service base name base on the actual child class name
        // For instance if the actual class is 'SiteService' then actualBaseName will be 'site'
        var actualServiceName = this.constructor.name;
        var actualServiceNameLowerCase = actualServiceName.toLowerCase();
        var actualBaseName = actualServiceNameLowerCase.replace(/service$/i, "");
        // Indicate the web server address
        // TODO : this is only for development environment, in prod the web server address should already be known.
        return 'http://localhost:4949/rest/' + actualBaseName + '/' + service;
    };
    /**
     * Function that get a list of BaseRecord like objects
     * @param filters : to filter the output list
     * @return Observable<BaseRecord[]> : an observable list of BaseRecord objects
     */
    BaseCrudService.prototype.list = function (filters) {
        var ofList = new rxjs__WEBPACK_IMPORTED_MODULE_1__["Subject"]();
        this.http.get(this.getURL('list'), { params: this.toString(filters) })
            .subscribe(function (response) {
            ofList.next(response.data);
        });
        return ofList;
    };
    /**
     * Function that will get a BaseRecord like object based on its ID
     * @param id : id of the BaseRecord like object to be retrieved
     * @return Observable<BaseRecord> : an observable BaseRecord object
     */
    BaseCrudService.prototype.get = function (id) {
        var ofGet = new rxjs__WEBPACK_IMPORTED_MODULE_1__["Subject"]();
        this.http.get(this.getURL(id)).subscribe(function (response) {
            ofGet.next(response.data);
            ofGet.complete();
        });
        return ofGet;
    };
    /**
     * Given a cast a set of filter values to string
     * @param filters : a set of filters
     */
    BaseCrudService.prototype.toString = function (filters) {
        var target = new _angular_common_http__WEBPACK_IMPORTED_MODULE_0__["HttpParams"]();
        Object.keys(filters).forEach(function (key) {
            var value = filters[key];
            if ((typeof value !== 'undefined') && (value !== null)) {
                target = target.append(key, value.toString());
            }
        });
        return target;
    };
    /**
     * Function that will call server for adding or updating object
     * @param data : object to insert/update
     * @return Observable<CrudSaveResult>
     */
    BaseCrudService.prototype.save = function (data) {
        return this.http.post(this.getURL('save'), data).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["share"])());
    };
    /**
     * Function that will call server for marking some data as removed
     * @param data : the data to be sent for marking as removed
     * @return Observable<boolean> : whether mark as removed succeeded or not
     */
    BaseCrudService.prototype.markAsRemoved = function (data) {
        return this.http.post(this.getURL('mark-as-removed'), { id: data.id });
    };
    /**
     * Function that will call server for deleting data
     * @param data : the data to be sent for deletion
     * @return Observable<boolean> : whether deletion succeeded or not
     */
    BaseCrudService.prototype.delete = function (data) {
        return this.http.post(this.getURL('delete'), { id: data.id });
    };
    BaseCrudService.prototype.createRecord = function () {
        return;
    };
    return BaseCrudService;
}());



/***/ }),

/***/ "./src/app/basecrud.ts":
/*!*****************************!*\
  !*** ./src/app/basecrud.ts ***!
  \*****************************/
/*! exports provided: BaseCrud */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BaseCrud", function() { return BaseCrud; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _helpers_crud_result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./helpers/crud-result */ "./src/app/helpers/crud-result.ts");


/**
 Class to be extended by Crud Components
**/
var BaseCrud = /** @class */ (function () {
    // Child instance will inject there inherited data service
    function BaseCrud(crudService, thesaurusService, router) {
        this.crudService = crudService;
        this.thesaurusService = thesaurusService;
        this.router = router;
        this.currentRecord = this.crudService.createRecord();
        this.thesaurusCatOF = [];
        this.dataLoaded = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
    }
    // Called by child NgOnInit function
    // Set to "" to add a new record
    BaseCrud.prototype.init = function (recordId) {
        var _this = this;
        if (recordId != "" && recordId != undefined) {
            this.editMode = "view";
            this.crudService.get(recordId).subscribe(function (record) {
                _this.currentRecord = record;
                _this.dataLoaded.emit(_this.currentRecord);
            });
        }
        else {
            this.editMode = "edit";
        }
    };
    // Called by crudNavbar Component
    BaseCrud.prototype.editModeChange = function (event) {
        this.editMode = event.value;
        if (this.editMode == "view") {
            // Reload data
            this.init(this.currentRecord.id);
        }
    };
    // Gather the data that will be sent to server for update or insert
    BaseCrud.prototype.checkData = function () { };
    // Insert or update currentRecord
    BaseCrud.prototype.save = function (bReload) {
        var _this = this;
        if (bReload === void 0) { bReload = true; }
        this.checkData();
        var ofSave = this.crudService.save(this.currentRecord);
        ofSave.subscribe(function (response) {
            // Reload and get back to view mode
            if (response.result == _helpers_crud_result__WEBPACK_IMPORTED_MODULE_1__["RestResult"].Ok && bReload) {
                _this.init(response.data.id);
            }
        });
        return ofSave;
    };
    // Called by crudNavbar Component
    BaseCrud.prototype.markAsRemoved = function () {
        var _this = this;
        this.crudService.markAsRemoved(this.currentRecord).subscribe(function (result) {
            // Redirection to the list page corresponding to the crud page
            var pathToList = _this.router.url.replace(/crud(\/[0-9a-zA-Z-]*)?$/i, "list");
            _this.router.navigate([pathToList]);
        });
    };
    // Called by crudNavbar Component
    BaseCrud.prototype.delete = function () {
        var _this = this;
        this.crudService.delete(this.currentRecord).subscribe(function (result) {
            // Redirection to the list page corresponding to the crud page
            var pathToList = _this.router.url.replace(/crud(\/[0-9a-zA-Z-]*)?$/i, "list");
            _this.router.navigate([pathToList]);
        });
    };
    // Get thesaurus entries
    BaseCrud.prototype.th = function (cat) {
        if (!this.thesaurusCatOF[cat]) {
            this.thesaurusCatOF[cat] = this.thesaurusService.list({ cat: cat });
        }
        return this.thesaurusCatOF[cat];
    };
    return BaseCrud;
}());



/***/ }),

/***/ "./src/app/baserecord.ts":
/*!*******************************!*\
  !*** ./src/app/baserecord.ts ***!
  \*******************************/
/*! exports provided: BaseRecord */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BaseRecord", function() { return BaseRecord; });
var BaseRecord = /** @class */ (function () {
    function BaseRecord() {
    }
    return BaseRecord;
}());



/***/ }),

/***/ "./src/app/crud-navbar/crud-navbar-modal.confirm-delete.html":
/*!*******************************************************************!*\
  !*** ./src/app/crud-navbar/crud-navbar-modal.confirm-delete.html ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<!-- Crud confirm Modal before delete -->\r\n<div class=\"modal-header\">\r\n  <h4 class=\"modal-title\" id=\"modal-basic-title\">Confirmation de suppression</h4>\r\n</div>\r\n<div class=\"modal-body\">\r\n  <h6>Etes-vous certain de vouloir supprimer cet élément ?</h6>\r\n  <div class=\"form-check\" [aclShow]=\"'/'+aclObject+'/mark-as-removed'\">\r\n    <input type=\"checkbox\" class=\"form-check-input\" (change)=\"onCheckDeleteChange($event)\" id=\"chkDelete\">\r\n    <label class=\"form-check-label\" for=\"chkDelete\" >Suppression définitive</label>\r\n  </div>\r\n</div>\r\n<div class=\"modal-footer\">\r\n  <button type=\"button\" class=\"btn btn-success btn-sm\" (click)=\"activeModal.close('Y')\">Oui</button>\r\n  <button type=\"button\" class=\"btn btn-danger btn-sm\" (click)=\"activeModal.close('N')\">Non</button>\r\n</div>\r\n"

/***/ }),

/***/ "./src/app/crud-navbar/crud-navbar-modal.confirm-delete.ts":
/*!*****************************************************************!*\
  !*** ./src/app/crud-navbar/crud-navbar-modal.confirm-delete.ts ***!
  \*****************************************************************/
/*! exports provided: CrudNavbarModalConfirmDelete */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CrudNavbarModalConfirmDelete", function() { return CrudNavbarModalConfirmDelete; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ "./node_modules/@ng-bootstrap/ng-bootstrap/fesm5/ng-bootstrap.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var CrudNavbarModalConfirmDelete = /** @class */ (function () {
    function CrudNavbarModalConfirmDelete(activeModal) {
        this.activeModal = activeModal;
        this.onCkeck = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
    }
    CrudNavbarModalConfirmDelete.prototype.onCheckDeleteChange = function (event) {
        this.onCkeck.emit(event.currentTarget.checked);
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])('aclObject'),
        __metadata("design:type", String)
    ], CrudNavbarModalConfirmDelete.prototype, "aclObject", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", Object)
    ], CrudNavbarModalConfirmDelete.prototype, "onCkeck", void 0);
    CrudNavbarModalConfirmDelete = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            template: __webpack_require__(/*! ./crud-navbar-modal.confirm-delete.html */ "./src/app/crud-navbar/crud-navbar-modal.confirm-delete.html"),
        }),
        __metadata("design:paramtypes", [_ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_1__["NgbActiveModal"]])
    ], CrudNavbarModalConfirmDelete);
    return CrudNavbarModalConfirmDelete;
}());



/***/ }),

/***/ "./src/app/crud-navbar/crud-navbar-modal.confirm.html":
/*!************************************************************!*\
  !*** ./src/app/crud-navbar/crud-navbar-modal.confirm.html ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<!-- Crud confirm Modal before delete -->\r\n<div class=\"modal-header\">\r\n  <h4 class=\"modal-title\" id=\"modal-basic-title\">Confirmation</h4>\r\n</div>\r\n<div class=\"modal-body\">\r\n  Des modifications ont été effectuées; Souhaitez-vous quitter sans enregistrer ?\r\n</div>\r\n<div class=\"modal-footer\">\r\n  <button type=\"button\" class=\"btn btn-success\" (click)=\"activeModal.close('Y')\">Oui</button>\r\n  <button type=\"button\" class=\"btn btn-danger\" (click)=\"activeModal.close('N')\">Non</button>\r\n</div>\r\n"

/***/ }),

/***/ "./src/app/crud-navbar/crud-navbar-modal.confirm.ts":
/*!**********************************************************!*\
  !*** ./src/app/crud-navbar/crud-navbar-modal.confirm.ts ***!
  \**********************************************************/
/*! exports provided: CrudNavbarModalConfirm */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CrudNavbarModalConfirm", function() { return CrudNavbarModalConfirm; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ "./node_modules/@ng-bootstrap/ng-bootstrap/fesm5/ng-bootstrap.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var CrudNavbarModalConfirm = /** @class */ (function () {
    function CrudNavbarModalConfirm(activeModal) {
        this.activeModal = activeModal;
    }
    CrudNavbarModalConfirm = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            template: __webpack_require__(/*! ./crud-navbar-modal.confirm.html */ "./src/app/crud-navbar/crud-navbar-modal.confirm.html"),
        }),
        __metadata("design:paramtypes", [_ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_1__["NgbActiveModal"]])
    ], CrudNavbarModalConfirm);
    return CrudNavbarModalConfirm;
}());



/***/ }),

/***/ "./src/app/crud-navbar/crud-navbar.css":
/*!*********************************************!*\
  !*** ./src/app/crud-navbar/crud-navbar.css ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/crud-navbar/crud-navbar.html":
/*!**********************************************!*\
  !*** ./src/app/crud-navbar/crud-navbar.html ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<legend>\r\n<div class=\"row\">\r\n  <div class=\"col-lg-auto\">\r\n    <button type=\"button\" id=\"btn-list\" class=\"btn btn-link\" [routerLink]=\"pathToList\" ><fa-icon [icon]=\"faChevronLeft\"></fa-icon> Liste</button>\r\n\t</div>\r\n  <div class=\"col text-center\">\r\n    <span class=\"h5\">{{title}}</span>\r\n  </div>\r\n  <div class=\"col-lg-auto\">\r\n    <div class=\"float-right\" id=\"action-bar\">\r\n      <div [hidden]=\"editMode!='view'\">\r\n        <button type=\"button\" id=\"btn-edit\" class=\"btn btn-sm\" (click)=\"edit()\" [aclShow]=\"'/'+aclObject+'/save'\">Modifier</button>\r\n      </div>\r\n      <div [hidden]=\"editMode!='edit'\">\r\n      \t<button type=\"button\" id=\"btn-cancel\" class=\"btn btn-sm\" (click)=\"cancel()\">Annuler</button>\r\n      \t<button type=\"button\" id=\"btn-save\" class=\"btn btn-success btn-sm\" (click)=\"save()\" [disabled]=\"!valid\">Enregistrer</button>\r\n        <button type=\"button\" id=\"btn-delete\" class=\"btn btn-danger btn-sm\" (click)=\"markAsRemoved()\"\r\n                [aclShow]=\"'/'+aclObject+'/delete'\" [hidden]=\"recordId==undefined\" >Supprimer</button>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n</legend>"

/***/ }),

/***/ "./src/app/crud-navbar/crud-navbar.ts":
/*!********************************************!*\
  !*** ./src/app/crud-navbar/crud-navbar.ts ***!
  \********************************************/
/*! exports provided: CrudNavbar */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CrudNavbar", function() { return CrudNavbar; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ "./node_modules/@ng-bootstrap/ng-bootstrap/fesm5/ng-bootstrap.js");
/* harmony import */ var _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @fortawesome/free-solid-svg-icons */ "./node_modules/@fortawesome/free-solid-svg-icons/index.es.js");
/* harmony import */ var _crud_navbar_modal_confirm__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./crud-navbar-modal.confirm */ "./src/app/crud-navbar/crud-navbar-modal.confirm.ts");
/* harmony import */ var _crud_navbar_modal_confirm_delete__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./crud-navbar-modal.confirm-delete */ "./src/app/crud-navbar/crud-navbar-modal.confirm-delete.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






var CrudNavbar = /** @class */ (function () {
    function CrudNavbar(modalService, router) {
        this.modalService = modalService;
        this.router = router;
        // Icons used in template
        this.faChevronLeft = _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_3__["faChevronLeft"];
        this.editModeChange = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
        this.saveEvent = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
        this.markAsRemovedEvent = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
        this.deleteEvent = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
        // Compute the path to list menu assuming a url ending with "crud/.*"
        // The /.* part is optionnal since it is missing when we are creating a new object
        this.pathToList = router.url.replace(/crud(\/[0-9a-zA-Z-]*)?$/i, "list");
    }
    CrudNavbar.prototype.edit = function () {
        this.setEditMode('edit');
    };
    CrudNavbar.prototype.cancel = function (bWithoutConfirmation) {
        var _this = this;
        // If the formular is pristine (unmodified), request no confirmation
        if (bWithoutConfirmation == undefined) {
            bWithoutConfirmation = this.pristine;
        }
        if (bWithoutConfirmation) {
            if (this.recordId == undefined) {
                // In add mode : get back to list
                this.router.navigate([this.pathToList]);
            }
            else {
                // In edit mode : get back to view mode
                this.setEditMode('view');
            }
        }
        else {
            var modalRef = this.modalService.open(_crud_navbar_modal_confirm__WEBPACK_IMPORTED_MODULE_4__["CrudNavbarModalConfirm"]);
            modalRef.result.then(function (result) {
                if (result == 'Y') {
                    _this.cancel(true);
                }
            });
        }
    };
    CrudNavbar.prototype.save = function () {
        this.saveEvent.emit();
    };
    CrudNavbar.prototype.markAsRemoved = function () {
        var _this = this;
        var modalRef = this.modalService.open(_crud_navbar_modal_confirm_delete__WEBPACK_IMPORTED_MODULE_5__["CrudNavbarModalConfirmDelete"]);
        var chkDelete = false;
        // Used by acl-show
        modalRef.componentInstance.aclObject = this.aclObject;
        // Get Real Delete checkbox
        modalRef.componentInstance.onCkeck.subscribe(function (value) {
            chkDelete = value;
        });
        modalRef.result.then(function (result) {
            if (result == 'Y') {
                if (chkDelete) {
                    _this.deleteEvent.emit();
                }
                else {
                    _this.markAsRemovedEvent.emit();
                }
            }
        }); /*
        var bResponse = confirm("Etes-vous certain de vouloir supprimer DEFINITIVEMENT cet élément ?");
        if(bResponse){
          this.deleteEvent.emit();
        }*/
    };
    CrudNavbar.prototype.setEditMode = function (editMode) {
        this.editModeChange.emit({
            value: editMode
        });
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])('editMode'),
        __metadata("design:type", String)
    ], CrudNavbar.prototype, "editMode", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])('valid'),
        __metadata("design:type", Boolean)
    ], CrudNavbar.prototype, "valid", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])('pristine'),
        __metadata("design:type", Boolean)
    ], CrudNavbar.prototype, "pristine", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])('title'),
        __metadata("design:type", String)
    ], CrudNavbar.prototype, "title", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])('aclObject'),
        __metadata("design:type", String)
    ], CrudNavbar.prototype, "aclObject", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])('recordId'),
        __metadata("design:type", String)
    ], CrudNavbar.prototype, "recordId", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", Object)
    ], CrudNavbar.prototype, "editModeChange", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", Object)
    ], CrudNavbar.prototype, "saveEvent", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", Object)
    ], CrudNavbar.prototype, "markAsRemovedEvent", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", Object)
    ], CrudNavbar.prototype, "deleteEvent", void 0);
    CrudNavbar = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'crud-navbar',
            template: __webpack_require__(/*! ./crud-navbar.html */ "./src/app/crud-navbar/crud-navbar.html"),
            styles: [__webpack_require__(/*! ./crud-navbar.css */ "./src/app/crud-navbar/crud-navbar.css")]
        }),
        __metadata("design:paramtypes", [_ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_2__["NgbModal"],
            _angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"]])
    ], CrudNavbar);
    return CrudNavbar;
}());



/***/ }),

/***/ "./src/app/helpers/crud-result.ts":
/*!****************************************!*\
  !*** ./src/app/helpers/crud-result.ts ***!
  \****************************************/
/*! exports provided: RestResult, CrudResult, CrudGetResult, CrudSaveResult, CrudListResult */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RestResult", function() { return RestResult; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CrudResult", function() { return CrudResult; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CrudGetResult", function() { return CrudGetResult; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CrudSaveResult", function() { return CrudSaveResult; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CrudListResult", function() { return CrudListResult; });
var RestResult;
(function (RestResult) {
    RestResult[RestResult["Error"] = 0] = "Error";
    RestResult[RestResult["Ok"] = 1] = "Ok";
    RestResult[RestResult["DuplicateCode"] = 2] = "DuplicateCode";
})(RestResult || (RestResult = {}));
var CrudResult = /** @class */ (function () {
    function CrudResult() {
    }
    return CrudResult;
}());

var CrudGetResult = /** @class */ (function () {
    function CrudGetResult() {
    }
    return CrudGetResult;
}());

var CrudSaveResult = /** @class */ (function () {
    function CrudSaveResult() {
    }
    return CrudSaveResult;
}());

var CrudListResult = /** @class */ (function () {
    function CrudListResult() {
    }
    return CrudListResult;
}());



/***/ }),

/***/ "./src/app/helpers/error.interceptor.ts":
/*!**********************************************!*\
  !*** ./src/app/helpers/error.interceptor.ts ***!
  \**********************************************/
/*! exports provided: ErrorInterceptor */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ErrorInterceptor", function() { return ErrorInterceptor; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/_esm5/index.js");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm5/operators/index.js");
/* harmony import */ var _login_authentication_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../login/authentication.service */ "./src/app/login/authentication.service.ts");
/* harmony import */ var _alert_alert_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../alert/alert.service */ "./src/app/alert/alert.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






var ErrorInterceptor = /** @class */ (function () {
    function ErrorInterceptor(authenticationService, alertservice, router) {
        this.authenticationService = authenticationService;
        this.alertservice = alertservice;
        this.router = router;
    }
    ErrorInterceptor.prototype.intercept = function (request, next) {
        var _this = this;
        return next.handle(request).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["catchError"])(function (err) {
            switch (err.status) {
                case 401:
                    // auto logout if 401 response returned from api
                    _this.authenticationService.logout();
                    _this.alertservice.error("Veuillez vous connecter.");
                    _this.router.navigateByUrl('/login');
                    break;
                case 403:
                    _this.alertservice.error("Vous n'avez pas accès à la ressource demandée.");
                    break;
                case 500:
                    switch (err.error.errorCode) {
                        // See BaseObject class on server side for the declaration of custom codes
                        case 101:
                            _this.alertservice.error("La référence fournie est déjà utilisée. Merci d'en choisir une autre.");
                            break;
                        case 102:
                            _this.alertservice.error("L'enregistrement des données a échoué. Votre administrateur a été notifié.");
                            break;
                        default:
                            _this.alertservice.error("Une erreur interne est survenue. Votre administrateur a été notifié.");
                            break;
                    }
                    break;
                default:
                    break;
            }
            var error = err.error.message || err.statusText;
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["throwError"])(error);
        }));
    };
    ErrorInterceptor = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])(),
        __metadata("design:paramtypes", [_login_authentication_service__WEBPACK_IMPORTED_MODULE_4__["AuthenticationService"],
            _alert_alert_service__WEBPACK_IMPORTED_MODULE_5__["AlertService"],
            _angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"]])
    ], ErrorInterceptor);
    return ErrorInterceptor;
}());



/***/ }),

/***/ "./src/app/helpers/fill-height.ts":
/*!****************************************!*\
  !*** ./src/app/helpers/fill-height.ts ***!
  \****************************************/
/*! exports provided: FillHeight */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FillHeight", function() { return FillHeight; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var FillHeight = /** @class */ (function () {
    function FillHeight(el) {
        this.el = el;
    }
    FillHeight.prototype.onResize = function (event) {
        this.el.nativeElement.style.height = window.innerHeight - this.el.nativeElement.getBoundingClientRect().top - 20 + "px";
    };
    FillHeight.prototype.ngAfterViewInit = function () {
        var top;
        if (this.top == "") {
            top = this.el.nativeElement.getBoundingClientRect().top;
        }
        else {
            top = Number(this.top);
        }
        this.el.nativeElement.style.height = window.innerHeight - top - 20 + "px";
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])("fillHeight"),
        __metadata("design:type", String)
    ], FillHeight.prototype, "top", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["HostListener"])('window:resize', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], FillHeight.prototype, "onResize", null);
    FillHeight = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Directive"])({
            selector: '[fillHeight]'
        }),
        __metadata("design:paramtypes", [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"]])
    ], FillHeight);
    return FillHeight;
}());



/***/ }),

/***/ "./src/app/helpers/session.interceptor.ts":
/*!************************************************!*\
  !*** ./src/app/helpers/session.interceptor.ts ***!
  \************************************************/
/*! exports provided: SessionInterceptor */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SessionInterceptor", function() { return SessionInterceptor; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var SessionInterceptor = /** @class */ (function () {
    function SessionInterceptor() {
    }
    SessionInterceptor.prototype.intercept = function (request, next) {
        // add authorization header with jwt token if available
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.user_session_id) {
            request = request.clone({
                setHeaders: {
                    Authorization: "" + currentUser.user_session_id
                }
            });
        }
        return next.handle(request);
    };
    SessionInterceptor = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])()
    ], SessionInterceptor);
    return SessionInterceptor;
}());



/***/ }),

/***/ "./src/app/home/home.component.css":
/*!*****************************************!*\
  !*** ./src/app/home/home.component.css ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/home/home.component.html":
/*!******************************************!*\
  !*** ./src/app/home/home.component.html ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"container-fluid\">\r\n\t<div class=\"jumbotron hidden-xs\">\r\n\t\t<div class=\"row\">\r\n\t\t\t<div class=\"col-md-3 text-right\">\r\n\t\t\t\t<img src=\"assets/img/girl_mini.png\"/>\r\n\t\t  </div>\r\n\t\t\t<div class=\"col-md-9\">\r\n\t\t    <h2>Bienvenue !</h2>\r\n\t\t    <p>Que voulez-vous faire ?</p>\r\n\t\t    <p>\r\n\t\t       <button type=\"button\" class=\"btn btn-primary btn-lg\" role=\"button\" [routerLink]=\"['data/user/list']\">Accéder à la liste des usagers</button>\r\n\t\t       <button type=\"button\" class=\"btn btn-primary btn-lg\" role=\"button\" [routerLink]=\"['data/site/list']\">Accéder à la liste des établissements</button>\r\n\t\t    </p>\r\n\t\t  </div>\r\n\t\t</div>\t\r\n\t</div>\r\n</div>"

/***/ }),

/***/ "./src/app/home/home.component.ts":
/*!****************************************!*\
  !*** ./src/app/home/home.component.ts ***!
  \****************************************/
/*! exports provided: HomeComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HomeComponent", function() { return HomeComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var HomeComponent = /** @class */ (function () {
    function HomeComponent() {
    }
    HomeComponent.prototype.ngOnInit = function () {
    };
    HomeComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-home',
            template: __webpack_require__(/*! ./home.component.html */ "./src/app/home/home.component.html"),
            styles: [__webpack_require__(/*! ./home.component.css */ "./src/app/home/home.component.css")]
        }),
        __metadata("design:paramtypes", [])
    ], HomeComponent);
    return HomeComponent;
}());



/***/ }),

/***/ "./src/app/list-navbar/list-navbar.css":
/*!*********************************************!*\
  !*** ./src/app/list-navbar/list-navbar.css ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/list-navbar/list-navbar.html":
/*!**********************************************!*\
  !*** ./src/app/list-navbar/list-navbar.html ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<legend>\r\n\t<div class=\"row\">\r\n\t  <div class=\"col-lg-6\">\r\n\t    {{title}}  \r\n\t  </div>\r\n\t  <div class=\"col-lg-6\">\r\n\t    <div class=\"float-right\" id=\"action-bar\">\r\n\t      <button type=\"button\" id=\"btn-add\" class=\"btn btn-success btn-sm\" [routerLink]=\"pathToNew\" >Nouveau</button>\r\n\t    </div>\r\n\t  </div>\r\n\t</div>  \r\n</legend>  "

/***/ }),

/***/ "./src/app/list-navbar/list-navbar.ts":
/*!********************************************!*\
  !*** ./src/app/list-navbar/list-navbar.ts ***!
  \********************************************/
/*! exports provided: ListNavbar */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ListNavbar", function() { return ListNavbar; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var ListNavbar = /** @class */ (function () {
    function ListNavbar(router) {
        this.router = router;
        // Compute the path to crud menu assuming a url ending with "list"
        this.pathToNew = router.url.replace(/list$/i, "crud");
    }
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])('title'),
        __metadata("design:type", String)
    ], ListNavbar.prototype, "title", void 0);
    ListNavbar = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'list-navbar',
            template: __webpack_require__(/*! ./list-navbar.html */ "./src/app/list-navbar/list-navbar.html"),
            styles: [__webpack_require__(/*! ./list-navbar.css */ "./src/app/list-navbar/list-navbar.css")]
        }),
        __metadata("design:paramtypes", [_angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"]])
    ], ListNavbar);
    return ListNavbar;
}());



/***/ }),

/***/ "./src/app/login/authentication.service.ts":
/*!*************************************************!*\
  !*** ./src/app/login/authentication.service.ts ***!
  \*************************************************/
/*! exports provided: AuthenticationService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AuthenticationService", function() { return AuthenticationService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm5/operators/index.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var AuthenticationService = /** @class */ (function () {
    function AuthenticationService(http, router) {
        this.http = http;
        this.router = router;
    }
    /**
    * Start session, save session token in localStorage
    **/
    AuthenticationService.prototype.login = function (login, password) {
        return this.http.post("http://localhost:8049/rest/login", { login: login, password: password })
            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["map"])(function (result) {
            // login successful if there's a session token in the response
            if (result && result.user_session_id) {
                // store user details and session token in local storage to keep user logged in between page refreshes
                localStorage.setItem('currentUser', JSON.stringify(result));
                location.reload(true);
            }
            return result;
        }));
    };
    /**
    * End session, remove session token from localStorage and redirect to login page
    **/
    AuthenticationService.prototype.logout = function () {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.router.navigateByUrl('/login');
    };
    AuthenticationService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])(),
        __metadata("design:paramtypes", [_angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"],
            _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"]])
    ], AuthenticationService);
    return AuthenticationService;
}());



/***/ }),

/***/ "./src/app/login/login.html":
/*!**********************************!*\
  !*** ./src/app/login/login.html ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div>\r\n  <alert-component></alert-component>\r\n  <fieldset>\r\n    <legend>Connectez-vous à ODO-VÍA</legend>\r\n      <form [formGroup]=\"loginForm\" (ngSubmit)=\"onSubmit()\">\r\n        <div class=\"form-group\">\r\n            <label for=\"username\">Identifiant</label>\r\n            <input type=\"text\" formControlName=\"username\" class=\"form-control\" [ngClass]=\"{ 'is-invalid': submitted && f.username.errors }\" />\r\n            <div *ngIf=\"submitted && f.username.errors\" class=\"invalid-feedback\">\r\n                <div *ngIf=\"f.username.errors.required\">Veuillez renseigner votre identifiant</div>\r\n            </div>\r\n        </div>\r\n        <div class=\"form-group\">\r\n            <label for=\"password\">Mot de passe</label>\r\n            <input type=\"password\" formControlName=\"password\" class=\"form-control\" [ngClass]=\"{ 'is-invalid': submitted && f.password.errors }\" />\r\n            <div *ngIf=\"submitted && f.password.errors\" class=\"invalid-feedback\">\r\n                <div *ngIf=\"f.password.errors.required\">Veuillez renseigner votre mot de passe</div>\r\n            </div>\r\n        </div>\r\n        <div class=\"form-group\">\r\n            <button [disabled]=\"loading\" class=\"btn btn-success\">Connexion</button>\r\n            <img *ngIf=\"loading\" src=\"data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==\" />\r\n        </div>\r\n    </form>  \r\n  </fieldset>\r\n</div>"

/***/ }),

/***/ "./src/app/login/login.ts":
/*!********************************!*\
  !*** ./src/app/login/login.ts ***!
  \********************************/
/*! exports provided: Login */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Login", function() { return Login; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm5/operators/index.js");
/* harmony import */ var _authentication_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./authentication.service */ "./src/app/login/authentication.service.ts");
/* harmony import */ var _alert_alert_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../alert/alert.service */ "./src/app/alert/alert.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






var Login = /** @class */ (function () {
    function Login(formBuilder, route, router, authenticationService, alertService) {
        this.formBuilder = formBuilder;
        this.route = route;
        this.router = router;
        this.authenticationService = authenticationService;
        this.alertService = alertService;
        this.loading = false;
        this.submitted = false;
    }
    Login.prototype.ngOnInit = function () {
        this.loginForm = this.formBuilder.group({
            username: ['', _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required],
            password: ['', _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required]
        });
        // reset login status
        this.authenticationService.logout();
        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    };
    Object.defineProperty(Login.prototype, "f", {
        // convenience getter for easy access to form fields
        get: function () { return this.loginForm.controls; },
        enumerable: true,
        configurable: true
    });
    Login.prototype.onSubmit = function () {
        var _this = this;
        this.submitted = true;
        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }
        this.loading = true;
        this.authenticationService.login(this.f.username.value, this.f.password.value)
            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["first"])())
            .subscribe(function (result) {
            if (result["result"]) {
                _this.router.navigate([_this.returnUrl]);
            }
            else {
                _this.alertService.error("Veuillez renseigner un identifiant et un mot de passe valides.");
                _this.loading = false;
            }
        });
    };
    Login = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({ template: __webpack_require__(/*! ./login.html */ "./src/app/login/login.html") }),
        __metadata("design:paramtypes", [_angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormBuilder"],
            _angular_router__WEBPACK_IMPORTED_MODULE_1__["ActivatedRoute"],
            _angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"],
            _authentication_service__WEBPACK_IMPORTED_MODULE_4__["AuthenticationService"],
            _alert_alert_service__WEBPACK_IMPORTED_MODULE_5__["AlertService"]])
    ], Login);
    return Login;
}());



/***/ }),

/***/ "./src/app/map-gl/map-gl.css":
/*!***********************************!*\
  !*** ./src/app/map-gl/map-gl.css ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "#mapid { height: 380px; }"

/***/ }),

/***/ "./src/app/map-gl/map-gl.html":
/*!************************************!*\
  !*** ./src/app/map-gl/map-gl.html ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div id=\"mapid\"></div>"

/***/ }),

/***/ "./src/app/map-gl/map-gl.ts":
/*!**********************************!*\
  !*** ./src/app/map-gl/map-gl.ts ***!
  \**********************************/
/*! exports provided: MapGL */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MapGL", function() { return MapGL; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var mapbox_gl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! mapbox-gl */ "./node_modules/mapbox-gl/dist/mapbox-gl.js");
/* harmony import */ var mapbox_gl__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(mapbox_gl__WEBPACK_IMPORTED_MODULE_1__);
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


// Definition of the mapbox token
// Notice that mapboxgl.accessToken = '<MY_TOKEN>' is causing the following compilation error :
//  "TS2540: Cannot assign to 'accessToken' because it is a constant or a read-only property"
// This error seems to be non blocking since execution is still enabled and map displays fine.
// The following workaround was found on stack overflow website :
//   https://stackoverflow.com/questions/44332290/mapbox-gl-typing-wont-allow-accesstoken-assignment
Object.getOwnPropertyDescriptor(mapbox_gl__WEBPACK_IMPORTED_MODULE_1__, "accessToken").set('pk.eyJ1Ijoid2lsbHlsYW1iZXJ0IiwiYSI6InZnaWRIS0EifQ.rVG3h6-GRZdYfSB8z7hLqQ');
// Make available a <map-gl> tag for displaying a mapbox-gl map in a web page
var MapGL = /** @class */ (function () {
    /**
     * Class that encapsulates a Leaflet map
     */
    function MapGL() {
    }
    MapGL.prototype.ngOnInit = function () {
        this.map = new mapbox_gl__WEBPACK_IMPORTED_MODULE_1__["Map"]({
            container: 'mapid',
            style: 'mapbox://styles/mapbox/streets-v9',
            center: [-0.6, 47.54],
            zoom: 10 // starting zoom
        });
    };
    MapGL = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'map-gl',
            template: __webpack_require__(/*! ./map-gl.html */ "./src/app/map-gl/map-gl.html"),
            styles: [__webpack_require__(/*! ./map-gl.css */ "./src/app/map-gl/map-gl.css")]
        })
        /**
         * Class that encapsulates a Leaflet map
         */
    ], MapGL);
    return MapGL;
}());



/***/ }),

/***/ "./src/app/map-leaflet/map-leaflet.css":
/*!*********************************************!*\
  !*** ./src/app/map-leaflet/map-leaflet.css ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "#mapid { height: 100%; }"

/***/ }),

/***/ "./src/app/map-leaflet/map-leaflet.html":
/*!**********************************************!*\
  !*** ./src/app/map-leaflet/map-leaflet.html ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div id=\"mapid\"></div>"

/***/ }),

/***/ "./src/app/map-leaflet/map-leaflet.ts":
/*!********************************************!*\
  !*** ./src/app/map-leaflet/map-leaflet.ts ***!
  \********************************************/
/*! exports provided: MapLeaflet */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MapLeaflet", function() { return MapLeaflet; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var mapbox_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! mapbox.js */ "./node_modules/mapbox.js/src/index.js");
/* harmony import */ var mapbox_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(mapbox_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var leaflet_draw__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! leaflet-draw */ "./node_modules/leaflet-draw/dist/leaflet.draw.js");
/* harmony import */ var leaflet_draw__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(leaflet_draw__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var leaflet_awesome_markers_dist_leaflet_awesome_markers__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! leaflet.awesome-markers/dist/leaflet.awesome-markers */ "./node_modules/leaflet.awesome-markers/dist/leaflet.awesome-markers.js");
/* harmony import */ var leaflet_awesome_markers_dist_leaflet_awesome_markers__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(leaflet_awesome_markers_dist_leaflet_awesome_markers__WEBPACK_IMPORTED_MODULE_3__);
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

// Mapbox.js library extends Leaflet library , so we do not have to include Leafet library


// see https://stackoverflow.com/questions/46037809/runtime-error-cannot-find-module-leaflet-awesome-markers-ionic-3

// Make available a <map-leaflet> tag for displaying a leaflet map in a web page
var MapLeaflet = /** @class */ (function () {
    /**
     * Default constructor
     */
    function MapLeaflet() {
        // Event emitter that will warn after a new POI creation
        this.newPOI = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
        // Event emitter that will warn after a new AOI creation
        this.newAOI = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
        this.POIIcon = mapbox_js__WEBPACK_IMPORTED_MODULE_1__["AwesomeMarkers"].icon({ icon: 'circle', prefix: 'fa', markerColor: 'blue' });
        this.POIEditIcon = mapbox_js__WEBPACK_IMPORTED_MODULE_1__["AwesomeMarkers"].icon({ icon: 'circle', prefix: 'fa', markerColor: 'orange' });
        this.POIEditLayer = new mapbox_js__WEBPACK_IMPORTED_MODULE_1__["FeatureGroup"]();
        this.AOIEditLayer = new mapbox_js__WEBPACK_IMPORTED_MODULE_1__["FeatureGroup"]();
        this.POILayer = new mapbox_js__WEBPACK_IMPORTED_MODULE_1__["FeatureGroup"]();
        this.AOILayer = new mapbox_js__WEBPACK_IMPORTED_MODULE_1__["FeatureGroup"]();
        this.drawControl = new mapbox_js__WEBPACK_IMPORTED_MODULE_1__["Control"].Draw({
            position: 'bottomleft',
            draw: {
                polygon: { showArea: true, shapeOptions: {
                        color: 'orange'
                    } },
                polyline: false,
                rectangle: false,
                circle: false,
                marker: { icon: this.POIEditIcon },
                circlemarker: false
            },
            edit: {
                featureGroup: this.POIEditLayer,
                edit: false,
                remove: false
            }
        });
        // Key to access mapbox data
        mapbox_js__WEBPACK_IMPORTED_MODULE_1__["mapbox"].accessToken = 'pk.eyJ1Ijoid2lsbHlsYW1iZXJ0IiwiYSI6InZnaWRIS0EifQ.rVG3h6-GRZdYfSB8z7hLqQ';
        this.baseLayers = {
            'Rues': mapbox_js__WEBPACK_IMPORTED_MODULE_1__["mapbox"].tileLayer('willylambert.ig7ac2k2'),
            // We do not add the attribution since we are using mapbox-gl that displays automatically a OSM attribution
            'OSM': mapbox_js__WEBPACK_IMPORTED_MODULE_1__["tileLayer"]('http://{s}.tile.osm.org/{z}/{x}/{y}.png'),
            'Satellite': mapbox_js__WEBPACK_IMPORTED_MODULE_1__["mapbox"].tileLayer('willylambert.ig7a2pb9'),
            'Nuit': mapbox_js__WEBPACK_IMPORTED_MODULE_1__["mapbox"].tileLayer('willylambert.np094ng9')
        };
        this.defaultLayerName = "Rues";
    }
    /**
     * Display the POIs on map. We can do that only when both map and POIs are available
     */
    MapLeaflet.prototype.displayPOIs = function () {
        if (this.POIs && this.POILayer) {
            this.POILayer.clearLayers();
            for (var _i = 0, _a = this.POIs; _i < _a.length; _i++) {
                var POI_1 = _a[_i];
                if (POI_1.geom != null) {
                    var icon = POI_1.id != undefined ? this.POIIcon : this.POIEditIcon;
                    var label = POI_1.label != undefined ? POI_1.label : "Nouveau point";
                    //swap x and y as geojson uses (lng,lat) point structure when leaflet uses (lat,lng) point structure
                    this.POILayer.addLayer(mapbox_js__WEBPACK_IMPORTED_MODULE_1__["marker"](mapbox_js__WEBPACK_IMPORTED_MODULE_1__["GeoJSON"].coordsToLatLng(POI_1.geom.coordinates), { icon: icon })
                        .bindTooltip(label, { permanent: true, offset: [5, 0] }));
                }
            }
            this.centerMap();
        }
    };
    /**
     * Display the AOIs on map. We can do that only when both map and AOIs are available
     */
    MapLeaflet.prototype.displayAOIs = function () {
        if (this.AOIs && this.AOILayer) {
            this.AOILayer.clearLayers();
            for (var _i = 0, _a = this.AOIs; _i < _a.length; _i++) {
                var AOI_1 = _a[_i];
                if (AOI_1.geom != null) {
                    var color = AOI_1.id != undefined ? 'blue' : 'orange';
                    var label = AOI_1.label != undefined ? AOI_1.label : 'Nouvelle zone';
                    //swap x and y as geojson uses (lng,lat) point structure when leaflet uses (lat,lng) point structure
                    this.AOILayer.addLayer(mapbox_js__WEBPACK_IMPORTED_MODULE_1__["polygon"](mapbox_js__WEBPACK_IMPORTED_MODULE_1__["GeoJSON"].coordsToLatLngs(AOI_1.geom.coordinates, 1), { color: color })
                        .bindTooltip(label, { permanent: true }));
                }
            }
            this.centerMap();
        }
    };
    /**
     * Function triggered on any data change.
     * We avoid relying on change detection in arrays since this may be ressource consuming
     * Enables to update POI or AOI display in case of POIs or AOIs changes, or drawing toolbar toggling
     * @param changes : list of changed objects
     */
    MapLeaflet.prototype.ngOnChanges = function (changes) {
        if (changes.changeInPOIs && !changes.changeInPOIs.firstChange) {
            // Some changes have been detected in the collection of POIs so we repaint them on the map
            this.displayPOIs();
        }
        if (changes.changeInAOIs && !changes.changeInAOIs.firstChange) {
            // Some changes have been detected in the collection of AOIs so we repaint them on the map
            this.displayAOIs();
        }
        if (changes.editMode) {
            // The edit mode changes, so we toggle the leaflet-draw control
            if (changes.editMode.currentValue == "view" && !changes.editMode.firstChange) {
                this.map.removeControl(this.drawControl);
            }
            if (changes.editMode.currentValue == "edit" && !changes.editMode.firstChange) {
                this.map.addControl(this.drawControl);
            }
            // Make sure the edit layers are empty after any mode switch
            this.POIEditLayer.clearLayers();
            this.AOIEditLayer.clearLayers();
        }
    };
    /**
     * Center the map on all available features.
     */
    MapLeaflet.prototype.centerMap = function () {
        var allFeatures = new mapbox_js__WEBPACK_IMPORTED_MODULE_1__["FeatureGroup"]();
        allFeatures.addLayer(this.POILayer);
        allFeatures.addLayer(this.AOILayer);
        allFeatures.addLayer(this.POIEditLayer);
        allFeatures.addLayer(this.AOIEditLayer);
        var bounds = allFeatures.getBounds();
        // In case no poi and no aoi are available, bounds may not be valid.
        if (bounds.isValid()) {
            this.map.fitBounds(bounds, { maxZoom: 16 });
        }
    };
    /**
     * Function to add a created feature (marker, polygon) to the already existing created features
     */
    MapLeaflet.prototype.onFeatureCreation = function (e) {
        if (e.layerType === 'marker') {
            e.layer.bindTooltip("Nouveau point", { permanent: true, offset: [5, 0] }).addTo(this.POIEditLayer);
            // Send new POI to host component
            this.newPOI.emit({
                value: e.layer.toGeoJSON()
            });
        }
        else {
            e.layer.bindTooltip("Nouvelle zone", { permanent: true }).addTo(this.AOIEditLayer);
            // Send new AOI to host component
            this.newAOI.emit({
                value: e.layer.toGeoJSON()
            });
        }
    };
    /**
     * Function called after DOM completion.
     * Create a leaflet map
     */
    MapLeaflet.prototype.ngOnInit = function () {
        var _this = this;
        // Creating a map with mapbox.js constructor. This enables to load tiles that were prepared under mapbox tile creation tool.
        // Getting rid of mapbox is still possible, using leaflet constructor instead : this.map = L.map('mapid').
        // Base layer id is left undefined since it will be specified later
        this.map = mapbox_js__WEBPACK_IMPORTED_MODULE_1__["mapbox"].map('mapid', undefined, {
            maxZoom: 19,
            bounceAtZoomLimits: false,
            center: new mapbox_js__WEBPACK_IMPORTED_MODULE_1__["LatLng"](47.469, -0.575),
            zoom: 12
        });
        // Add the feature layers (generic layers gathering layers of the same type (markers, polygons))
        this.map.addLayer(this.POIEditLayer);
        this.map.addLayer(this.AOIEditLayer);
        this.map.addLayer(this.POILayer);
        this.map.addLayer(this.AOILayer);
        // Render the received list of POIs and the list of AOIs
        this.displayPOIs();
        this.displayAOIs();
        // Activate the features creation callback on features drawing events
        this.map.on(mapbox_js__WEBPACK_IMPORTED_MODULE_1__["Draw"].Event.CREATED, function (event) { return _this.onFeatureCreation(event); });
        // Insert the layers control to the map
        mapbox_js__WEBPACK_IMPORTED_MODULE_1__["control"].layers(this.baseLayers, this.overlays, { collapsed: true, position: 'topright' }).addTo(this.map);
        // Set the default base layer
        this.baseLayers[this.defaultLayerName].addTo(this.map);
        // Add draw control (in edit mode only)
        if (this.editMode == "edit") {
            this.map.addControl(this.drawControl);
        }
    };
    MapLeaflet.prototype.ngAfterViewInit = function () {
        var _this = this;
        setTimeout(function () { _this.map.invalidateSize(); });
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])('POIs'),
        __metadata("design:type", Array)
    ], MapLeaflet.prototype, "POIs", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])('changeInPOIs'),
        __metadata("design:type", Number)
    ], MapLeaflet.prototype, "changeInPOIs", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])('AOIs'),
        __metadata("design:type", Array)
    ], MapLeaflet.prototype, "AOIs", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])('changeInAOIs'),
        __metadata("design:type", Number)
    ], MapLeaflet.prototype, "changeInAOIs", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])('editMode'),
        __metadata("design:type", String)
    ], MapLeaflet.prototype, "editMode", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", Object)
    ], MapLeaflet.prototype, "newPOI", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", Object)
    ], MapLeaflet.prototype, "newAOI", void 0);
    MapLeaflet = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'map-leaflet',
            template: __webpack_require__(/*! ./map-leaflet.html */ "./src/app/map-leaflet/map-leaflet.html"),
            styles: [__webpack_require__(/*! ./map-leaflet.css */ "./src/app/map-leaflet/map-leaflet.css")]
        })
        /**
         * Class that encapsulates a Leaflet map
         */
        ,
        __metadata("design:paramtypes", [])
    ], MapLeaflet);
    return MapLeaflet;
}());



/***/ }),

/***/ "./src/app/navbar/navbar.component.css":
/*!*********************************************!*\
  !*** ./src/app/navbar/navbar.component.css ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "/** Remove right arrow for dropdown **/\r\n.dropdown-toggle::after {\r\n    display:none;\r\n}"

/***/ }),

/***/ "./src/app/navbar/navbar.component.html":
/*!**********************************************!*\
  !*** ./src/app/navbar/navbar.component.html ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<nav class=\"navbar navbar-expand-lg navbar-light bg-light\">\r\n  <a class=\"navbar-brand\" href=\"#\"><img src=\"assets/img/nomad.png\"/></a>\r\n  <button class=\"navbar-toggler\" type=\"button\" data-toggle=\"collapse\" data-target=\"#navbarSupportedContent\" aria-controls=\"navbarSupportedContent\" aria-expanded=\"false\" aria-label=\"Toggle navigation\">\r\n    <span class=\"navbar-toggler-icon\"></span>\r\n  </button>\r\n\r\n  <div class=\"collapse navbar-collapse\" id=\"navbarSupportedContent\">\r\n    <ul class=\"navbar-nav mr-auto\">\r\n      <li class=\"nav-item\">\r\n\t\t    <div ngbDropdown class=\"d-inline-block\">\r\n\t        <a class=\"nav-link btn\" id=\"navbarDropdown\" role=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\" ngbDropdownToggle>\r\n\t          Data\r\n\t        </a>\t\r\n\t\t      <div ngbDropdownMenu aria-labelledby=\"data\">\r\n\t\t        <button class=\"dropdown-item\" id=\"data-sites\" [routerLink]=\"['data/site/list']\">Sites</button>\r\n\t\t        <button class=\"dropdown-item\" id=\"data-products\">Articles</button>\r\n\t\t        <button class=\"dropdown-item\" id=\"data-vehicles\" [routerLink]=\"['data/vehicle/list']\">Véhicules</button>\r\n\t\t        <button class=\"dropdown-item\" id=\"data-vehicle-cats\">Catégories de véhicules</button>\r\n\t\t        <button class=\"dropdown-item\" id=\"data-drivers\">Chauffeurs</button>\r\n\t\t        <button class=\"dropdown-item\" id=\"data-devices\">Tablettes</button>\r\n\t\t\t\t\t\t<button class=\"dropdown-item\" id=\"data-clients\">Clients</button>\r\n\t\t\t\t\t\t<button class=\"dropdown-item\" id=\"data-persons\" [routerLink]=\"['data/person/list']\">Usagers</button>\r\n\t\t        <button class=\"dropdown-item\" id=\"data-users\" [aclShow]=\"'/user/list'\" [routerLink]=\"['data/user/list']\">Utilisateurs</button>\r\n\t\t        <button class=\"dropdown-item\" id=\"data-acl\" [routerLink]=\"['data/acl']\">Droits d'accès</button>\r\n\t\t      </div>\r\n\t\t    </div>\r\n      </li>\r\n      <li class=\"nav-item\">\r\n\t\t    <div ngbDropdown class=\"d-inline-block\">\r\n\t        <a class=\"nav-link btn\" id=\"navbarDropdown\" role=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\" ngbDropdownToggle>\r\n\t          Logistics\r\n\t        </a>\r\n\t\t      <div ngbDropdownMenu aria-labelledby=\"logistics\">\r\n\t\t        <button class=\"dropdown-item\" id=\"logistics-requests\">Demandes</button>\r\n\t\t        <button class=\"dropdown-item\" id=\"logistics-trip\">Tournées</button>\r\n\t\t      </div>\r\n\t\t    </div>\r\n      </li>\r\n      <li class=\"nav-item\">\r\n\t\t    <div ngbDropdown class=\"d-inline-block\">\r\n\t        <a class=\"nav-link btn\" id=\"navbarDropdown\" role=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\" ngbDropdownToggle>\r\n\t          Tracking\r\n\t        </a>\r\n\t\t      <div ngbDropdownMenu aria-labelledby=\"tracking\">\r\n\t\t        <button class=\"dropdown-item\" id=\"tracking-geoloc\">Géolocalisation</button>\r\n\t\t      </div>\r\n\t\t    </div>\r\n      </li>\r\n      <li class=\"nav-item\">\r\n\t\t    <div ngbDropdown class=\"d-inline-block\">\r\n\t        <a class=\"nav-link btn\" id=\"navbarDropdown\" role=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\" ngbDropdownToggle>\r\n\t          Dashboard\r\n\t        </a>\r\n\t\t      <div ngbDropdownMenu aria-labelledby=\"dashboard\">\r\n\t\t        <button class=\"dropdown-item\" id=\"dashboard-vehicles\">Véhicules</button>\r\n\t\t      </div>\r\n\t\t    </div>\r\n      </li>\r\n    </ul>\r\n    <div class=\"my-2 my-lg-0\">\r\n      {{user.firstname}} {{user.lastname}}\r\n      <button class=\"btn btn-outline-secondary btn-sm my-2 my-sm-0\" (click)=\"authenticationService.logout()\"><fa-icon [icon]=\"faPowerOff\"></fa-icon>\r\n      </button>\r\n    </div>\r\n  </div>\r\n</nav>"

/***/ }),

/***/ "./src/app/navbar/navbar.component.ts":
/*!********************************************!*\
  !*** ./src/app/navbar/navbar.component.ts ***!
  \********************************************/
/*! exports provided: NavbarComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NavbarComponent", function() { return NavbarComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _user_user__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../user/user */ "./src/app/user/user.ts");
/* harmony import */ var _user_user_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../user/user.service */ "./src/app/user/user.service.ts");
/* harmony import */ var _login_authentication_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../login/authentication.service */ "./src/app/login/authentication.service.ts");
/* harmony import */ var _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @fortawesome/free-solid-svg-icons */ "./node_modules/@fortawesome/free-solid-svg-icons/index.es.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






var NavbarComponent = /** @class */ (function () {
    function NavbarComponent(userService, authenticationService, router) {
        this.userService = userService;
        this.authenticationService = authenticationService;
        this.router = router;
        this.faPowerOff = _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_5__["faPowerOff"];
        this.user = new _user_user__WEBPACK_IMPORTED_MODULE_2__["User"]();
    }
    NavbarComponent.prototype.ngOnInit = function () {
        var _this = this;
        // If session is started, User Id is available in localStorage
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.user_main_id) {
            this.userService
                .get(currentUser.user_main_id)
                .subscribe(function (user) {
                _this.user = user;
            });
        }
        else {
            // Need to login first
            this.router.navigateByUrl('/login');
        }
    };
    NavbarComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-navbar',
            template: __webpack_require__(/*! ./navbar.component.html */ "./src/app/navbar/navbar.component.html"),
            styles: [__webpack_require__(/*! ./navbar.component.css */ "./src/app/navbar/navbar.component.css")]
        }),
        __metadata("design:paramtypes", [_user_user_service__WEBPACK_IMPORTED_MODULE_3__["UserService"],
            _login_authentication_service__WEBPACK_IMPORTED_MODULE_4__["AuthenticationService"],
            _angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"]])
    ], NavbarComponent);
    return NavbarComponent;
}());



/***/ }),

/***/ "./src/app/person/person.crud.html":
/*!*****************************************!*\
  !*** ./src/app/person/person.crud.html ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"container-fluid\">\r\n    <div class=\"row\" fillHeight>\r\n      <div class=\"col-sm\">\r\n\r\n        <alert-component></alert-component>\r\n\r\n        <!-- Main formular -->\r\n        <form #personForm=\"ngForm\" novalidate=\"true\" autocomplete=\"off\" *ngIf=\"currentRecord\">\r\n\r\n          <!-- Has to be included within the formular so that crud-navbar component is aware of personForm variable -->\r\n          <crud-navbar\r\n            [editMode]=\"editMode\"\r\n            [valid]=\"personForm.form.valid\"\r\n            [pristine]=\"personForm.form.pristine && !bChanges\"\r\n            (editModeChange)=\"editModeChange($event)\"\r\n            (saveEvent)=\"save()\"\r\n            (markAsRemovedEvent)=\"markAsRemoved()\"\r\n            (deleteEvent)=\"delete()\"\r\n            [title]=\"(currentRecord.id?'Usager '+currentRecord.firstname+' '+currentRecord.lastname:'Nouvel usager')\"\r\n            [aclObject]=\"'person'\"\r\n            [recordId]=\"currentRecord.id\">\r\n          </crud-navbar>\r\n\r\n          <!-- Last name -->\r\n          <div class=\"form-group row\">\r\n            <label for=\"personLastName\" class=\"col-md-2  col-form-label\" >Nom</label>\r\n            <div class=\"col-md-4\">\r\n              <input type=\"text\" class=\"form-control\" name=\"personLastName\" placeholder=\"Nom...\"\r\n                [ngClass]=\"{'form-control-plaintext':editMode=='view','form-control':editMode!='view'}\"\r\n                [(ngModel)]=\"currentRecord.lastname\" \r\n                [required]=\"editMode!='view'\"\r\n                [readonly]=\"editMode=='view'\" />\r\n            </div>\r\n          </div>\r\n\r\n          <!-- Last name maiden-->\r\n          <div class=\"form-group row\">\r\n            <label for=\"personLastNameMaiden\" class=\"col-md-2  col-form-label\" >Nom de naissance</label>\r\n            <div class=\"col-md-4\">\r\n              <input type=\"text\" class=\"form-control\" name=\"personLastNameMaiden\" placeholder=\"Nom de naissance...\"\r\n                [ngClass]=\"{'form-control-plaintext':editMode=='view','form-control':editMode!='view'}\"\r\n                [(ngModel)]=\"currentRecord.lastnamemaiden\"\r\n                [readonly]=\"editMode=='view'\" />\r\n            </div>\r\n          </div>\r\n\r\n          <!-- First name -->\r\n          <div class=\"form-group row\">\r\n            <label for=\"personFirstName\" class=\"col-md-2  col-form-label\" >Prénom</label>\r\n            <div class=\"col-md-4\">\r\n              <input type=\"text\" class=\"form-control\" name=\"personFirstName\" placeholder=\"Prénom...\"\r\n                [ngClass]=\"{'form-control-plaintext':editMode=='view','form-control':editMode!='view'}\"  \r\n                [(ngModel)]=\"currentRecord.firstname\" \r\n                [required]=\"editMode!='view'\"\r\n                [readonly]=\"editMode=='view'\" />\r\n            </div>\r\n          </div>\r\n\r\n          <!-- Gender -->\r\n          <div class='form-group row'>\r\n            <label for=\"personGender\" class='col-md-2  col-form-label'>Sexe </label>\r\n            <div class='col-md-4'>\r\n                <ng-select name=\"personGender\" [items]=\"th('HR_MAIN_GENDER') | async\" bindLabel=\"label\" bindValue=\"id\"\r\n                    [(ngModel)]=\"currentRecord.gender_th\"\r\n                [disabled]=\"editMode=='view'\" required=\"true\">\r\n            </ng-select>\r\n            </div>\r\n          </div>\r\n\r\n          <!-- LDAP identifier -->\r\n          <div class=\"form-group row\">\r\n            <label for=\"personIdentifiantLDAP\" class=\"col-md-2  col-form-label\" >Identifiant</label>\r\n            <div class=\"col-md-4\">\r\n              <input type=\"text\" class=\"form-control\" name=\"personIdentifiantLDAP\" placeholder=\"Identifiant...\"\r\n                [ngClass]=\"{'form-control-plaintext':editMode=='view','form-control':editMode!='view'}\"  \r\n                [(ngModel)]=\"currentRecord.identifiantldap\" \r\n                [required]=\"editMode!='view'\"\r\n                [readonly]=\"editMode=='view'\" pattern=\"[A-Za-z0-9_\\.-]{1,20}\"/>\r\n            </div>\r\n          </div>\r\n\r\n          <!-- Type -->\r\n          <div class='form-group row'>\r\n            <label for=\"personType\" class='col-md-2  col-form-label'>Type </label>\r\n            <div class='col-md-4'>\r\n              <ng-select name=\"personType\" [items]=\"th('HR_MAIN_TYPE') | async\" bindLabel=\"label\" bindValue=\"id\"\r\n                    [(ngModel)]=\"currentRecord.type_th\"\r\n                    [disabled]=\"editMode=='view'\" \r\n                    [required]=\"editMode!='view'\">\r\n              </ng-select>\r\n            </div>\r\n          </div>\r\n\r\n          <!-- Status -->\r\n          <div class='form-group row'>\r\n            <label for=\"personStatus\" class='col-md-2  col-form-label'>Statut </label>\r\n            <div class='col-md-4'>\r\n              <ng-select name=\"personStatus\" [items]=\"th('HR_MAIN_STATUS') | async\" bindLabel=\"label\" bindValue=\"id\"\r\n                [(ngModel)]=\"currentRecord.status_th\"\r\n                [disabled]=\"editMode=='view'\" \r\n                [required]=\"editMode!='view'\">\r\n              </ng-select>\r\n            </div>\r\n          </div>\r\n\r\n          <!-- List of POIs -->\r\n          <div class=\"card\">\r\n            <div class=\"card-body\">\r\n              <h5 class=\"card-title\">Points de prise en charge</h5>\r\n                <div *ngIf=\"!currentRecord.home.POIs || currentRecord.home.POIs.length==0\">\r\n                    <em>Aucun point rattaché à l'usager</em>\r\n                </div>\r\n                <div *ngIf=\"currentRecord.home.POIs && currentRecord.home.POIs.length>0\">\r\n                  <table id=\"POIs-table\" class=\"table table-sm table-striped table-hover\">\r\n                    <thead>\r\n                      <tr>\r\n                        <th>Libellé</th>\r\n                        <th>Adresse</th>\r\n                      </tr>\r\n                    </thead>\r\n                    <tbody>\r\n                      <tr *ngFor=\"let POI of currentRecord.home.POIs ; let i = index\" [attr.data-index]=\"i\">\r\n                        <td>\r\n                          <button *ngIf=\"editMode!='view'\" class=\"btn btn-link\" (click)=\"editPOI(POI,i)\">{{POI.label}}</button>\r\n                          <span *ngIf=\"editMode=='view'\">{{POI.label}}</span>\r\n                        </td>\r\n                        <td>\r\n                          {{POI.addr1}}\r\n                          <span *ngIf=\"POI.addr1 && POI.addr2\"> - </span>\r\n                          {{POI.addr2}}\r\n                          <span *ngIf=\"POI.addr2 && POI.postcode\"> </span>\r\n                          {{POI.postcode}}\r\n                          <span *ngIf=\"POI.postcode && POI.city\"> </span>\r\n                          {{POI.city}}\r\n                        </td>\r\n                      </tr>\r\n                    </tbody>\r\n                  </table>\r\n                </div>\r\n              </div>\r\n            </div>\r\n\r\n          <!-- List of AOIs\r\n          <h5>Zones rattachés à l'usager</h5>\r\n          <div *ngIf=\"!currentRecord.home.AOIs || currentRecord.home.AOIs.length==0\">\r\n              <em>Aucune zone rattachée à l'usager</em>\r\n          </div>\r\n          <div *ngIf=\"currentRecord.home.AOIs && currentRecord.home.AOIs.length>0\">\r\n            <table id=\"AOIs-table\" class=\"table table-sm table-striped table-hover\">\r\n              <thead>\r\n                <tr>\r\n                  <th>Libellé</th>\r\n                  <th *ngIf=\"editMode!='view'\"></th>\r\n                </tr>\r\n              </thead>\r\n              <tbody>\r\n                <tr *ngFor=\"let AOI of currentRecord.home.AOIs ; let i = index\" [attr.data-index]=\"i\">\r\n                  <td>\r\n                    <span *ngIf=\"editMode=='view'\">{{AOI.label}}</span>\r\n                    <span *ngIf=\"editMode!='view'\">\r\n                      <input type=\"text\" class=\"form-control\" name=\"AOILabel{{i}}\" placeholder=\"Libellé...\"\r\n                            [(ngModel)]=\"AOI.label\" required=\"true\"/>\r\n                    </span>\r\n                    <span class=\"badge badge-success\" *ngIf=\"i==0\">Zone principale</span>\r\n                  </td>\r\n                  <td *ngIf=\"editMode!='view'\">\r\n                    <button type=\"button\" id=\"btn-AOI-delete\" class=\"btn btn-link\" (click)=\"deleteAOI(i)\">Supprimer</button>\r\n                  </td>\r\n                </tr>\r\n              </tbody>\r\n            </table>\r\n          </div>\r\n          -->\r\n\r\n          <!-- List of establishments -->\r\n          <div class=\"card mt-3\">\r\n            <div class=\"card-body\">\r\n              <h5 class=\"card-title\">Etablissements\r\n                  <button *ngIf=\"editMode!='view'\" type=\"button\" id=\"btn-add-establishment\" class=\"btn btn-link btn-sm\"\r\n                    (click)=\"addEstablishment()\" >Ajouter des établissements</button>\r\n              </h5>\r\n              <div *ngIf=\"currentRecord.establishments.length==0\">\r\n                <em>Aucun site rattaché à l'usager</em>\r\n              </div>\r\n              <div *ngIf=\"currentRecord.establishments.length>0\">\r\n                <table id=\"site-table\" class=\"table table-sm table-striped table-hover\">\r\n                  <thead>\r\n                    <tr>\r\n                      <th>Référence</th>\r\n                      <th>Libellé</th>\r\n                      <th>Type</th>\r\n                      <th>Statut</th>\r\n                      <th>Propriétaire</th>\r\n                      <th *ngIf=\"editMode!='view'\"></th>\r\n                    </tr>\r\n                  </thead>\r\n                  <tbody>\r\n                    <tr *ngFor=\"let site of currentRecord.establishments ; let i = index\">\r\n                      <td><a [routerLink]=\"['/data/site/crud',site.id]\">{{site.code}}</a></td>\r\n                      <td>{{site.label}}</td>\r\n                      <td>{{site.type_label}}</td>\r\n                      <td>{{site.status_label}}</td>\r\n                      <td>{{site.site_main_label_entity}}</td>\r\n                      <td *ngIf=\"editMode!='view'\">\r\n                          <button type=\"button\" id=\"btn-Establishment-delete\" class=\"btn btn-link\"\r\n                                  (click)=\"deleteEstablishment(i)\">Supprimer</button>\r\n                      </td>\r\n                    </tr>\r\n                  </tbody>\r\n                </table>\r\n              </div>\r\n            </div>\r\n          </div>\r\n        </form>\r\n      </div>\r\n\r\n      <!-- Open a Leaflet map and provided it with the list of POIs and a list of AOIs -->\r\n      <div class=\"col-sm\">\r\n        <map-leaflet\r\n          [editMode]=\"editMode\"\r\n          [POIs]=\"currentRecord.home.POIs\" [changeInPOIs]=\"changeInPOIs\"\r\n          [AOIs]=\"currentRecord.home.AOIs\" [changeInAOIs]=\"changeInAOIs\"\r\n          (newPOI)=\"newPOI($event)\" (newAOI)=\"newAOI($event)\"></map-leaflet>\r\n      </div>\r\n    </div>\r\n  </div>"

/***/ }),

/***/ "./src/app/person/person.crud.ts":
/*!***************************************!*\
  !*** ./src/app/person/person.crud.ts ***!
  \***************************************/
/*! exports provided: PersonCrud */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PersonCrud", function() { return PersonCrud; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ "./node_modules/@ng-bootstrap/ng-bootstrap/fesm5/ng-bootstrap.js");
/* harmony import */ var _basecrud__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../basecrud */ "./src/app/basecrud.ts");
/* harmony import */ var _poi_poi_modal__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../poi/poi-modal */ "./src/app/poi/poi-modal.ts");
/* harmony import */ var _person_establishments_modal__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./person.establishments-modal */ "./src/app/person/person.establishments-modal.ts");
/* harmony import */ var _person_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./person.service */ "./src/app/person/person.service.ts");
/* harmony import */ var _thesaurus_thesaurus_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../thesaurus/thesaurus.service */ "./src/app/thesaurus/thesaurus.service.ts");
/* harmony import */ var _alert_alert_service__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../alert/alert.service */ "./src/app/alert/alert.service.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};









var PersonCrud = /** @class */ (function (_super) {
    __extends(PersonCrud, _super);
    function PersonCrud(route, router, personService, thService, alertService, modalService) {
        var _this = 
        // Inject data service - it will be used by parent BaseCrud class
        // to run CRUD actions
        // It populates currentRecord member variable
        _super.call(this, personService, thService, router) || this;
        _this.route = route;
        _this.router = router;
        _this.personService = personService;
        _this.thService = thService;
        _this.alertService = alertService;
        _this.modalService = modalService;
        _this.changeInPOIs = 0;
        _this.changeInAOIs = 0;
        _this.bChanges = false;
        // In case some data is loaded or reloaded
        _this.dataLoaded.subscribe(function (currentRecord) {
            // After data loading, no changes have occured
            _this.bChanges = false;
            // Force the display of POIs and AOIs on the map
            _this.changeInPOIs++;
            _this.changeInAOIs++;
        });
        return _this;
    }
    /**
     * Called after DOM completion. It will request data from server
     */
    PersonCrud.prototype.ngOnInit = function () {
        var _this = this;
        // Load Person
        this.route.params.subscribe(function (routeParams) {
            _super.prototype.init.call(_this, routeParams.id);
        });
    };
    /**
     * Triggered by map-leaflet Component after a marker drawing event on the map
     */
    PersonCrud.prototype.newPOI = function (event) {
        var poi = { geom: event.value.geometry };
        this.currentRecord.home.POIs.push(poi);
        this.editPOI(poi, this.currentRecord.home.POIs.length - 1);
    };
    /**
     * Remove a POI from the list of POIs and also from the map
     */
    PersonCrud.prototype.editPOI = function (poi, i) {
        var _this = this;
        var modalRef = this.modalService.open(_poi_poi_modal__WEBPACK_IMPORTED_MODULE_4__["POIModal"]);
        modalRef.componentInstance.poi = poi;
        modalRef.result.then(function (result) {
            if (result == "delete") {
                _this.currentRecord.home.POIs.splice(i, 1);
            }
        }).catch(function (error) {
            console.log(error);
        });
        // Trigger the change detection on map so that POIs display can be updated on map
        this.changeInPOIs++;
        this.bChanges = true;
    };
    /**
     * Triggered by map-leaflet Component after a polygon drawing event on the map
     */
    PersonCrud.prototype.newAOI = function (event) {
        this.currentRecord.home.AOIs.push({ geom: event.value.geometry });
        this.bChanges = true;
    };
    /**
     * Remove a POI from the list of POIs and also from the map
     * @param index : index of the POI
     */
    PersonCrud.prototype.deletePOI = function (index) {
        this.currentRecord.home.POIs.splice(index, 1);
        // Trigger the change detection on map so that POIs display can be updated on map
        this.changeInPOIs++;
        this.bChanges = true;
    };
    /**
     * Remove a AOI from the list of AOIs and also from the map
     * @param index : index of the AOI
     */
    PersonCrud.prototype.deleteAOI = function (index) {
        this.currentRecord.home.AOIs.splice(index, 1);
        // Trigger the change detection on map so that AOIs display can be updated on map
        this.changeInAOIs++;
        this.bChanges = true;
    };
    /**
     * Remove an establishement from the list of establishments
     * @param index : index of the establihsment
     */
    PersonCrud.prototype.deleteEstablishment = function (index) {
        this.currentRecord.establishments.splice(index, 1);
        this.bChanges = true;
    };
    /**
     * open the modal for adding a new establishment to the list of establishement
     */
    PersonCrud.prototype.addEstablishment = function () {
        var modalRef = this.modalService.open(_person_establishments_modal__WEBPACK_IMPORTED_MODULE_5__["PersonEstablishmentsModal"], { size: 'lg' });
        modalRef.componentInstance.establishments = this.currentRecord.establishments;
        modalRef.result.then(function (result) {
        }).catch(function (error) {
            console.log(error);
        });
        // Trigger the change detection on map so that POIs display can be updated on map
        this.changeInPOIs++;
        this.bChanges = true;
    };
    PersonCrud = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-person-crud',
            template: __webpack_require__(/*! ./person.crud.html */ "./src/app/person/person.crud.html"),
            styles: [__webpack_require__(/*! ./person.css */ "./src/app/person/person.css")]
        }),
        __metadata("design:paramtypes", [_angular_router__WEBPACK_IMPORTED_MODULE_1__["ActivatedRoute"],
            _angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"],
            _person_service__WEBPACK_IMPORTED_MODULE_6__["PersonService"],
            _thesaurus_thesaurus_service__WEBPACK_IMPORTED_MODULE_7__["ThesaurusService"],
            _alert_alert_service__WEBPACK_IMPORTED_MODULE_8__["AlertService"],
            _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_2__["NgbModal"]])
    ], PersonCrud);
    return PersonCrud;
}(_basecrud__WEBPACK_IMPORTED_MODULE_3__["BaseCrud"]));



/***/ }),

/***/ "./src/app/person/person.css":
/*!***********************************!*\
  !*** ./src/app/person/person.css ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/person/person.establishments-modal.html":
/*!*********************************************************!*\
  !*** ./src/app/person/person.establishments-modal.html ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<!-- Modal for picking new establishments for a pereson-->\r\n<div class=\"modal-header\">\r\n  <h4 class=\"modal-title\" id=\"modal-basic-title\" >Ajouter des établissements</h4>\r\n  <button type=\"button\" class=\"close\" aria-label=\"Close\" (click)=\"activeModal.close(null)\">\r\n    <span aria-hidden=\"true\">&times;</span>\r\n  </button>\r\n</div>\r\n<div class=\"modal-body\">\r\n  <div *ngIf=\"otherEstablishments.length==0\">\r\n    <em>Aucun établissement trouvé</em>\r\n  </div>    \r\n  <div class=\"form-group\" fillHeight=\"350\" [hidden]=\"otherEstablishments.length==0\">\r\n    <ag-grid-angular \r\n      style=\"height: 100%;\" \r\n      class=\"ag-theme-material\"\r\n      [gridOptions]=\"gridOptions\"\r\n      [rowData]=\"otherEstablishments\" \r\n      [enableFilter]=\"true\"\r\n      rowSelection=\"multiple\">\r\n    </ag-grid-angular>\r\n  </div>\r\n</div>\r\n<div class=\"modal-footer\" [hidden]=\"otherEstablishments.length==0\">\r\n  <button type=\"button\" class=\"btn btn-success btn-sm\" (click)=\"saveModal()\" >Valider</button>\r\n  <button type=\"button\" class=\"btn btn-danger btn-sm\" (click)=\"activeModal.close(null)\">Annuler</button>\r\n</div>\r\n    "

/***/ }),

/***/ "./src/app/person/person.establishments-modal.ts":
/*!*******************************************************!*\
  !*** ./src/app/person/person.establishments-modal.ts ***!
  \*******************************************************/
/*! exports provided: PersonEstablishmentsModal */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PersonEstablishmentsModal", function() { return PersonEstablishmentsModal; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ "./node_modules/@ng-bootstrap/ng-bootstrap/fesm5/ng-bootstrap.js");
/* harmony import */ var _site_site_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../site/site.service */ "./src/app/site/site.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var PersonEstablishmentsModal = /** @class */ (function () {
    function PersonEstablishmentsModal(siteService, activeModal) {
        var _this = this;
        this.siteService = siteService;
        this.activeModal = activeModal;
        this.siteService.list({
            typeCode: "ETABLISHMENT", statusCode: "ENABLED", search: "", startIndex: 0, length: 0
        }).subscribe(function (sites) {
            _this.otherEstablishments = [];
            for (var _i = 0, sites_1 = sites; _i < sites_1.length; _i++) {
                var site = sites_1[_i];
                _this.insertSite(site);
            }
        });
        this.gridOptions = {
            rowHeight: 30,
            headerHeight: 30,
            columnDefs: [
                { headerName: 'Référence', field: 'code', checkboxSelection: true },
                { headerName: 'Description', field: 'label' },
                { headerName: 'Adresse', field: 'address' },
            ]
        };
    }
    /**
     * Called when grid is ready
     * @param params sent by the grid
     */
    PersonEstablishmentsModal.prototype.gridReady = function (params) {
        params.api.sizeColumnsToFit();
    };
    /**
     * Insert a site in this.otherEstablishments only if the site does not belong to this.establishments.
     * @param site a site to be inserted into this.otherEstablishments
     */
    PersonEstablishmentsModal.prototype.insertSite = function (site) {
        // Make sure that already selected establishments will not appear in the list
        // TODO : je pense que pour de gros volumes de données il faudrait faire ce filtrage côté serveur
        var bAlreadyInList = false;
        for (var _i = 0, _a = this.establishments; _i < _a.length; _i++) {
            var establishment = _a[_i];
            if (establishment.code == site.code) {
                bAlreadyInList = true;
                break;
            }
        }
        if (!bAlreadyInList) {
            this.otherEstablishments.push({
                id: site.id,
                code: site.code,
                label: site.label,
                address: this.formatAddress(site),
                type_label: site.type_label,
                status_label: site.status_label,
                site_main_label_entity: site.site_main_label_entity
            });
        }
    };
    /**
     * Compute an address for a site by concatenating the site address subfields
     * @param site a site for which we need to compute the address in one field
     * @return string : the address for the site
     */
    PersonEstablishmentsModal.prototype.formatAddress = function (site) {
        var address = "";
        if (site.addr1 != null) {
            address += site.addr1;
        }
        if (site.addr2 != null) {
            if (address != '') {
                address += ' - ';
            }
            address += site.addr2;
        }
        if (site.postcode != null) {
            if (address != '') {
                address += ' ';
            }
            address += site.postcode;
        }
        if (site.city != null) {
            if (address != '') {
                address += ' ';
            }
            address += site.city;
        }
        return address;
    };
    /**
     * Triggered on "Valider" button click : it will update this.establishments with selected items from
     *   this.otherEstablishments
     */
    PersonEstablishmentsModal.prototype.saveModal = function () {
        var _this = this;
        this.gridOptions.api.forEachNode(function (node) {
            if (node.isSelected()) {
                _this.establishments.push(node.data);
            }
        });
        this.activeModal.close("save");
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])('establishements'),
        __metadata("design:type", Array)
    ], PersonEstablishmentsModal.prototype, "establishments", void 0);
    PersonEstablishmentsModal = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            template: __webpack_require__(/*! ./person.establishments-modal.html */ "./src/app/person/person.establishments-modal.html"),
        }),
        __metadata("design:paramtypes", [_site_site_service__WEBPACK_IMPORTED_MODULE_2__["SiteService"], _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_1__["NgbActiveModal"]])
    ], PersonEstablishmentsModal);
    return PersonEstablishmentsModal;
}());



/***/ }),

/***/ "./src/app/person/person.list.html":
/*!*****************************************!*\
  !*** ./src/app/person/person.list.html ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div>\r\n    <fieldset>\r\n      <list-navbar [title]=\"'Usagers'\"></list-navbar>\r\n      <div>\r\n        <table id=\"person-table\" class=\"table table-striped table-bordered table-hover tbl-list\">\r\n         <thead>\r\n          <tr>\r\n            <th>Nom</th>\r\n            <th>Nom de naissance</th>\r\n            <th>Prénom</th>\r\n            <th>Sexe</th>\r\n            <th>Identifiant</th>\r\n            <th>Date de naissance</th>\r\n            <th>Statut</th>\r\n            <th>Type</th>\r\n          </tr>\r\n         </thead>\r\n         <tbody>\r\n            <tr *ngFor=\"let person of persons\">\r\n              <td><a [routerLink]=\"['/data/person/crud',person.id]\">{{person.lastname}}</a></td>\r\n              <td>{{person.lastnamemainden}}</td>\r\n              <td>{{person.firstname}}</td>\r\n              <td>{{person.gender_label}}</td>\r\n              <td>{{person.identifiantldap}}</td>\r\n              <td>{{person.birthday_dt | date}}</td>\r\n              <td>{{person.status_label}}</td>\r\n              <td>{{person.type_label}}</td>\r\n           </tr>\r\n         </tbody>\r\n        </table>\r\n      </div>\r\n  </fieldset>\r\n  </div>"

/***/ }),

/***/ "./src/app/person/person.list.ts":
/*!***************************************!*\
  !*** ./src/app/person/person.list.ts ***!
  \***************************************/
/*! exports provided: PersonList */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PersonList", function() { return PersonList; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _person_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./person.service */ "./src/app/person/person.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var PersonList = /** @class */ (function () {
    function PersonList(personService) {
        this.personService = personService;
    }
    PersonList.prototype.ngOnInit = function () {
        var _this = this;
        this.personService.list({ typeCode: null, statusCode: null,
            search: null, startIndex: null, length: null })
            .subscribe(function (persons) { _this.persons = persons; });
    };
    PersonList = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-person',
            template: __webpack_require__(/*! ./person.list.html */ "./src/app/person/person.list.html"),
            styles: [__webpack_require__(/*! ./person.css */ "./src/app/person/person.css")]
        }),
        __metadata("design:paramtypes", [_person_service__WEBPACK_IMPORTED_MODULE_1__["PersonService"]])
    ], PersonList);
    return PersonList;
}());



/***/ }),

/***/ "./src/app/person/person.service.ts":
/*!******************************************!*\
  !*** ./src/app/person/person.service.ts ***!
  \******************************************/
/*! exports provided: PersonService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PersonService", function() { return PersonService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var _basecrud_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../basecrud.service */ "./src/app/basecrud.service.ts");
/* harmony import */ var _person__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./person */ "./src/app/person/person.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var PersonService = /** @class */ (function (_super) {
    __extends(PersonService, _super);
    function PersonService(http) {
        var _this = _super.call(this, http) || this;
        _this.http = http;
        return _this;
    }
    /**
    * Get a list of persons. The following [optional] filters are available :
    *   typeCode : person type (see thesaurus)
    *   statusCode : person status (see thesaurus)
    *   search : search pattern to apply on person code and label
    *   startIndex : number of skipped hits in the list returned by the server
    *   length : number of kept hits in the list returned by the server
    * @param filters : search filters
    */
    PersonService.prototype.list = function (filters) {
        return _super.prototype.list.call(this, filters);
    };
    PersonService.prototype.createRecord = function () {
        return new _person__WEBPACK_IMPORTED_MODULE_3__["Person"]();
    };
    PersonService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])({
            providedIn: 'root'
        }),
        __metadata("design:paramtypes", [_angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"]])
    ], PersonService);
    return PersonService;
}(_basecrud_service__WEBPACK_IMPORTED_MODULE_2__["BaseCrudService"]));



/***/ }),

/***/ "./src/app/person/person.ts":
/*!**********************************!*\
  !*** ./src/app/person/person.ts ***!
  \**********************************/
/*! exports provided: Person */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Person", function() { return Person; });
/* harmony import */ var _baserecord__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../baserecord */ "./src/app/baserecord.ts");
/* harmony import */ var _site_site__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../site/site */ "./src/app/site/site.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();


/**
 * Description on the Person class : the fields listed below all result from personService.get service.
 */
var Person = /** @class */ (function (_super) {
    __extends(Person, _super);
    function Person() {
        var _this = _super.call(this) || this;
        _this.establishments = [];
        _this.home = new _site_site__WEBPACK_IMPORTED_MODULE_1__["Site"]();
        return _this;
    }
    return Person;
}(_baserecord__WEBPACK_IMPORTED_MODULE_0__["BaseRecord"]));



/***/ }),

/***/ "./src/app/poi/poi-modal.html":
/*!************************************!*\
  !*** ./src/app/poi/poi-modal.html ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<!-- New Role Modal -->\r\n<div class=\"modal-header\">\r\n\t<h4 class=\"modal-title\" id=\"modal-basic-title\" *ngIf=\"!poi.id\">Nouveau POI</h4>\r\n\t<h4 class=\"modal-title\" id=\"modal-basic-title\" *ngIf=\"poi.id\">POI {{poi.code}}</h4>\r\n\t<button type=\"button\" class=\"close\" aria-label=\"Close\" (click)=\"activeModal.close(null)\">\r\n\t  <span aria-hidden=\"true\">&times;</span>\r\n\t</button>\r\n</div>\r\n<div class=\"modal-body\">\r\n\t<form #poiForm=\"ngForm\">\r\n\t  <div class=\"form-group row\">\r\n      <label for=\"label\" class=\"col-lg-3 col-form-label\">Description </label>\r\n      <div class=\"col-lg-9\">\r\n        <input type=\"text\" class=\"form-control\" name=\"label\"\r\n        \t   [(ngModel)]=\"poi.label\" required/>\r\n      </div>\r\n    </div>\r\n\t  <div class=\"form-group row\">\r\n      <label for=\"addr1\" class=\"col-lg-3 col-form-label\">Adresse </label>\r\n      <div class=\"col-lg-9\">\r\n        <input type=\"text\" class=\"form-control\" name=\"addr1\"\r\n        \t   [(ngModel)]=\"poi.addr1\" required/>\r\n      </div>\r\n    </div>\r\n\t  <div class=\"form-group row\">\r\n      <label for=\"addr2\" class=\"col-lg-3 col-form-label\">Complément</label>\r\n      <div class=\"col-lg-9\">\r\n        <input type=\"text\" class=\"form-control\" name=\"addr2\"\r\n        \t   [(ngModel)]=\"poi.addr2\"/>\r\n      </div>\r\n    </div>\r\n\t  <div class=\"form-group row\">\r\n      <label for=\"postcode\" class=\"col-lg-3 col-form-label\">Code Postal </label>\r\n      <div class=\"col-lg-9\">\r\n        <input type=\"text\" class=\"form-control\" name=\"postcode\"\r\n        \t   [(ngModel)]=\"poi.postcode\" required pattern=\"[0-9]{4,5}\"/>\r\n      </div>\r\n    </div>\r\n\t  <div class=\"form-group row\">\r\n      <label for=\"city\" class=\"col-lg-3 col-form-label\">Ville </label>\r\n      <div class=\"col-lg-9\">\r\n        <input type=\"text\" class=\"form-control\" name=\"city\"\r\n        \t   [(ngModel)]=\"poi.city\" required/>\r\n      </div>\r\n    </div>    \r\n  </form>\r\n</div>\r\n<div class=\"modal-footer\">\r\n\t<button type=\"button\" class=\"btn btn-success btn-sm\" (click)=\"saveModal()\">Valider</button>\r\n\t<button type=\"button\" *ngIf=\"poi.id\" class=\"btn btn-danger btn-sm\" (click)=\"deletePOI()\">Supprimer</button>\r\n</div>"

/***/ }),

/***/ "./src/app/poi/poi-modal.ts":
/*!**********************************!*\
  !*** ./src/app/poi/poi-modal.ts ***!
  \**********************************/
/*! exports provided: POIModal */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "POIModal", function() { return POIModal; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ "./node_modules/@ng-bootstrap/ng-bootstrap/fesm5/ng-bootstrap.js");
/* harmony import */ var _thesaurus_thesaurus_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../thesaurus/thesaurus.service */ "./src/app/thesaurus/thesaurus.service.ts");
/* harmony import */ var _poi__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./poi */ "./src/app/poi/poi.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var POIModal = /** @class */ (function () {
    function POIModal(thService, activeModal) {
        this.thService = thService;
        this.activeModal = activeModal;
    }
    POIModal.prototype.ngOnInit = function () {
    };
    POIModal.prototype.saveModal = function () {
        this.activeModal.close("save");
    };
    POIModal.prototype.deletePOI = function () {
        this.activeModal.close("delete");
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])('poi'),
        __metadata("design:type", _poi__WEBPACK_IMPORTED_MODULE_3__["POI"])
    ], POIModal.prototype, "poi", void 0);
    POIModal = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            template: __webpack_require__(/*! ./poi-modal.html */ "./src/app/poi/poi-modal.html"),
        }),
        __metadata("design:paramtypes", [_thesaurus_thesaurus_service__WEBPACK_IMPORTED_MODULE_2__["ThesaurusService"],
            _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_1__["NgbActiveModal"]])
    ], POIModal);
    return POIModal;
}());



/***/ }),

/***/ "./src/app/poi/poi.ts":
/*!****************************!*\
  !*** ./src/app/poi/poi.ts ***!
  \****************************/
/*! exports provided: POI */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "POI", function() { return POI; });
/* harmony import */ var _baserecord__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../baserecord */ "./src/app/baserecord.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

/**
 * Description on the POI class : the fields listed below all result from poiService.get service.
 */
var POI = /** @class */ (function (_super) {
    __extends(POI, _super);
    function POI() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return POI;
}(_baserecord__WEBPACK_IMPORTED_MODULE_0__["BaseRecord"]));



/***/ }),

/***/ "./src/app/site/site.crud.html":
/*!*************************************!*\
  !*** ./src/app/site/site.crud.html ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"container-fluid\">\r\n  <div class=\"row\" fillHeight>\r\n    <div class=\"col-sm\">\r\n\r\n      <alert-component></alert-component>\r\n\r\n      <!-- Main formular -->\r\n      <form #siteForm=\"ngForm\" novalidate=\"true\" autocomplete=\"off\" *ngIf=\"currentRecord\">\r\n\r\n        <!-- Has to be included within the formular so that crud-navbar component is aware of siteForm variable -->\r\n        <crud-navbar\r\n          [editMode]=\"editMode\"\r\n          [valid]=\"siteForm.form.valid && (entity.id==undefined || entity.id!=currentRecord.id)\"\r\n          [pristine]=\"siteForm.form.pristine && !bChanges\"\r\n          (editModeChange)=\"editModeChange($event)\"\r\n          (saveEvent)=\"save()\"\r\n          (markAsRemovedEvent)=\"markAsRemoved()\"\r\n          (deleteEvent)=\"delete()\"\r\n          [title]=\"(currentRecord.id ? 'Site ' + currentRecord.code : 'Nouveau site')\"\r\n          [aclObject]=\"'site'\"\r\n          [recordId]=\"currentRecord.id\">\r\n        </crud-navbar>\r\n\r\n        <!-- Code -->\r\n        <div class=\"form-group row\">\r\n          <label for=\"siteCode\" class=\"col-md-2 col-form-label\">Référence</label>\r\n          <div class=\"col-md-4\">\r\n            <input type=\"text\" name=\"siteCode\" [(ngModel)]=\"currentRecord.code\"\r\n              [ngClass]=\"{'form-control-plaintext':editMode=='view','form-control':editMode!='view'}\"\r\n              [readonly]=\"editMode=='view'\" [required]=\"editMode!='view'\"\r\n              pattern=\"[A-Za-z0-9_\\.-]{1,20}\"/>\r\n          </div>\r\n        </div>\r\n\r\n        <!-- Description of the site -->\r\n        <div class=\"form-group row\">\r\n          <label for=\"siteLabel\" class=\"col-md-2 col-form-label\">Description</label>\r\n          <div class=\"col-md-10\">\r\n            <input type=\"text\" name=\"siteLabel\" [(ngModel)]=\"currentRecord.label\"\r\n              [ngClass]=\"{'form-control-plaintext':editMode=='view','form-control':editMode!='view'}\"\r\n              [readonly]=\"editMode=='view'\"\r\n              [required]=\"editMode!='view'\"/>\r\n          </div>\r\n        </div>\r\n\r\n        <!-- Site type -->\r\n        <div class='form-group row'>\r\n          <label for=\"siteType\" class='col-md-2 col-form-label'>Type</label>\r\n          <div class='col-md-4'>\r\n          \t<ng-select name=\"siteType\" [(ngModel)]=\"currentRecord.type_th\"\r\n              [items]=\"th('SITE_MAIN_TYPE') | async\" bindLabel=\"label\" bindValue=\"id\"          \t\t\r\n              [disabled]=\"editMode=='view'\" required=\"true\">\r\n          </ng-select>\r\n          </div>\r\n        </div>\r\n\r\n        <!-- Site status -->\r\n        <div class='form-group row'>\r\n          <label for=\"siteStatus\" class='col-md-2 col-form-label'>Statut</label>\r\n          <div class='col-md-4'>\r\n            <ng-select name=\"siteStatus\" [items]=\"th('SITE_MAIN_STATUS') | async\" bindLabel=\"label\" bindValue=\"id\"\r\n              [(ngModel)]=\"currentRecord.status_th\"\r\n              [disabled]=\"editMode=='view'\" required=\"true\">\r\n            </ng-select>\r\n          </div>\r\n        </div>\r\n\r\n        <!-- Template for the following typeahead -->\r\n        <ng-template #rt let-r=\"result\" let-t=\"term\">\r\n          <ngb-highlight [result]=\"r.code\" [term]=\"t\"></ngb-highlight>\r\n          <ngb-highlight [result]=\"r.label\" [term]=\"t\"></ngb-highlight>\r\n        </ng-template>\r\n\r\n        <!-- Site entity -->\r\n        <div class=\"form-group row\">\r\n          <label for=\"siteOwner\" class=\"col-md-2 col-form-label\" >Entité</label>\r\n          <div class=\"col-md-4\">\r\n            <input type=\"text\" name=\"siteOwner\"\r\n              [ngClass]=\"{'form-control-plaintext':editMode=='view','form-control':editMode!='view'}\"\r\n              [(ngModel)]=\"entity\" [ngbTypeahead]=\"search\" [resultTemplate]=\"rt\"\r\n              [inputFormatter]=\"formatter\" [disabled]=\"editMode=='view'\"/>\r\n          </div>\r\n          <div class=\"col-md-6\" *ngIf=\"entity\">\r\n            <!-- Be careful with circular dependencies to an existing site-->\r\n            <span class=\"badge badge-success\" *ngIf=\"entity.id!=currentRecord.id\">{{entity.label}}</span>\r\n            <span class=\"badge badge-danger\" *ngIf=\"entity.id!=undefined && entity.id==currentRecord.id\">\r\n              L'entité ne peut pas être le site lui-même. Veuillez choisir une autre entité.\r\n            </span>\r\n          </div>\r\n        </div>\r\n\r\n        <!-- List of POIs -->\r\n        <h5>Points rattachés au site</h5>\r\n        <div *ngIf=\"!currentRecord.POIs || currentRecord.POIs.length==0\">\r\n          <em>Aucun point rattaché au site</em>\r\n        </div>\r\n        <div *ngIf=\"currentRecord.POIs && currentRecord.POIs.length>0\">\r\n          <table id=\"POIs-table\" class=\"table table-sm table-striped table-hover\">\r\n            <thead>\r\n              <tr>\r\n                <th>Libellé</th>\r\n                <th>Adresse</th>\r\n              </tr>\r\n            </thead>\r\n            <tbody>\r\n              <tr *ngFor=\"let POI of currentRecord.POIs ; let i = index\" [attr.data-index]=\"i\">\r\n                <td>\r\n                  <button *ngIf=\"editMode!='view'\" class=\"btn btn-link\" (click)=\"editPOI(POI,i)\">{{POI.label}}</button>\r\n                  <span *ngIf=\"editMode=='view'\">{{POI.label}}</span>\r\n                </td>\r\n                <td>\r\n                  {{POI.addr1}}\r\n                  <span *ngIf=\"POI.addr1 && POI.addr2\"> - </span>\r\n                  {{POI.addr2}}\r\n                  <span *ngIf=\"POI.addr2 && POI.postcode\"> </span>\r\n                  {{POI.postcode}}\r\n                  <span *ngIf=\"POI.postcode && POI.city\"> </span>\r\n                  {{POI.city}}\r\n                </td>\r\n              </tr>\r\n            </tbody>\r\n          </table>\r\n        </div>\r\n\r\n        <!-- List of AOIs -->\r\n        <h5>Zones rattachés au site</h5>\r\n        <div *ngIf=\"!currentRecord.AOIs || currentRecord.AOIs.length==0\">\r\n          <em>Aucune zone rattachée au site</em>\r\n        </div>\r\n        <div *ngIf=\"currentRecord.AOIs && currentRecord.AOIs.length>0\">\r\n          <table id=\"AOIs-table\" class=\"table table-striped table-bordered table-hover tbl-list\">\r\n            <thead>\r\n              <tr>\r\n                <th>Libellé</th>\r\n                <th *ngIf=\"editMode!='view'\"></th>\r\n              </tr>\r\n            </thead>\r\n            <tbody>\r\n              <tr *ngFor=\"let AOI of currentRecord.AOIs ; let i = index\" [attr.data-index]=\"i\">\r\n                <td>\r\n                  <span *ngIf=\"editMode=='view'\">{{AOI.label}}</span>\r\n                  <span *ngIf=\"editMode!='view'\">\r\n                    <input type=\"text\" class=\"form-control\" name=\"AOILabel{{i}}\" placeholder=\"Libellé...\"\r\n                      [(ngModel)]=\"AOI.label\" required=\"true\"/>\r\n                  </span>\r\n                  <span class=\"badge badge-success\" *ngIf=\"i==0\">Zone principale</span>\r\n                </td>\r\n                <td *ngIf=\"editMode!='view'\">\r\n                  <button type=\"button\" id=\"btn-AOI-delete\" class=\"btn btn-link\" (click)=\"deleteAOI(i)\">Supprimer</button>\r\n                </td>\r\n              </tr>\r\n            </tbody>\r\n          </table>\r\n        </div>\r\n      </form>\r\n    </div>\r\n\r\n    <!-- Open a Leaflet map and provided it with the list of POIs and a list of AOIs -->\r\n    <div class=\"col-sm\">\r\n      <map-leaflet\r\n        [editMode]=\"editMode\"\r\n        [POIs]=\"currentRecord.POIs\" [changeInPOIs]=\"changeInPOIs\"\r\n        [AOIs]=\"currentRecord.AOIs\" [changeInAOIs]=\"changeInAOIs\"\r\n        (newPOI)=\"newPOI($event)\" (newAOI)=\"newAOI($event)\"></map-leaflet>\r\n    </div>\r\n  </div>\r\n</div>"

/***/ }),

/***/ "./src/app/site/site.crud.ts":
/*!***********************************!*\
  !*** ./src/app/site/site.crud.ts ***!
  \***********************************/
/*! exports provided: SiteCrud */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SiteCrud", function() { return SiteCrud; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ng-bootstrap/ng-bootstrap */ "./node_modules/@ng-bootstrap/ng-bootstrap/fesm5/ng-bootstrap.js");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm5/operators/index.js");
/* harmony import */ var _basecrud__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../basecrud */ "./src/app/basecrud.ts");
/* harmony import */ var _site__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./site */ "./src/app/site/site.ts");
/* harmony import */ var _poi_poi_modal__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../poi/poi-modal */ "./src/app/poi/poi-modal.ts");
/* harmony import */ var _site_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./site.service */ "./src/app/site/site.service.ts");
/* harmony import */ var _thesaurus_thesaurus_service__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../thesaurus/thesaurus.service */ "./src/app/thesaurus/thesaurus.service.ts");
/* harmony import */ var _alert_alert_service__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../alert/alert.service */ "./src/app/alert/alert.service.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};










var SiteCrud = /** @class */ (function (_super) {
    __extends(SiteCrud, _super);
    function SiteCrud(route, router, siteService, thService, alertService, modalService) {
        var _this = 
        // Inject data service - it will be used by parent BaseCrud class
        // to run CRUD actions
        // It populates currentRecord member variable
        _super.call(this, siteService, thService, router) || this;
        _this.route = route;
        _this.router = router;
        _this.siteService = siteService;
        _this.thService = thService;
        _this.alertService = alertService;
        _this.modalService = modalService;
        // Function to search an entity through the entity typeahead
        _this.search = function (text$) {
            return text$.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["debounceTime"])(300), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["distinctUntilChanged"])(), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["switchMap"])(function (term) {
                return _this.siteService.list({ typeCode: '', statusCode: '', search: term, startIndex: 0, length: 0 });
            }));
        };
        // Function to format an entity through the entity typeahead
        _this.formatter = function (x) { return x.code; };
        _this.changeInPOIs = 0;
        _this.changeInAOIs = 0;
        _this.entity = new _site__WEBPACK_IMPORTED_MODULE_5__["Site"]();
        _this.bChanges = false;
        // In case some data is loaded or reloaded
        _this.dataLoaded.subscribe(function (currentRecord) {
            // After data loading, no changes have occured
            _this.bChanges = false;
            // Force the display of POIs and AOIs on the map
            _this.changeInPOIs++;
            _this.changeInAOIs++;
            // Load the entity attached to the site (if any)
            var entityId = _this.currentRecord.site_main_id_entity;
            if (entityId != undefined) {
                _this.siteService.get(entityId).subscribe(function (data) {
                    _this.entity = data;
                });
            }
            else {
                _this.entity = new _site__WEBPACK_IMPORTED_MODULE_5__["Site"]();
            }
        });
        return _this;
    }
    /**
     * Called after DOM completion. It will request data from server
     */
    SiteCrud.prototype.ngOnInit = function () {
        var _this = this;
        // Load Site
        this.route.params.subscribe(function (routeParams) {
            _super.prototype.init.call(_this, routeParams.id);
        });
    };
    /**
     * Triggered by map-leaflet Component after a marker drawing event on the map
     */
    SiteCrud.prototype.newPOI = function (event) {
        var poi = { geom: event.value.geometry };
        this.currentRecord.POIs.push(poi);
        poi.position = this.currentRecord.POIs.length;
        this.editPOI(poi, this.currentRecord.POIs.length - 1);
    };
    /**
     * Triggered by map-leaflet Component after a polygon drawing event on the map
     */
    SiteCrud.prototype.newAOI = function (event) {
        this.currentRecord.AOIs.push({ geom: event.value.geometry });
        this.bChanges = true;
    };
    /**
     * Remove a POI from the list of POIs and also from the map
     */
    SiteCrud.prototype.editPOI = function (poi, i) {
        //var poi = this.currentRecord.POIs[index];
        var _this = this;
        var modalRef = this.modalService.open(_poi_poi_modal__WEBPACK_IMPORTED_MODULE_6__["POIModal"]);
        modalRef.componentInstance.poi = poi;
        modalRef.result.then(function (result) {
            if (result == "delete") {
                _this.currentRecord.POIs.splice(i, 1);
            }
        }).catch(function (error) {
            console.log(error);
        });
        // Trigger the change detection on map so that POIs display can be updated on map
        this.changeInPOIs++;
        this.bChanges = true;
    };
    /**
     * Remove a AOI from the list of AOIs and also from the map
     */
    SiteCrud.prototype.deleteAOI = function (index) {
        this.currentRecord.AOIs.splice(index, 1);
        // Trigger the change detection on map so that AOIs display can be updated on map
        this.changeInAOIs++;
        this.bChanges = true;
    };
    /**
     * Copy into currentRecord the data that will be sent for an update or insert
     */
    SiteCrud.prototype.checkData = function () {
        this.currentRecord.site_main_id_entity = this.entity.id;
    };
    SiteCrud = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-site-crud',
            template: __webpack_require__(/*! ./site.crud.html */ "./src/app/site/site.crud.html"),
            styles: [__webpack_require__(/*! ./site.css */ "./src/app/site/site.css")]
        }),
        __metadata("design:paramtypes", [_angular_router__WEBPACK_IMPORTED_MODULE_1__["ActivatedRoute"],
            _angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"],
            _site_service__WEBPACK_IMPORTED_MODULE_7__["SiteService"],
            _thesaurus_thesaurus_service__WEBPACK_IMPORTED_MODULE_8__["ThesaurusService"],
            _alert_alert_service__WEBPACK_IMPORTED_MODULE_9__["AlertService"],
            _ng_bootstrap_ng_bootstrap__WEBPACK_IMPORTED_MODULE_2__["NgbModal"]])
    ], SiteCrud);
    return SiteCrud;
}(_basecrud__WEBPACK_IMPORTED_MODULE_4__["BaseCrud"]));



/***/ }),

/***/ "./src/app/site/site.css":
/*!*******************************!*\
  !*** ./src/app/site/site.css ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/site/site.list.html":
/*!*************************************!*\
  !*** ./src/app/site/site.list.html ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"container-fluid\">\r\n  <fieldset>\r\n    <list-navbar [title]=\"'Sites'\"></list-navbar>\r\n    <div>\r\n      <table id=\"site-table\" class=\"table table-sm table-striped table-hover\">\r\n       <thead>\r\n        <tr>\r\n          <th>Référence</th>\r\n          <th>Libellé</th>\r\n          <th>Type</th>\r\n          <th>Statut</th>\r\n          <th>Propriétaire</th>\r\n        </tr>\r\n       </thead>\r\n       <tbody>\r\n          <tr *ngFor=\"let site of sites\">\r\n            <td><a [routerLink]=\"['/data/site/crud',site.id]\">{{site.code}}</a></td>\r\n            <td >{{site.label}}</td>\r\n            <td>{{site.type_label}}</td>\r\n            <td>{{site.status_label}}</td>\r\n            <td>{{site.owner_label}}</td>\r\n         </tr>\r\n       </tbody>\r\n      </table>\r\n    </div>\r\n  </fieldset>\r\n</div>"

/***/ }),

/***/ "./src/app/site/site.list.ts":
/*!***********************************!*\
  !*** ./src/app/site/site.list.ts ***!
  \***********************************/
/*! exports provided: SiteList */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SiteList", function() { return SiteList; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _site_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./site.service */ "./src/app/site/site.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var SiteList = /** @class */ (function () {
    function SiteList(siteService) {
        this.siteService = siteService;
    }
    SiteList.prototype.ngOnInit = function () {
        var _this = this;
        this.siteService.list({ typeCode: null, statusCode: null,
            search: null, startIndex: null, length: null })
            .subscribe(function (sites) { _this.sites = sites; });
    };
    SiteList = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-site',
            template: __webpack_require__(/*! ./site.list.html */ "./src/app/site/site.list.html"),
            styles: [__webpack_require__(/*! ./site.css */ "./src/app/site/site.css")]
        }),
        __metadata("design:paramtypes", [_site_service__WEBPACK_IMPORTED_MODULE_1__["SiteService"]])
    ], SiteList);
    return SiteList;
}());



/***/ }),

/***/ "./src/app/site/site.service.ts":
/*!**************************************!*\
  !*** ./src/app/site/site.service.ts ***!
  \**************************************/
/*! exports provided: SiteService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SiteService", function() { return SiteService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var _basecrud_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../basecrud.service */ "./src/app/basecrud.service.ts");
/* harmony import */ var _site__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./site */ "./src/app/site/site.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var SiteService = /** @class */ (function (_super) {
    __extends(SiteService, _super);
    function SiteService(http) {
        var _this = _super.call(this, http) || this;
        _this.http = http;
        return _this;
    }
    /**
    * Get a list of sites. The following [optional] filters are available :
    *   typeCode : site type (see SITE_MAIN_TYPE category in thesaurus)
    *   statusCode : site status (see SITE_MAIN_STATUS category in thesaurus)
    *   search : search pattern to apply on site code and label
    *   startIndex : number of skipped hits in the list returned by the server
    *   length : number of kept hits in the list returned by the server
    * @param filters : search filters
    */
    SiteService.prototype.list = function (filters) {
        return _super.prototype.list.call(this, filters);
    };
    SiteService.prototype.createRecord = function () {
        return new _site__WEBPACK_IMPORTED_MODULE_3__["Site"]();
    };
    SiteService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])({
            providedIn: 'root'
        }),
        __metadata("design:paramtypes", [_angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"]])
    ], SiteService);
    return SiteService;
}(_basecrud_service__WEBPACK_IMPORTED_MODULE_2__["BaseCrudService"]));



/***/ }),

/***/ "./src/app/site/site.ts":
/*!******************************!*\
  !*** ./src/app/site/site.ts ***!
  \******************************/
/*! exports provided: Site */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Site", function() { return Site; });
/* harmony import */ var _baserecord__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../baserecord */ "./src/app/baserecord.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

/**
 * Description on the Site class : the fields listed below all result from siteService.get service.
 */
var Site = /** @class */ (function (_super) {
    __extends(Site, _super);
    function Site() {
        var _this = _super.call(this) || this;
        _this.AOIs = [];
        _this.POIs = [];
        return _this;
    }
    return Site;
}(_baserecord__WEBPACK_IMPORTED_MODULE_0__["BaseRecord"]));



/***/ }),

/***/ "./src/app/thesaurus/thesaurus.service.ts":
/*!************************************************!*\
  !*** ./src/app/thesaurus/thesaurus.service.ts ***!
  \************************************************/
/*! exports provided: ThesaurusService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ThesaurusService", function() { return ThesaurusService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var _basecrud_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../basecrud.service */ "./src/app/basecrud.service.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var ThesaurusService = /** @class */ (function (_super) {
    __extends(ThesaurusService, _super);
    function ThesaurusService(http) {
        var _this = _super.call(this, http) || this;
        _this.http = http;
        return _this;
    }
    /**
    * Get a list of thseaurus items. The following [optional] filters are available :
    *   cat : the concerned thesaurus category
    * @param filters : search filters
    */
    ThesaurusService.prototype.list = function (filters) {
        return _super.prototype.list.call(this, filters);
    };
    /**
    * Get a thesaurus item base on its id
    * @param thesaurusId : the thesaurus item id
    */
    ThesaurusService.prototype.get = function (thesaurusId) {
        return _super.prototype.get.call(this, thesaurusId);
    };
    ThesaurusService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])({
            providedIn: 'root'
        }),
        __metadata("design:paramtypes", [_angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"]])
    ], ThesaurusService);
    return ThesaurusService;
}(_basecrud_service__WEBPACK_IMPORTED_MODULE_2__["BaseCrudService"]));



/***/ }),

/***/ "./src/app/user/user.crud.html":
/*!*************************************!*\
  !*** ./src/app/user/user.crud.html ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"container-fluid\">\t\r\n\r\n <!-- Main formular -->\r\n  <form #userForm=\"ngForm\" novalidate=\"true\" autocomplete=\"off\">\r\n\r\n    <!-- NavBar -->\r\n    <crud-navbar  [editMode]=\"editMode\" \r\n                  [valid]=\"userForm.form.valid\"\r\n                  (editModeChange)=\"editModeChange($event)\"\r\n                  (saveEvent)=\"save()\" ></crud-navbar>\r\n\r\n    <!-- Login -->\r\n    <div class=\"form-group row\">\r\n      <label for=\"login\" class=\"col-md-2 control-label\" >Identifiant</label>\r\n      <div class=\"col-md-4\">\r\n        <input type=\"text\" class=\"form-control\" name=\"login\" placeholder=\"Identifiant...\"\r\n               [(ngModel)]=\"currentRecord.login\" pattern=\"[A-Za-z0-9_\\.-]{1,20}\" required=\"true\"\r\n               [readonly]=\"editMode!='edit'\" />\r\n      </div>\r\n    </div>\r\n\r\n    <!-- Passwd -->\r\n    <div class=\"form-group row\">\r\n      <label for=\"passwd\" class=\"col-lg-2 control-label\" >Mot de passe</label>\r\n      <div class=\"col-lg-4\">\r\n        <input type=\"password\" class=\"form-control\" name=\"passwd\" placeholder=\"Mot de passe...\"\r\n               [(ngModel)]=\"currentRecord.passwd\" required=\"true\"\r\n               [readonly]=\"editMode!='edit'\" />\r\n      </div>\r\n    </div>\r\n\r\n\r\n    <!-- Firstname -->\r\n    <div class=\"form-group row\">\r\n      <label for=\"firstname\" class=\"col-lg-2 control-label\">Prénom </label>\r\n      <div class=\"col-lg-10\">\r\n        <input type=\"text\" class=\"form-control\" name=\"firstname\" placeholder=\"Prénom...\"\r\n               [(ngModel)]=\"currentRecord.firstname\" required=\"true\"\r\n               [readonly]=\"editMode!='edit'\"/>\r\n      </div>\r\n    </div>\r\n\r\n    <!-- lastname -->\r\n    <div class=\"form-group row\">\r\n      <label for=\"lastname\" class=\"col-lg-2 control-label\">Nom </label>\r\n      <div class=\"col-lg-10\">\r\n        <input type=\"text\" class=\"form-control\" name=\"lastname\" placeholder=\"Nom...\"\r\n               [(ngModel)]=\"currentRecord.lastname\" required=\"true\"\r\n               [readonly]=\"editMode!='edit'\"/>\r\n      </div>\r\n    </div>\r\n\r\n    <!-- Status -->\r\n    <div class='form-group row'>\r\n      <label for=\"status\" class='col-lg-2 control-label'>Statut </label>\r\n      <div class='col-lg-4'>\r\n      \t<ng-select name=\"status\" [items]=\"th('USER_MAIN_STATUS') | async\" bindLabel=\"label\" bindValue=\"id\"\r\n              \t\t [(ngModel)]=\"currentRecord.status_th\"\r\n              \t\t [disabled]=\"editMode!='edit'\">\r\n\t\t\t\t</ng-select>\r\n      </div>\r\n    </div>\r\n\r\n  </form>\r\n</div>"

/***/ }),

/***/ "./src/app/user/user.crud.ts":
/*!***********************************!*\
  !*** ./src/app/user/user.crud.ts ***!
  \***********************************/
/*! exports provided: UserCrud */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UserCrud", function() { return UserCrud; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _basecrud__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../basecrud */ "./src/app/basecrud.ts");
/* harmony import */ var _user_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./user.service */ "./src/app/user/user.service.ts");
/* harmony import */ var _thesaurus_thesaurus_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../thesaurus/thesaurus.service */ "./src/app/thesaurus/thesaurus.service.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var UserCrud = /** @class */ (function (_super) {
    __extends(UserCrud, _super);
    function UserCrud(userService, thService, router, route) {
        var _this = _super.call(this, userService, thService, router) || this;
        _this.userService = userService;
        _this.thService = thService;
        _this.router = router;
        _this.route = route;
        return _this;
    }
    UserCrud.prototype.ngOnInit = function () {
        var _this = this;
        this.route.params.subscribe(function (routeParams) {
            _super.prototype.init.call(_this, routeParams.id);
        });
    };
    UserCrud = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            template: __webpack_require__(/*! ./user.crud.html */ "./src/app/user/user.crud.html"),
        }),
        __metadata("design:paramtypes", [_user_service__WEBPACK_IMPORTED_MODULE_3__["UserService"],
            _thesaurus_thesaurus_service__WEBPACK_IMPORTED_MODULE_4__["ThesaurusService"],
            _angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"],
            _angular_router__WEBPACK_IMPORTED_MODULE_1__["ActivatedRoute"]])
    ], UserCrud);
    return UserCrud;
}(_basecrud__WEBPACK_IMPORTED_MODULE_2__["BaseCrud"]));



/***/ }),

/***/ "./src/app/user/user.list.html":
/*!*************************************!*\
  !*** ./src/app/user/user.list.html ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"container-fluid\">\r\n  <alert-component></alert-component>\r\n  <fieldset acl-show=\"'/user/list'\">\r\n    <list-navbar [title]=\"'Utilisateurs'\"></list-navbar>\r\n    <div>\r\n      <table id=\"user-table\" class=\"table table-sm table-striped table-hover\">\r\n       <thead>\r\n        <tr>\r\n          <th>Login</th>\r\n          <th>Prénom</th>\r\n          <th>Nom</th>\r\n          <th>Statut</th>\r\n        </tr>\r\n       </thead>\r\n       <tbody>\r\n          <tr *ngFor=\"let user of users\">\r\n            <td><a [routerLink]=\"['/data/user/crud',user.id]\">{{user.login}}</a></td>\r\n            <td>{{user.firstname}}</td>\r\n            <td>{{user.lastname}}</td>\r\n            <td>{{user.status_th}}</td>\r\n         </tr>\r\n       </tbody>\r\n      </table>\r\n    </div>\r\n</fieldset>\r\n</div>"

/***/ }),

/***/ "./src/app/user/user.list.ts":
/*!***********************************!*\
  !*** ./src/app/user/user.list.ts ***!
  \***********************************/
/*! exports provided: UserList */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UserList", function() { return UserList; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _user_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./user.service */ "./src/app/user/user.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var UserList = /** @class */ (function () {
    function UserList(userService) {
        this.userService = userService;
    }
    UserList.prototype.ngOnInit = function () {
        var _this = this;
        this.userService.list({})
            .subscribe(function (users) { return _this.users = users; });
    };
    UserList = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            template: __webpack_require__(/*! ./user.list.html */ "./src/app/user/user.list.html"),
        }),
        __metadata("design:paramtypes", [_user_service__WEBPACK_IMPORTED_MODULE_1__["UserService"]])
    ], UserList);
    return UserList;
}());



/***/ }),

/***/ "./src/app/user/user.service.ts":
/*!**************************************!*\
  !*** ./src/app/user/user.service.ts ***!
  \**************************************/
/*! exports provided: UserService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UserService", function() { return UserService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var _basecrud_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../basecrud.service */ "./src/app/basecrud.service.ts");
/* harmony import */ var _user__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./user */ "./src/app/user/user.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var UserService = /** @class */ (function (_super) {
    __extends(UserService, _super);
    function UserService(http) {
        var _this = _super.call(this, http) || this;
        _this.http = http;
        return _this;
    }
    UserService.prototype.list = function (filters) {
        return _super.prototype.list.call(this, filters);
    };
    UserService.prototype.save = function (user) {
        return _super.prototype.save.call(this, user);
    };
    UserService.prototype.createRecord = function () {
        return new _user__WEBPACK_IMPORTED_MODULE_3__["User"]();
    };
    UserService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])({
            providedIn: 'root'
        }),
        __metadata("design:paramtypes", [_angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"]])
    ], UserService);
    return UserService;
}(_basecrud_service__WEBPACK_IMPORTED_MODULE_2__["BaseCrudService"]));



/***/ }),

/***/ "./src/app/user/user.ts":
/*!******************************!*\
  !*** ./src/app/user/user.ts ***!
  \******************************/
/*! exports provided: User */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "User", function() { return User; });
/* harmony import */ var _baserecord__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../baserecord */ "./src/app/baserecord.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var User = /** @class */ (function (_super) {
    __extends(User, _super);
    function User() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return User;
}(_baserecord__WEBPACK_IMPORTED_MODULE_0__["BaseRecord"]));



/***/ }),

/***/ "./src/app/vehicle/vehicle.crud.html":
/*!*******************************************!*\
  !*** ./src/app/vehicle/vehicle.crud.html ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"container-fluid\">\r\n\t<crud-navbar [editMode]=\"editMode\" (editModeChange)=\"editModeChange($event)\"></crud-navbar>\r\n\r\n <!-- Main formular -->\r\n  <form #vehicleForm=\"ngForm\" novalidate=\"true\" autocomplete=\"off\">\r\n\r\n    <!-- Code -->\r\n    <div class=\"form-group\">\r\n      <label for=\"vehicleCode\" class=\"col-lg-2 control-label\" >Référence</label>\r\n      <div class=\"col-lg-4\">\r\n        <input type=\"text\" class=\"form-control\" name=\"vehicleCode\" placeholder=\"Référence...\"\r\n               [(ngModel)]=\"currentRecord.code\" pattern=\"[A-Za-z0-9_\\.-]{1,20}\" required=\"true\"\r\n               [readonly]=\"editMode!='edit'\" />\r\n      </div>\r\n    </div>\r\n\r\n    <!-- Description of the vehicle -->\r\n    <div class=\"form-group\">\r\n      <label for=\"vehicleLabel\" class=\"col-lg-2 control-label\">Description </label>\r\n      <div class=\"col-lg-10\">\r\n        <input type=\"text\" class=\"form-control\" name=\"vehicleLabel\" placeholder=\"Description...\"\r\n               [(ngModel)]=\"currentRecord.label\" required=\"true\"\r\n               [readonly]=\"editMode!='edit'\"/>\r\n      </div>\r\n    </div>\r\n\r\n    <!-- Vehicle category -->\r\n    <div class='form-group'>\r\n      <label for=\"vehicleCategory\" class='col-lg-2 control-label'>Catégorie </label>\r\n      <div class='col-lg-4'>\r\n      \t<ng-select name=\"vehicleCategory\" [items]=\"vehicleCats\" bindLabel=\"label\" bindValue=\"id\"\r\n      \t\t[(ngModel)]=\"currentRecord.vehicle_cat_id\"\r\n      \t\t[disabled]=\"editMode!='edit'\">\r\n\t\t\t\t</ng-select>\r\n      </div>\r\n    </div>\r\n\r\n  </form>\r\n</div>"

/***/ }),

/***/ "./src/app/vehicle/vehicle.crud.ts":
/*!*****************************************!*\
  !*** ./src/app/vehicle/vehicle.crud.ts ***!
  \*****************************************/
/*! exports provided: VehicleCrud */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VehicleCrud", function() { return VehicleCrud; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _basecrud__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../basecrud */ "./src/app/basecrud.ts");
/* harmony import */ var _vehicle_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./vehicle.service */ "./src/app/vehicle/vehicle.service.ts");
/* harmony import */ var _thesaurus_thesaurus_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../thesaurus/thesaurus.service */ "./src/app/thesaurus/thesaurus.service.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var VehicleCrud = /** @class */ (function (_super) {
    __extends(VehicleCrud, _super);
    function VehicleCrud(route, router, vehicleService, thService) {
        var _this = 
        // Inject data service - it will be used by parent BaseCrud class
        // to run CRUD actions
        // It populates currentRecord member variable  		
        _super.call(this, vehicleService, thService, router) || this;
        _this.route = route;
        _this.router = router;
        _this.vehicleService = vehicleService;
        _this.thService = thService;
        return _this;
    }
    VehicleCrud.prototype.ngOnInit = function () {
        var _this = this;
        // Load Vehicle
        this.route.params.subscribe(function (routeParams) {
            _super.prototype.init.call(_this, routeParams.id);
        });
        // Load Vehicle Categories
        this.vehicleService.listCat().subscribe(function (vehicleCats) { return _this.vehicleCats = vehicleCats; });
    };
    VehicleCrud = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-vehicle-crud',
            template: __webpack_require__(/*! ./vehicle.crud.html */ "./src/app/vehicle/vehicle.crud.html"),
            styles: [__webpack_require__(/*! ./vehicle.css */ "./src/app/vehicle/vehicle.css")]
        }),
        __metadata("design:paramtypes", [_angular_router__WEBPACK_IMPORTED_MODULE_1__["ActivatedRoute"],
            _angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"],
            _vehicle_service__WEBPACK_IMPORTED_MODULE_3__["VehicleService"],
            _thesaurus_thesaurus_service__WEBPACK_IMPORTED_MODULE_4__["ThesaurusService"]])
    ], VehicleCrud);
    return VehicleCrud;
}(_basecrud__WEBPACK_IMPORTED_MODULE_2__["BaseCrud"]));



/***/ }),

/***/ "./src/app/vehicle/vehicle.css":
/*!*************************************!*\
  !*** ./src/app/vehicle/vehicle.css ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/vehicle/vehicle.list.html":
/*!*******************************************!*\
  !*** ./src/app/vehicle/vehicle.list.html ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div>\r\n  <fieldset>\r\n    <legend>\r\n    \tVéhicules\r\n    </legend>\r\n    <div>\r\n      <table id=\"vehicle-table\" class=\"table table-striped table-bordered table-hover tbl-list\">\r\n       <thead>\r\n        <tr>\r\n          <th>Référence</th>\r\n          <th>Libellé</th>\r\n          <th>Immatriculation</th>\r\n          <th>Chauffeur</th>\r\n          <th>Catégorie</th>\r\n          <th>Flotte</th>\r\n          <th>Beacon</th>\r\n          <th>Statut</th>\r\n        </tr>\r\n       </thead>\r\n       <tbody>\r\n          <tr *ngFor=\"let vehicle of vehicles\">\r\n            <td><a [routerLink]=\"['/data/vehicle/crud',vehicle.id]\">{{vehicle.code}}</a></td>\r\n            <td >{{vehicle.label}}</td>\r\n            <td>{{vehicle.licence_id}}</td>\r\n            <td><span ng-if=\"vehicle.DRIVER_ID!=null\">{{vehicle.driver_first_name}}. {{vehicle.driver_last_name}}</span></td>\r\n            <td>{{vehicle.vehicle_cat_label}}</td>\r\n            <td>{{vehicle.fleet_label}}</td>\r\n            <td>{{vehicle.beacon_major}}</td>\r\n            <td>{{vehicle.status_label}}</td>\r\n         </tr>\r\n       </tbody>\r\n      </table>\r\n    </div>\r\n</fieldset>\r\n</div>"

/***/ }),

/***/ "./src/app/vehicle/vehicle.list.ts":
/*!*****************************************!*\
  !*** ./src/app/vehicle/vehicle.list.ts ***!
  \*****************************************/
/*! exports provided: VehicleList */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VehicleList", function() { return VehicleList; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _vehicle_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./vehicle.service */ "./src/app/vehicle/vehicle.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var VehicleList = /** @class */ (function () {
    function VehicleList(vehicleService) {
        this.vehicleService = vehicleService;
    }
    VehicleList.prototype.ngOnInit = function () {
        var _this = this;
        this.vehicleService.list({ statusCode: null, search: null,
            startIndex: null, length: null,
            vehicleCatID: null })
            .subscribe(function (vehicles) { return _this.vehicles = vehicles; });
    };
    VehicleList = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-vehicle',
            template: __webpack_require__(/*! ./vehicle.list.html */ "./src/app/vehicle/vehicle.list.html"),
            styles: [__webpack_require__(/*! ./vehicle.css */ "./src/app/vehicle/vehicle.css")]
        }),
        __metadata("design:paramtypes", [_vehicle_service__WEBPACK_IMPORTED_MODULE_1__["VehicleService"]])
    ], VehicleList);
    return VehicleList;
}());



/***/ }),

/***/ "./src/app/vehicle/vehicle.mock.ts":
/*!*****************************************!*\
  !*** ./src/app/vehicle/vehicle.mock.ts ***!
  \*****************************************/
/*! exports provided: VEHICLES, VEHICLE_CATS */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VEHICLES", function() { return VEHICLES; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VEHICLE_CATS", function() { return VEHICLE_CATS; });
var VEHICLES = [
    { "id": "fd321182-ab6f-11e8-98d0-529269fb1459", "code": "PO04", "label": "Porteur", "licence_id": "BB 525 ED", "vehicle_cat_id": "b36269c6-acfa-11e8-98d0-529269fb1459", "empty_weight": null, "driver_id": "MA02", "gcwr": 26000, "beacon_major": 44, "site_id": "DCLAVERIE", "driver_last_name": "ASSAIN", "driver_first_name": "Marc", "status_label": "Disponible", "fleet_label": "Luc DURAND", "fleet_id": "LD", "vehicle_cat_label": "Porteur", "lng": 0.1057751, "lat": 47.93647, "dt": 1529665481, "heading": 113, "speed": 8, "rec_st": "C" },
    { "id": "fd321538-ab6f-11e8-98d0-529269fb1459", "code": "OTH_0001", "label": "Camionette", "licence_id": "215 VW 44", "vehicle_cat_id": null, "empty_weight": null, "driver_id": null, "gcwr": null, "beacon_major": null, "site_id": null, "driver_last_name": null, "driver_first_name": null, "status_label": "Disponible", "fleet_label": "Autre", "fleet_id": "OTH", "vehicle_cat_label": null, "lng": null, "lat": null, "dt": null, "heading": null, "speed": null, "rec_st": "C" },
    { "id": "fd32177c-ab6f-11e8-98d0-529269fb1459", "code": "SR01", "label": "Semi-Remorque", "licence_id": "ZS 455 VC", "vehicle_cat_id": "b36265e8-acfa-11e8-98d0-529269fb1459", "empty_weight": null, "driver_id": "MA02", "gcwr": 44000, "beacon_major": 11, "site_id": "DPRUILLE", "driver_last_name": "ASSAIN", "driver_first_name": "Marc", "status_label": "Disponible", "fleet_label": "Luc DURAND", "fleet_id": "LD", "vehicle_cat_label": "Ensemble Semi-Remorque", "lng": null, "lat": null, "dt": null, "heading": null, "speed": null, "rec_st": "C" },
    { "id": "fd3219c0-ab6f-11e8-98d0-529269fb1459", "code": "SR02", "label": "Semi Remorque", "licence_id": "GB 456 ZQ", "vehicle_cat_id": "b36265e8-acfa-11e8-98d0-529269fb1459", "empty_weight": null, "driver_id": "DE06", "gcwr": 44000, "beacon_major": 12, "site_id": "DPRUILLE", "driver_last_name": "DEVERT", "driver_first_name": "H\u00e9l\u00e8ne", "status_label": "Disponible", "fleet_label": "Luc DURAND", "fleet_id": "LD", "vehicle_cat_label": "Ensemble Semi-Remorque", "lng": null, "lat": null, "dt": null, "heading": null, "speed": null, "rec_st": "C" },
    { "id": "fd321eac-ab6f-11e8-98d0-529269fb1459", "code": "PO02", "label": "Porteur", "licence_id": "ED 344 FC", "vehicle_cat_id": "b36269c6-acfa-11e8-98d0-529269fb1459", "empty_weight": null, "driver_id": "DE09", "gcwr": 32000, "beacon_major": 42, "site_id": "DCLAVERIE", "driver_last_name": "DELAGE", "driver_first_name": "Pierre", "status_label": "Disponible", "fleet_label": "Luc DURAND", "fleet_id": "LD", "vehicle_cat_label": "Porteur", "lng": null, "lat": null, "dt": null, "heading": null, "speed": null, "rec_st": "C" },
    { "id": "fd3220f0-ab6f-11e8-98d0-529269fb1459", "code": "PO01", "label": "Porteur", "licence_id": "RF 432 FC", "vehicle_cat_id": "b36269c6-acfa-11e8-98d0-529269fb1459", "empty_weight": null, "driver_id": "GL04", "gcwr": 32000, "beacon_major": 41, "site_id": "DCLAVERIE", "driver_last_name": "LAMBERT", "driver_first_name": "G\u00e9rard", "status_label": "Disponible", "fleet_label": "Luc DURAND", "fleet_id": "LD", "vehicle_cat_label": "Porteur", "lng": null, "lat": null, "dt": null, "heading": null, "speed": null, "rec_st": "C" },
    { "id": "fd322334-ab6f-11e8-98d0-529269fb1459", "code": "SR05", "label": "Semi-Remorque", "licence_id": "AQ 713 GB", "vehicle_cat_id": "b36265e8-acfa-11e8-98d0-529269fb1459", "empty_weight": null, "driver_id": "HU10", "gcwr": 40000, "beacon_major": 15, "site_id": "DPRUILLE", "driver_last_name": "HULIN", "driver_first_name": "Olivier", "status_label": "Disponible", "fleet_label": "Luc DURAND", "fleet_id": "LD", "vehicle_cat_label": "Ensemble Semi-Remorque", "lng": null, "lat": null, "dt": null, "heading": null, "speed": null, "rec_st": "C" },
    { "id": "fd322550-ab6f-11e8-98d0-529269fb1459", "code": "SR03", "label": "Semi-Remorque", "licence_id": "BF 932 DC", "vehicle_cat_id": "b36265e8-acfa-11e8-98d0-529269fb1459", "empty_weight": null, "driver_id": "GU08", "gcwr": 44000, "beacon_major": 13, "site_id": "DPRUILLE", "driver_last_name": "GUOUE", "driver_first_name": "Sylvie", "status_label": "Disponible", "fleet_label": "Luc DURAND", "fleet_id": "LD", "vehicle_cat_label": "Ensemble Semi-Remorque", "lng": null, "lat": null, "dt": null, "heading": null, "speed": null, "rec_st": "C" },
    { "id": "fd322776-ab6f-11e8-98d0-529269fb1459", "code": "PO05", "label": "Porteur", "licence_id": "VZ 941 KB", "vehicle_cat_id": "b36269c6-acfa-11e8-98d0-529269fb1459", "empty_weight": null, "driver_id": "DU05", "gcwr": 26000, "beacon_major": 45, "site_id": "DCLAVERIE", "driver_last_name": "DUPONT", "driver_first_name": "Alain", "status_label": "Disponible", "fleet_label": "Luc DURAND", "fleet_id": "LD", "vehicle_cat_label": "Porteur", "lng": null, "lat": null, "dt": null, "heading": null, "speed": null, "rec_st": "C" },
    { "id": "fd322c12-ab6f-11e8-98d0-529269fb1459", "code": "PO03", "label": "Porteur", "licence_id": "PV 541 ZW", "vehicle_cat_id": "b36269c6-acfa-11e8-98d0-529269fb1459", "empty_weight": null, "driver_id": "PM03", "gcwr": 32000, "beacon_major": 43, "site_id": "DCLAVERIE", "driver_last_name": "MARTIN", "driver_first_name": "Paul", "status_label": "Disponible", "fleet_label": "Luc DURAND", "fleet_id": "LD", "vehicle_cat_label": "Porteur", "lng": null, "lat": null, "dt": null, "heading": null, "speed": null, "rec_st": "C" },
    { "id": "fd322c1b-ab6f-11e8-98d0-529269fb1459", "code": "SR04", "label": "Semi Remorque", "licence_id": "AS 128 RD", "vehicle_cat_id": "b36265e8-acfa-11e8-98d0-529269fb1459", "empty_weight": null, "driver_id": "FR07", "gcwr": 40000, "beacon_major": 14, "site_id": "DPRUILLE", "driver_last_name": "FROLE", "driver_first_name": "Isabelle", "status_label": "Disponible", "fleet_label": "Luc DURAND", "fleet_id": "LD", "vehicle_cat_label": "Ensemble Semi-Remorque", "lng": null, "lat": null, "dt": null, "heading": null, "speed": null, "rec_st": "C" }
];
var VEHICLE_CATS = [
    { "id": "b36269c6-acfa-11e8-98d0-529269fb1459", "code": "PORTEUR", "label": "Porteur", "rec_st": "C" },
    { "id": "b36265e8-acfa-11e8-98d0-529269fb1459", "code": "SEMI", "label": "Ensemble Semi-Remorque", "rec_st": "C" }
];


/***/ }),

/***/ "./src/app/vehicle/vehicle.service.ts":
/*!********************************************!*\
  !*** ./src/app/vehicle/vehicle.service.ts ***!
  \********************************************/
/*! exports provided: VehicleService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VehicleService", function() { return VehicleService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/_esm5/index.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var _basecrud_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../basecrud.service */ "./src/app/basecrud.service.ts");
/* harmony import */ var _vehicle__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./vehicle */ "./src/app/vehicle/vehicle.ts");
/* harmony import */ var _vehicle_mock__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./vehicle.mock */ "./src/app/vehicle/vehicle.mock.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






var VehicleService = /** @class */ (function (_super) {
    __extends(VehicleService, _super);
    function VehicleService(http) {
        var _this = _super.call(this, http) || this;
        _this.http = http;
        return _this;
    }
    /**
    * Get a list of vehicles. The following [optional] filters are available :
    *   statusCode : vehicle availability ('ND' or 'A' or 'all')
    *   search : free pattern to search in vehicle codes, labels and licence ids
    *   startIndex : skip some hits in the list returned by the server (0 = no skip)
    *   length : number of kept hits in the list returned by the server ('all' = keep all)
    *   vehicleCatID : restriction by vehicle category id
    * @param filters : search filters
    */
    VehicleService.prototype.list = function (filters) {
        //return super.list(filters) as Observable<Vehicle[]>;
        return Object(rxjs__WEBPACK_IMPORTED_MODULE_1__["of"])(_vehicle_mock__WEBPACK_IMPORTED_MODULE_5__["VEHICLES"]);
    };
    /**
    * Get a vehicle base on its id
    * @param vehicleId : the vehicle id
    */
    VehicleService.prototype.get = function (vehicleId) {
        //return super.get(vehicleId) as Observable<Vehicle>;
        return Object(rxjs__WEBPACK_IMPORTED_MODULE_1__["of"])(_vehicle_mock__WEBPACK_IMPORTED_MODULE_5__["VEHICLES"][3]);
    };
    VehicleService.prototype.listCat = function () {
        return Object(rxjs__WEBPACK_IMPORTED_MODULE_1__["of"])(_vehicle_mock__WEBPACK_IMPORTED_MODULE_5__["VEHICLE_CATS"]);
        //return $http.get("rest/vehicle/cat/"+bOnlyForOptim);
    };
    VehicleService.prototype.createRecord = function () {
        return new _vehicle__WEBPACK_IMPORTED_MODULE_4__["Vehicle"]();
    };
    VehicleService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])({
            providedIn: 'root'
        }),
        __metadata("design:paramtypes", [_angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"]])
    ], VehicleService);
    return VehicleService;
}(_basecrud_service__WEBPACK_IMPORTED_MODULE_3__["BaseCrudService"]));



/***/ }),

/***/ "./src/app/vehicle/vehicle.ts":
/*!************************************!*\
  !*** ./src/app/vehicle/vehicle.ts ***!
  \************************************/
/*! exports provided: Vehicle, VehicleCat */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Vehicle", function() { return Vehicle; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VehicleCat", function() { return VehicleCat; });
/* harmony import */ var _baserecord__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../baserecord */ "./src/app/baserecord.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

/**
 * Description on the Vehicle class : the fields listed below all result from vehicleService.get service.
 */
var Vehicle = /** @class */ (function (_super) {
    __extends(Vehicle, _super);
    function Vehicle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Vehicle;
}(_baserecord__WEBPACK_IMPORTED_MODULE_0__["BaseRecord"]));

/**
 * Description on the VehicleCat class.
 */
var VehicleCat = /** @class */ (function (_super) {
    __extends(VehicleCat, _super);
    function VehicleCat() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VehicleCat;
}(_baserecord__WEBPACK_IMPORTED_MODULE_0__["BaseRecord"]));



/***/ }),

/***/ "./src/environments/environment.ts":
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/*! exports provided: environment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "environment", function() { return environment; });
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
var environment = {
    production: false
};
/*
 * In development mode, for easier debugging, you can ignore zone related error
 * stack frames such as `zone.run`/`zoneDelegate.invokeTask` by importing the
 * below file. Don't forget to comment it out in production mode
 * because it will have a performance impact when errors are thrown
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/platform-browser-dynamic */ "./node_modules/@angular/platform-browser-dynamic/fesm5/platform-browser-dynamic.js");
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app/app.module */ "./src/app/app.module.ts");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./environments/environment */ "./src/environments/environment.ts");




if (_environments_environment__WEBPACK_IMPORTED_MODULE_3__["environment"].production) {
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["enableProdMode"])();
}
Object(_angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_1__["platformBrowserDynamic"])().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_2__["AppModule"], { preserveWhitespaces: true })
    .catch(function (err) { return console.log(err); });


/***/ }),

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! C:\Users\w.lambert.DURAND\Documents\GitHub\nomad\src\webapp\src\main.ts */"./src/main.ts");


/***/ })

},[[0,"runtime","vendor"]]]);
//# sourceMappingURL=main.js.map