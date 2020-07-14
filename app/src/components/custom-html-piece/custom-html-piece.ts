import {Component, ElementRef, Input, ViewChild} from '@angular/core';

@Component({
  selector: 'custom-html-piece',
  templateUrl: 'custom-html-piece.html'
})
export class CustomHtmlPieceComponent {

  @Input()
  content: string;

  @ViewChild('contentContainer')
  contentContainer: ElementRef;

  // element with view child tag cannot be used in constructor
  ngAfterViewInit() {
    this.contentContainer.nativeElement.innerHTML = this.content;
  }
}
