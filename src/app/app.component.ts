import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initAccordions, initCarousels, initCollapses, initDials, initDismisses, initDrawers, initDropdowns, initFlowbite, initModals, initPopovers, initTabs, initTooltips } from 'flowbite';
import { Flowbite } from './core/flowbite';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
@Flowbite()
export class AppComponent implements OnInit {
  ngOnInit() {
    initAccordions();
    initCarousels();
    initCollapses();
    initDials();
    initDismisses();
    initDrawers();
    initDropdowns();
    initModals();
    initPopovers();
    initTabs();
    initTooltips();
  }
}
