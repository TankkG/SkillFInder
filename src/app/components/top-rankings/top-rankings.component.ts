import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProfessionalService, Professional } from "../../services/professional.service";
import { StarRatingComponent } from "../shared/star-rating/star-rating.component";

@Component({
  selector: "app-top-rankings",
  standalone: true,
  imports: [CommonModule, StarRatingComponent],
  templateUrl: "./top-rankings.component.html",
  styleUrls: ["./top-rankings.component.css"],
})
export class TopRankingsComponent implements OnInit {
  topProfessionals: Professional[] = [];
  constructor(private professionalService: ProfessionalService) {}

  async ngOnInit(): Promise<void> {
    try {
      const pros = await this.professionalService.getProfessionals();
      const sorted = (pros || []).sort((a,b) => (b.rating||0) - (a.rating||0));
      this.topProfessionals = sorted.slice(0, 5);
    } catch(err) {
      console.error(err);
    }
  }
}