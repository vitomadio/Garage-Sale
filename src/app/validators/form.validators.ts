import { AbstractControl } from '@angular/forms';

//VALIDATES EMAIL.
export function ValidateEmail(text: AbstractControl){
    const regex = /\S+@\S+\.\S+/;
    let validEmail = regex.test(text.value); 
    if (!validEmail) {
        return { validEmail: true };
    }
    return null;
}
//SANITIZE INPUTS.
export function SanitizeText(text: AbstractControl) {
    const regex = /[\\*+?^$[\](){}!=|]/;
    let validText = regex.test(text.value);
    if (validText) {
        return { validText: true };
    }
    return {validText: false}
}

//SANITIZE PRICE.
export function ValidatePrice(text: AbstractControl) {
    let regex = /^\d+\.\d{2}$/;
    const validPrice = regex.test(text.value);
    if (!validPrice) {
        return { validPrice: true };
    }
    return { validPrice: false };
    
}