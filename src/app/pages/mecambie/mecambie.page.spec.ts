import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MecambiePage } from './mecambie.page';

describe('MecambiePage', () => {
  let component: MecambiePage;
  let fixture: ComponentFixture<MecambiePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MecambiePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MecambiePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
