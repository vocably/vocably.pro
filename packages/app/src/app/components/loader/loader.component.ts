import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export type LoaderComponentOptions = {
  message?: string;
};

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  standalone: false,
})
export class LoaderComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: LoaderComponentOptions) {}

  ngOnInit(): void {}
}
