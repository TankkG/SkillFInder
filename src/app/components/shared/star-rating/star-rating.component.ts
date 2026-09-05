import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-star-rating",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="star-rating" role="img" aria-label="Calificación">
      <ng-container *ngFor="let _ of stars; let i = index">
        <i
          class="fas"
          role="button"
          tabindex="0"
          (keydown.enter)="onStarClick(i+1)"
          (click)="onStarClick(i+1)"
          [style.cursor]="isReadOnly ? 'default' : 'pointer'"
          [ngClass]="i < Math.round(rating) ? 'fa-star' : 'fa-star-o'"
          [attr.aria-label]="'Estrella ' + (i + 1)"
        ></i>
      </ng-container>

      <span *ngIf="showValue" class="rating-value">{{ rating | number:'1.1-1' }}</span>
    </div>
  `,
  styles: [`
    .star-rating { display:flex; align-items:center; }
    .star-rating i { margin-right:6px; font-size:18px; }
    .rating-value { margin-left:8px; font-weight:600; }
  `]
})
export class StarRatingComponent {
  @Input() rating: number = 0;
  @Input() readonly: boolean = true;
  @Input() readOnly?: boolean;
  @Input() showValue: boolean = false;

  @Output() ratingChange = new EventEmitter<number>();

  public Math = Math;
  stars = new Array(5);

  get isReadOnly(): boolean {
    return this.readOnly ?? this.readonly ?? true;
  }

  onStarClick(value: number) {
    if (this.isReadOnly) return;
    this.rating = value;
    this.ratingChange.emit(value);
  }
}
