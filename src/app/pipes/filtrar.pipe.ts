
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtrar'
})

export class FiltrarPipe implements PipeTransform {

  transform(items: any[], value: string, label: string): any[] {
    if ( !items ) { return []; }
    if ( !value ) { return  items; }
    if ( value === '' || value === null ) { return []; }
    return items.filter(e => e[label].toLowerCase().indexOf(value) > -1 );
  }

}

/*  ejemplo para revisar

<h1>Runners</h1>
<div>
<input type="text" [(ngModel)]="queryString" placeholder = "Search Runner Name">
</div>
<ul>
  <li *ngFor = "let user of users | filterdata: queryString : 'RunnerName' ; let i = index">
    <a routerLink = "/details/{{ user.RunnerId }}">{{ user.RunnerName }}</a>
    <ul>
      <li><strong>Runner ID: {{ user.RunnerId }}</strong></li>
    </ul>
  </li>
</ul>

*/