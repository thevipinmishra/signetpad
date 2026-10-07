---
title: Angular
description: Attach SignetPad to a canvas from an Angular component.
section: integrations
order: 37
---

Angular Ivy needs its own compiler for `@Component` metadata. SignetPad ships a host attach helper instead of a precompiled Angular component. Wrap it in your own standalone component.

```ts
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { attachAngularSignaturePad, type AngularSignaturePadHandle } from 'signetpad/angular';

@Component({
  selector: 'app-signature-field',
  standalone: true,
  template: `<canvas #surface width="600" height="240" aria-label="Signature"></canvas>`,
})
export class SignatureFieldComponent implements AfterViewInit, OnDestroy {
  @ViewChild('surface', { static: true })
  surface!: ElementRef<HTMLCanvasElement>;

  private handle: AngularSignaturePadHandle | null = null;

  ngAfterViewInit(): void {
    this.handle = attachAngularSignaturePad(this.surface.nativeElement, {
      viewport: { width: 600, height: 240 },
    });
  }

  undo(): void {
    this.handle?.controller.undo();
  }

  ngOnDestroy(): void {
    this.handle?.destroy();
  }
}
```

Call `handle.controller.toData()` or `toSvg()` when you save the signature.
