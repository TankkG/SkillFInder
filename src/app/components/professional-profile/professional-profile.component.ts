import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { ActivatedRoute, Router, ParamMap, NavigationEnd } from "@angular/router";
import { CommonModule } from "@angular/common";
import { Subscription, filter } from "rxjs";
import { ProfessionalService, Professional } from "../../services/professional.service";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-professional-profile",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./professional-profile.component.html",
  styleUrls: ["./professional-profile.component.css"],
})
export class ProfessionalProfileComponent implements OnInit, OnDestroy {
  professional: Professional | null = null;
  professionalId: string | null = null;
  user: any = null;

  private routeSub: Subscription | null = null;
  private qParamSub: Subscription | null = null;
  private profsSub: Subscription | null = null;
  private routerEventsSub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private professionalService: ProfessionalService,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();

    this.routeSub = this.route.paramMap.subscribe((params: ParamMap) => {
      const idFromParam = params.get("id");
      if (idFromParam) { this.professionalId = idFromParam; this.loadProfessionalById(this.professionalId); }
    });

    this.qParamSub = this.route.queryParamMap.subscribe((q) => {
      const qId = q.get("professionalId");
      if (qId) { this.professionalId = qId; this.loadProfessionalById(this.professionalId); }
    });

    try {
      if ((this.professionalService as any).professionals?.subscribe) {
        this.profsSub = (this.professionalService as any).professionals.subscribe((list: Professional[]) => {
          if (this.professionalId) {
            const f = list.find((x:any)=> String(x.id)===this.professionalId || String(x._id ?? "")===this.professionalId);
            if (f) this.setProfessionalNormalized(f);
          }
        });
      }
    } catch(e){}

    this.routerEventsSub = this.router.events.pipe(filter((ev): ev is NavigationEnd => ev instanceof NavigationEnd)).subscribe(()=>{
      const idFromUrl = this.route.snapshot.paramMap.get("id") || this.route.snapshot.queryParamMap.get("professionalId");
      if (idFromUrl && idFromUrl !== this.professionalId) { this.professionalId = idFromUrl; this.loadProfessionalById(this.professionalId); }
    });

    try { if (typeof (this.professionalService as any).refreshProfessionals === "function") (this.professionalService as any).refreshProfessionals().catch(()=>{}); } catch {}
  }

  ngOnDestroy(): void {
    if (this.routeSub) { this.routeSub.unsubscribe(); this.routeSub = null; }
    if (this.qParamSub) { this.qParamSub.unsubscribe(); this.qParamSub = null; }
    if (this.profsSub) { this.profsSub.unsubscribe(); this.profsSub = null; }
    if (this.routerEventsSub) { this.routerEventsSub.unsubscribe(); this.routerEventsSub = null; }
  }

  private loadProfessionalById(id: string | null) {
    if (!id) { this.professional = null; return; }
    try {
      const byId = (this.professionalService as any).getProfessionalById?.(id);
      if (byId) { this.setProfessionalNormalized(byId); return; }
    } catch {}
    try {
      const maybe = (this.professionalService as any).getProfessionals?.() || (this.professionalService as any).professionals?.value || [];
      const found = maybe.find((x:any)=> String(x.id)===id || String(x._id ?? "")===id);
      if (found) { this.setProfessionalNormalized(found); return; }
    } catch {}
    try {
      const raw = localStorage.getItem("users");
      if (raw) {
        const users = JSON.parse(raw);
        const f = users.find((u:any)=> String(u.id)===id || String(u._id ?? "")===id);
        if (f) { this.setProfessionalNormalized(this.mapUserToProfessional(f)); return; }
      }
    } catch {}
    this.professional = null;
    this.cd.detectChanges();
  }

  private setProfessionalNormalized(raw: any) {
    const normalized: any = this.mapUserToProfessional(raw);
    normalized.displayName = raw?.name ?? raw?.fullName ?? raw?.nombre ?? normalized.name ?? "Sin nombre";
    normalized.displayRole = raw?.role ?? raw?.job ?? raw?.especialidad ?? normalized.role ?? "Sin especialidad";
    this.professional = normalized as Professional;
    try {
      const idToStore = this.professional.id ?? (this.professional as any)._id ?? null;
      if (idToStore) localStorage.setItem("currentProfessionalId", String(idToStore));
    } catch {}
    try { this.cd.detectChanges(); } catch {}
  }

  private mapUserToProfessional(raw:any): Professional {
    const locRaw = raw?.location ?? raw?.coord ?? null;
    let loc = null;
    if (locRaw) {
      const lat = locRaw.lat ?? locRaw.latitude ?? locRaw.latitud ?? locRaw[0] ?? null;
      const lng = locRaw.lng ?? locRaw.lon ?? locRaw.longitude ?? locRaw.long ?? locRaw[1] ?? null;
      if (lat != null && lng != null) loc = { lat: Number(lat), lng: Number(lng) };
    }
    return {
      id: raw?.id ?? raw?._id ?? raw?.professionalId ?? String(Math.random()).slice(2,8),
      _id: raw?._id ?? undefined,
      name: raw?.name ?? raw?.fullName ?? raw?.nombre ?? "",
      role: (raw?.role ?? raw?.job ?? raw?.especialidad ?? "").toString().toLowerCase(),
      rating: raw?.rating ?? 0,
      location: loc,
      services: raw?.services ?? [],
      description: raw?.description ?? raw?.bio ?? "",
      phone: raw?.phone ?? raw?.telefono ?? "",
      email: raw?.email ?? ""
    } as Professional;
  }

  goToReservationQuery(professional:any) {
    const id = professional?.id ?? professional?._id ?? professional?.professionalId;
    if (!id) return;
    try { localStorage.setItem("currentProfessionalId", String(id)); } catch {}
    this.router.navigate(['/reservation'], { queryParams: { professionalId: String(id) }});
  }

  goToReservationParam(professional:any) {
    const id = professional?.id ?? professional?._id ?? professional?.professionalId;
    if (!id) return;
    try { localStorage.setItem("currentProfessionalId", String(id)); } catch {}
    this.router.navigate(['/reservation', String(id)]);
  }

  goBack() { this.router.navigate(['/client-dashboard']); }
}
