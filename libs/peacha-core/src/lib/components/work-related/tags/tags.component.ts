import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ivo-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.less'],
})
export class TagsComponent {
  constructor(private router: Router) {}

  colors = [
    '#BDAD79',
    '#BD7979',
    '#79BD8E',
    '#8279BD',
    '#BD9279',
    '#79B4BD',
    '#BD7997',
    '#7997BD',
    '#79B4BD',
    '#BD79A2',
    '#AF79BD',
    '#8779BD',
    '#7994BD',
    '#79BDBD',
    '#79BD94',
    '#87BD79',
    '#AFBD79',
    '#BDA279',
    '#D96C6C',
    '#D96CAD',
    '#C36CD9',
    '#797293',
    '#6C98D9',
    '#58B1B1',
    '#4F9D6E',
    '#6A8364',
    '#7F8D47',
    '#D9AD6C',
  ]; //28

  @Input() tags: {
    id: number;
    name: string;
  }[];

  curColor = '';

  computeHash(v: string) {
    var hash = 0,
      i,
      chr;
    for (i = 0; i < v.length; i++) {
      chr = v.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    this.curColor = this.colors[Math.abs(hash) % 28];
    return this.colors[Math.abs(hash) % 28];
  }

  computeHashBoxShaow() {
    return '1px 2px 8px' + this.curColor;
  }

  searchWork(id: number, k: string) {
    this.router.navigate(['hotTagWork'], {
      queryParams: {
        id: id,
        k: k,
        page: 1,
      },
    });
  }
}
