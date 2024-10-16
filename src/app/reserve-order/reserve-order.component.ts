import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CarService } from '../services/car.service';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Client } from '../models/client';
import { CarReservationService } from '../services/car-reservation.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reserve-order',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './reserve-order.component.html',
  styleUrl: './reserve-order.component.scss'
})
export class ReserveOrderComponent implements OnInit{

  carId!:number;
  reservationFee:number = 0;
  reservationForm: FormGroup = new FormGroup({});
  client?:Client;
  showForm1: boolean = true;
  isAllowed:boolean = true;


  constructor(
    private carService: CarService,
    private carReservationService:CarReservationService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.createForm();
  }
  
  ngOnInit(): void {
    this.carId = +this.activatedRoute.snapshot.paramMap.get('id')!;
    this.reservationFee = +this.activatedRoute.snapshot.paramMap.get('reservationFee')!;
   
  }

  createForm(){
    this.reservationForm = new FormGroup({
    
        carId: new FormControl(this.carId),
        nationalId: new FormControl(this.client?.nationalId, [ Validators.required,
                    Validators.pattern('^[0-9]{14}$') ]),
        firstName:  new FormControl(this.client?.firstName, [
          Validators.required,
          Validators.minLength(2)]),
        lastName:  new FormControl(this.client?.lastName, [
          Validators.required,
          Validators.minLength(2)
        ]),
        address:   new FormControl(this.client?.address, Validators.required),
        email:     new FormControl(this.client?.email, [
          Validators.required,
          Validators.email]),
        phone:  new FormControl(this.client?.phone, [
          Validators.required,
          Validators.pattern(/^\d{10,15}$/)
        ]),
     
    });
  }

  

  submitForm(){
    this.reservationForm.markAllAsTouched();
    if (this.reservationForm.valid) {
      //check if user is allowed to reserve
     
      this.carReservationService.isAllowedToReserve(this.reservationForm.controls['nationalId'].getRawValue()).subscribe({
        next : r => {
          const isAllowed = r?.isAllowed; 
          if(isAllowed){
            this.showForm1 = false;
            this.client = {
              nationalId: this.reservationForm.get('nationalId')?.value,
              firstName: this.reservationForm.get('firstName')?.value,
              lastName: this.reservationForm.get('lastName')?.value,
              address: this.reservationForm.get('address')?.value,
              email: this.reservationForm.get('email')?.value,
              phone: this.reservationForm.get('phone')?.value,
            };

            this.carReservationService.reserveCar(this.client, this.carId).subscribe({
              next: r => {
                    if(r?.isAllowed)
                       this.showSuccessMessage();
                    else
                    this.showErrorMessage(r?.message);
              },
              error: e => console.log(e)
            });
          }
          else{
            this.showErrorMessage(r?.message);
          }
        },

        error: e => this.showErrorMessage(e.message)
      
      })

      //method
    } else {
    
    }
   

  }
 

  showErrorMessage(message:string){
    Swal.fire({
      title: 'Error!',
      text: message,
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }

  showSuccessMessage(){
    Swal.fire({
      title: 'Car is reserved successfully!',
      text: 'Check your Email for futher Details!',
      icon: 'success',
      confirmButtonText: 'OK'
    });
  }

  
}
