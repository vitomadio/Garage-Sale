import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SanitizeText, ValidatePrice } from 'src/app/validators/form.validators';
import { GeocodeService } from '../../services/geocode-service/geocode.service';
import { ProductService } from '../../services/product-service/product.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {

  public imageUrl: any = null;
  public productForm: FormGroup;
  public selectedFile: File;
  public specialCaraters: string = "(\-,.*+?^$[](){}!=|)";
  public submitted: boolean = true;
  public message: string = null;

  @ViewChild('productModal', { static: false }) productModal: ModalDirective;

  constructor(
    private formBuilder: FormBuilder,
    private geoService: GeocodeService,
    private productService: ProductService
  ) { }

  ngOnInit() {
    this.productForm = this.formBuilder.group({
      title: ['', [Validators.required, SanitizeText]],
      description: ['', [Validators.required, SanitizeText]],
      price: ['', [Validators.required, ValidatePrice]]
    });
  }

  get pr() { return this.productForm.controls; } 

  showChildModal(): void {
    this.productModal.show();
  }
  //CLOSE MODAL.
  hideChildModal(): void {
    this.productForm.reset();
    this.productModal.hide();
  }
  //SELECT IMAGE.
  onFileSelected(event): void {
    this.selectedFile = <File>event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(this.selectedFile);
    reader.onload = (_event) => {
      this.imageUrl = reader.result;
    }
  }
 
  //PUBLISH PRODUCT.
  publishProduct(): void {
    this.submitted = true;
    this.geoService.coordinates
      .subscribe(res => {
        if (res) {
          console.log(res)
          if (!this.selectedFile) return this.message = "You must select an image before continue.";
          const fd = new FormData();
          for (let key in this.productForm.value) {
            fd.append(key, this.productForm.value[key]);
          }
          for (let key in res) {
            fd.append(key, res[key])
          }
          fd.append('file', this.selectedFile);
          
          this.productService.sellProduct(fd)
            .subscribe(res => {
              if (res.success === false || !res.product) {
                return this.message = res.message;
              }
              this.productForm.reset();
              this.hideChildModal();
            });
        }
        this.message = "*You must select a location before continue."
      });
  }

}
