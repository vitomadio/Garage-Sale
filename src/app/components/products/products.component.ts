import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ProductService } from '../../services/product-service/product.service';
import { AuthService } from '../../services/auth-service/auth.service';
import { Product } from '../../../models/product-model';
import { Location } from '../../../models/location-model';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import * as socketIo from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  public query: string = null;
  public checked: boolean = false;
  public faTrashAlt = faTrashAlt;
  public currentUser: any;
  public products: Product[];
  public url: string = environment.url;

  @Output() getProductLocation:EventEmitter<Product> = new EventEmitter<Product>();

  constructor(
    private productService: ProductService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.getProducts();
    this.productService.products
      .subscribe(res => this.products = res);
    this.authService.currentUser
      .subscribe(res => this.currentUser = res);
    //Configure socket.io to update comments in every session in realtime.
    const socket = socketIo('/');
    //Refresh comments on every active session in real time
    socket.on('add comment', (data) => {
      this.getProductDetails(data.product);
    });
    //Refresh products list after adding or removing a product on every session in real time.
    socket.on('refresh products', (data) => {
      this.getProducts();
    });
  }
  //GET ALL PRODUCTS.
  getProducts(): void {
    this.productService.getProducts()
      .subscribe(res => {
        console.log(res)
      });
  }
  //GET PRODUCT LOCATION.
  getProductDetails(product: Product): void {
    // this.productService.getProduct(product._id)
    this.productService.getProduct(product._id)
      .subscribe(res => {
        this.getProductLocation.emit(product); /*Product passes as event to 
        dashsboard to set product on the map and opens the product
        details modal.*/
      })
  }
  //SEARCH QUERY.
  onChange(event) {
    this.query = event.target.value;
  }
  //SORT BY LOWEST PRICE.
  sortByPrice() {
    this.checked = !this.checked;
    if (this.checked == false) {
      this.getProducts();
    }
  }
  //DELETE PRODUCT.
  deleteProduct(product: Product): void{
    this.productService.deleteProduct(product._id)
    .subscribe(res => console.log(res))
  }

}
