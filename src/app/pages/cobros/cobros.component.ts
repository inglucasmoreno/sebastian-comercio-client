import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-cobros',
  templateUrl: './cobros.component.html',
  styles: [
  ]
})
export class CobrosComponent implements OnInit {

  constructor(private alertService: AlertService) { }

  ngOnInit(): void {
  }



}
