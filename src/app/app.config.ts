import { ApplicationConfig } from "@angular/core"
import { provideRouter } from "@angular/router"
import { routes } from "./app.routes"
import { provideClientHydration } from "@angular/platform-browser"
import { PLATFORM_ID } from "@angular/core"

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideClientHydration(), { provide: PLATFORM_ID, useValue: "browser" }],
}
