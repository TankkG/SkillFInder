import type { Routes } from "@angular/router"
import { HomeComponent } from "./components/home/home.component"
import { LoginComponent } from "./components/login/login.component"
import { RegisterComponent } from "./components/register/register.component"
import { SelectRoleComponent } from "./components/select-role/select-role.component"
import { ClientDashboardComponent } from "./components/client-dashboard/client-dashboard.component"
import { ProfessionalDashboardComponent } from "./components/professional-dashboard/professional-dashboard.component"
import { ProfessionalProfileComponent } from "./components/professional-profile/professional-profile.component"
import { ReservationComponent } from "./components/reservation/reservation.component"
import { RateComponent } from "./components/rate/rate.component"
import { QrScannerComponent } from "./components/qr-scanner/qr-scanner.component"
import { HistoryComponent } from "./components/history/history.component"
import { MapaComponent } from "./components/mapa/mapa.component"
import { NotFoundComponent } from "./components/not-found/not-found.component"
import { ClientsListComponent } from "./components/clients-list/clients-list.component"
import { ClientProfileComponent } from "./components/clients-profile/clients-profile.component"
import { RateClientComponent } from "./components/rate-client/rate-client.component"
import { AdminDashboardComponent } from "./components/admin-dashboard/admin-dashboard.component"

export const routes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full" },
  { path: "home", component: HomeComponent },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "select-role", component: SelectRoleComponent },
  { path: "client-dashboard", component: ClientDashboardComponent },
  { path: "professional-dashboard", component: ProfessionalDashboardComponent },
  { path: "professional-profile/:id", component: ProfessionalProfileComponent },

  // NUEVA RUTA: permitir /reservation/:id
  { path: "reservation/:id", component: ReservationComponent },

  // Mantener también la ruta sin parámetro para compatibilidad con query params
  { path: "reservation", component: ReservationComponent },

  { path: "rate", component: RateComponent },
  { path: "qr-scanner", component: QrScannerComponent },
  { path: "history", component: HistoryComponent },
  { path: "mapa", component: MapaComponent },
  { path: "clients-list", component: ClientsListComponent },
  { path: "client-profile/:id", component: ClientProfileComponent },
  { path: "rate-client/:id", component: RateClientComponent },
  { path: "admin-dashboard", component: AdminDashboardComponent },
  { path: "**", component: NotFoundComponent },
];
