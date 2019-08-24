import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service/auth.service';
import { ProductService } from '../../services/product-service/product.service';
import { Router } from '@angular/router'
import { faBars, faStore, faDollyFlatbed, faComment, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { Product } from '../../../models/product-model';
import { Location } from '../../../models/location-model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public faBars = faBars;
  public faStore = faStore;
  public faDollyFlatbed = faDollyFlatbed;
  public faComment = faComment;
  public faSignOutAlt = faSignOutAlt;
  public currentUser: any;
  public products: Product[];

  constructor(
    private authService: AuthService,
    private router: Router,
    private productService: ProductService
  ) { }

  ngOnInit() {
    this.authService.currentUser
      .subscribe(user => this.currentUser = user);
    this.productService.products
      .subscribe(res => this.products = res);

  }
  //LOGOUT USER.
  userLogout(): void {
    this.authService.logoutUser();
    window.localStorage.clear();
    this.router.navigateByUrl('/');
  }
  //GET LOCATION.
  // getLocation(location: Location) {
  //   console.log(location)
  // }
  //SELECT PRODUCTS CURRENT USER IS SELLING.
  selectMyProductsForSale(): void {
    const myProducts = this.products.filter(item => item.user.email === this.currentUser.email);
    this.productService.selectMyProducts(myProducts);
  }
  //GO TO STORE.
  goToTheStore(): void {
    this.productService.getProducts()
      .subscribe(res => console.log(res))
  }
  //SELECT PRODUCTS CURRENT USER HAS COMMENTED.
  selectMyCommentedProducts() {
    let myProducts: any[];
    this.currentUser.comments.map(comment => {
      myProducts = this.products.filter(item => item._id === comment.product);
      this.productService.selectMyCommentedProducts(myProducts);
    });
  }

}
