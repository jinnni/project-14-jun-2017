import {Component, OnInit} from '@angular/core';
import {Ugc} from "../../data/ugc.interface";

@Component({
  selector: 'component-two-way-ugc-list',
  templateUrl: 'two-way-ugc-list.html',
})
export class TwoWayUgcListComponent implements OnInit {

  ugcList: Ugc[];
  oddUgcList: Ugc[];
  evenUgcList: Ugc[];

  // @Input properties are available in onInit
  ngOnInit() {
    this.splitUgcList();
  }

  splitUgcList() {
    this.oddUgcList = [];
    this.evenUgcList = [];

    for (let i = 0; i < this.ugcList.length; i++) {
      (i % 2 == 0 ? this.oddUgcList : this.evenUgcList).push(
        this.ugcList[i]
      );
    }
  }
}
