import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MifichaPage } from './mificha.page';

describe('MifichaPage', () => {
  let component: MifichaPage;
  let fixture: ComponentFixture<MifichaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MifichaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MifichaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
