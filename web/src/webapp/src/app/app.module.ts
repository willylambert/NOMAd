/*
 * Copyright (c) 2020 INSA Lyon (DISP LAB EA 4570), IMT Atlantique (LS2N LAB UMR CNRS), Ressourcial, SYNERGIHP and ODO Smart Systems
 *
 * This program has been developed in the context of the NOMAd project and is GPL v3 Licensed.
 * We would like to thank the European Union through the European regional development fund (ERDF) and the French region Auvergne-Rhône-Alpes for their financial support.
 * The following entities have been involved in the NOMAd project: INSA Lyon (DISP LAB EA 4570), IMT Atlantique (LS2N LAB UMR CNRS), Ressourcial, SYNERGIHP and Odo Smart System.
 *
 * This file is part of NOMAd.
 *
 * NOMAd is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * NOMAd is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with NOMAd.  If not, see <https://www.gnu.org/licenses/>.
 */

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule }   from '@angular/forms';
import { ReactiveFormsModule }    from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AgGridModule } from 'ag-grid-angular';

import { NgJsonEditorModule } from 'ang-jsoneditor';

import { ErrorInterceptor } from './helpers/error.interceptor';
import { SessionInterceptor } from './helpers/session.interceptor';
import { CacheInterceptor } from './helpers/cache-interceptor';

import { FillHeight } from './helpers/fill-height';
import { RouteToolbarPosition } from './route-toolbar/route-toolbar';
import { OrderByPipe } from './helpers/order-by.pipe';
import { DurationPipe } from './helpers/duration.pipe';
import { DurationPrecisePipe } from './helpers/duration-precise.pipe';
import { CostPipe } from './helpers/cost.pipe';
import { TimePipe } from './helpers/time.pipe';
import { SearchPipe } from './helpers/search.pipe';
import { UTCTimePipe } from './helpers/utc-time.pipe';
import { DistancePrecisePipe } from './helpers/distance-precise.pipe';
import { CountPipe } from './helpers/count.pipe';
import { SumPipe } from './helpers/sum.pipe';
import { DatePipe, SmallDatePipe } from './helpers/date.pipe';
import { TimeSlotsPipe } from './helpers/timeslots.pipe';

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { AlertComponent } from './alert/alert.component';
import { Login } from './login/login';
import { LoginUpdatePassword } from './login/login.update-password';

import { CrudNavbar } from './crud-navbar/crud-navbar';
import { CrudNavbarModalConfirm } from './crud-navbar/crud-navbar-modal.confirm';
import { CrudNavbarModalConfirmDelete } from './crud-navbar/crud-navbar-modal.confirm-delete';
import { ListNavbar } from './list-navbar/list-navbar';

import { InstitutionList } from './institution/institution.list';
import { InstitutionCrud } from './institution/institution.crud';
import { InstitutionHoursModal } from './institution/institution.hours-modal';
import { TransporterList } from './transporter/transporter.list';
import { TransporterCrud } from './transporter/transporter.crud';
import { SiteList } from './site/site.list';
import { SiteCrud } from './site/site.crud';
import { POIModal } from './poi/poi-modal';
import { RouteModalEdit } from './route/route-modal.edit';
import { RouteModalSave } from './route/route-modal.save';
import { RouteModalServiceDuration } from './route/route-modal.service-duration';
import { RouteModalTargetDt } from './route/route-modal.target-dt';


import { HRList,HrListClickableComponent,InstitutionsComponent,HomesComponent } from './hr/hr.list';
import { HRCrud } from './hr/hr.crud';
import { HRInstitutionsModal } from './hr/hr.institutions-modal';
import { HRPOIModal } from './hr/hr.poi-modal';

import { HRDriverList,HrDriverListClickableComponent,TransportersComponent} from './hr-driver/hr-driver.list';
import { HRDriverCrud } from './hr-driver/hr-driver.crud';
import { HRDriverSelectModal } from './hr-driver/hr-driver.select-modal';
import { HRTransportersModal } from './hr-driver/hr-driver.transporters-modal';
import { HRRoute } from './hr/hr-route';

import { OptimList,OptimListClickableComponent } from './optim/optim.list';
import { OptimCrud } from './optim/optim.crud';
import { OptimModalError } from './optim/optim-modal.error';
import { OptimModalLaunch } from './optim/optim-modal.launch';
import { OptimModalRestore } from './optim/optim-modal.restore';
import { OptimPlayer } from './optim/optim.player';
import { OptimListNavbar } from './optim/optim.list-navbar';


import { DemandList } from './demand/demand.list';
import { DemandCrud } from './demand/demand.crud';
import { DemandCrudModalPOI } from './demand/demand.crud-modal.poi';
import { GroupList } from './group/group.list';
import { GroupCrud } from './group/group.crud';

import { VehicleCategoryList } from './vehicle-category/vehicle-category.list';
import { VehicleCategoryCrud } from './vehicle-category/vehicle-category.crud';
import { VehicleConfigurationModal } from './vehicle-configuration/vehicle-configuration.crud-modal';
import { VehicleConfigurationsComponent } from './scenario/scenario-modal.fleet'

import { UserList } from './user/user.list';
import { UserCrud } from './user/user.crud';
import { UserRoleModalCrud } from './user/user-role-modal.crud';
import { UserSiteModalCrud } from './user/user-site-modal.crud';
import { UserHRModalCrud } from './user/user-hr-modal.crud';
import { Import } from './import/import';

import { RouteCrudSandbox } from './route/route.crud-sandbox';
import { RouteCrud } from './route/route.crud';
import { RouteMap } from './route/route.map';
import { RouteList } from './route/route.list';
import { RouteToolbar } from './route-toolbar/route-toolbar';

import { RouteRun } from './route-run/route-run';
import  {RouteRunList } from './route-run/route-run.list';

import { AuthenticationService } from './login/authentication.service';
import { AlertService } from './alert/alert.service';

import { ACL, ClickableComponent } from './acl/acl';
import { AclShowDirective } from './acl/acl-show';
import { ACLRoleModalCrud } from './acl/acl-role-modal.crud';
import { ACLUserModalCrud } from './acl/acl-user-modal.crud';

import { ScenarioModalCalendar } from './scenario/scenario-modal.calendar';
import { ScenarioModalChecker } from './scenario/scenario-modal.checker';
import { ScenarioModalCrud } from './scenario/scenario-modal.crud';
import { ScenarioModalGroup } from './scenario/scenario-modal.group';
import { ScenarioModalFleet } from './scenario/scenario-modal.fleet';
import { ScenarioQuickList } from './scenario/scenario.quick-list';
import { ScenarioList } from './scenario/scenario.list';
import { ScenarioCrud } from './scenario/scenario.crud';
import { ScenarioOverview } from './scenario/scenario.overview';
import { ScenarioMinimap } from './scenario/scenario.minimap';
import { ScenarioCalendar } from './scenario/scenario.calendar';

import { MapLeaflet } from './map-leaflet/map-leaflet';
import { MapGL } from './map-gl/map-gl';

import { GridDateComponent } from './helpers/grid-date-component';
import { ngfModule} from "angular-file"
import { DataCheckerList, DataCheckerListClickableComponent } from './datachecker/datachecker.list';
import { DataCheckerCrud } from './datachecker/datachecker.crud';
import { DataCheckerDetailModalList } from './datachecker/datachecker-detail-modal.list';

import { DashboardScenario } from './dashboard/dashboard.scenario';
import { DashboardScenarios } from './dashboard/dashboard.scenarios';
import { DashboardRouteList } from './dashboard/dashboard.route-list';


const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'login/update-password', component: LoginUpdatePassword },
  { path: 'logistics/demand/list', component: DemandList },
  { path: 'logistics/demand/crud/:id', component: DemandCrud },
  { path: 'logistics/demand/crud', component: DemandCrud },
  { path: 'logistics/group/list', component: GroupList },
  { path: 'logistics/group/crud/:id', component: GroupCrud },
  { path: 'logistics/group/crud', component: GroupCrud },
  { path: 'data/institution/list', component: InstitutionList },
  { path: 'data/institution/crud/:id', component: InstitutionCrud },
  { path: 'data/institution/crud', component: InstitutionCrud },
  { path: 'data/transporter/list', component: TransporterList },
  { path: 'data/transporter/crud/:id', component: TransporterCrud },
  { path: 'data/transporter/crud', component: TransporterCrud },
  { path: 'data/site/list', component: SiteList },
  { path: 'data/site/crud/:id', component: SiteCrud },
  { path: 'data/site/crud', component: SiteCrud },
  { path: 'data/vehicle-category/list', component: VehicleCategoryList },
  { path: 'data/vehicle-category/crud/:id', component: VehicleCategoryCrud },
  { path: 'data/vehicle-category/crud', component: VehicleCategoryCrud },
  { path: 'data/import', component: Import },
  { path: 'data/hr/list', component: HRList },
  { path: 'data/hr/crud/:id', component: HRCrud },
  { path: 'data/hr/crud', component: HRCrud },
  { path: 'data/hr-driver/list', component: HRDriverList },
  { path: 'data/hr-driver/crud/:id', component: HRDriverCrud },  
  { path: 'data/hr-driver/crud', component: HRDriverCrud },  
  { path: 'data/user/list', component: UserList },
  { path: 'data/user/crud/:id', component: UserCrud },
  { path: 'data/user/crud', component: UserCrud },
  { path: 'data/checker/list', component: DataCheckerList },
  { path: 'data/checker/crud/:id', component: DataCheckerCrud },
  { path: 'data/checker/crud', component: DataCheckerCrud },
  { path: 'logistics/route/crud-sandbox', component: RouteCrudSandbox },
  { path: 'logistics/route/crud/:scenarioMainId/:calendarDt/:timeSlotId', component: RouteCrud },
  { path: 'logistics/scenario/list', component: ScenarioList },
  { path: 'logistics/scenario/crud/:id', component: ScenarioCrud },
  { path: 'logistics/scenario/crud', component: ScenarioCrud },
  { path: 'data/acl', component: ACL },
  { path: 'optim/list', component: OptimList },
  { path: 'optim/crud', component: OptimCrud },
  { path: 'optim/crud/:id', component: OptimCrud },
  { path: 'dashboard/scenarios', component: DashboardScenarios },
  { path: '', component: HomeComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    AlertComponent,
    Login,
    LoginUpdatePassword,
    CrudNavbar,
    CrudNavbarModalConfirm,
    CrudNavbarModalConfirmDelete,
    ListNavbar,
    MapGL,
    MapLeaflet,
    HRList,
    HrListClickableComponent,
    HRDriverList,
    HrDriverListClickableComponent,
    HRDriverCrud,
    HRDriverSelectModal,
    HRRoute,
    TransportersComponent,
    VehicleConfigurationsComponent,
    InstitutionsComponent,
    HomesComponent,
    HRCrud,
    InstitutionList,
    InstitutionCrud,
    InstitutionHoursModal,
    TransporterList,
    TransporterCrud,
    HRTransportersModal,
    Import,
    SiteList,
    SiteCrud,
    POIModal,
    RouteModalEdit,
    RouteModalSave,
    RouteModalServiceDuration,
    RouteModalTargetDt,
    HRInstitutionsModal,
    HRPOIModal,
    UserList,
    UserCrud,
    UserRoleModalCrud,
    UserSiteModalCrud,
    UserHRModalCrud,
    RouteCrudSandbox,
    RouteCrud,
    RouteMap,
    RouteList,
    RouteRun,
    RouteRunList,
    RouteToolbar,
    VehicleCategoryList,
    VehicleCategoryCrud,
    VehicleConfigurationModal,
    DemandList,
    DemandCrud,
    DemandCrudModalPOI,
    DataCheckerList,
    DataCheckerListClickableComponent,
    DataCheckerCrud,
    DataCheckerDetailModalList,
    GroupList,
    GroupCrud,
    ACL,
    ClickableComponent,
    ACLRoleModalCrud,
    ACLUserModalCrud,
    OptimList,
    OptimListClickableComponent,
    OptimCrud,
    OptimModalError,
    OptimModalLaunch,
    OptimModalRestore,
    OptimPlayer,
    OptimListNavbar,
    ScenarioModalCalendar,
    ScenarioModalChecker,
    ScenarioModalCrud,
    ScenarioModalGroup,
    ScenarioModalFleet,
    ScenarioQuickList,
    ScenarioList,
    ScenarioCrud,
    ScenarioOverview,
    ScenarioMinimap,
    ScenarioCalendar,
    DashboardScenario,
    DashboardScenarios,
    DashboardRouteList,
    AclShowDirective,
    FillHeight,
    RouteToolbarPosition,
    GridDateComponent,
    OrderByPipe,
    DurationPipe,
    DurationPrecisePipe,
    CostPipe,
    TimePipe,
    SearchPipe,
    UTCTimePipe,
    DistancePrecisePipe,
    CountPipe,
    SumPipe,
    DatePipe,
    SmallDatePipe,
    TimeSlotsPipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgSelectModule,
    FormsModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    NgbModule,
    AgGridModule.withComponents([]),
    DragDropModule,
    NgJsonEditorModule,
    ngfModule
  ],
  providers: [
    AuthenticationService,
    AlertService,
    { provide: HTTP_INTERCEPTORS, useClass: SessionInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true }
    ],
  bootstrap: [AppComponent],
  entryComponents: [
    POIModal,
    RouteModalEdit,
    RouteModalSave,
    RouteModalServiceDuration,
    RouteModalTargetDt,
    DemandCrudModalPOI,
    DataCheckerDetailModalList,
    HRInstitutionsModal,
    HRTransportersModal,
    HRPOIModal,
    HRDriverSelectModal,
    InstitutionHoursModal,
    ACLRoleModalCrud,
    ACLUserModalCrud,
    UserRoleModalCrud,
    UserSiteModalCrud,
    UserHRModalCrud,
    OptimModalError,
    OptimModalLaunch,
    OptimModalRestore,
    ClickableComponent,
    CrudNavbarModalConfirm,
    CrudNavbarModalConfirmDelete,
    VehicleConfigurationModal,
    ScenarioModalCalendar,
    ScenarioModalChecker,
    ScenarioModalCrud,
    ScenarioModalGroup,
    ScenarioModalFleet,
    HrListClickableComponent,
    HrDriverListClickableComponent,
    OptimListClickableComponent,
    VehicleConfigurationsComponent,
    InstitutionsComponent,
    TransportersComponent,
    HomesComponent,
    GridDateComponent,
    DataCheckerListClickableComponent
  ]
})
export class AppModule { }
