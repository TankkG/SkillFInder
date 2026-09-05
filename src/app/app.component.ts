import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterOutlet, RouterModule } from "@angular/router"

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="logo">
          <a routerLink="/">SkillFinder</a>
        </div>
      </header>
      
      <main class="app-content">
        <router-outlet></router-outlet>
      </main>
      
      <footer class="app-footer">
        <p>&copy; 2025 SkillFinder - Conectando profesionales y clientes</p>
      </footer>
    </div>
  `,
  styles: [
    `
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .app-header {
      background-color: #2c3e50;
      color: white;
      padding: 15px 20px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .logo {
      font-size: 24px;
      font-weight: bold;
    }
    
    .logo a {
      color: white;
      text-decoration: none;
    }
    
    .app-content {
      flex: 1;
      padding: 0 15px;
    }
    
    .app-footer {
      background-color: #34495e;
      color: white;
      text-align: center;
      padding: 15px;
      margin-top: 40px;
    }
  `,
  ],
})
export class AppComponent {
  title = "SkillFinder"
}
