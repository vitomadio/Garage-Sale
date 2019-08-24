import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Product } from '../../../models/product-model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private token: string;
  public _products: BehaviorSubject<Product[]>;
  public _product: BehaviorSubject<Product>;
  public _comments: BehaviorSubject<any[]>;

  constructor(
    private http: HttpClient,
  ) {
    this._products = <BehaviorSubject<Product[]>>new BehaviorSubject([]);
    this._product = <BehaviorSubject<Product>>new BehaviorSubject({});
    this._comments = <BehaviorSubject<any[]>>new BehaviorSubject([]);
  }

  //RETURNS PRODUCTS TO SHARE AMONG COMPONENETS.
  get products() {
    return this._products.asObservable();
  }
  //RETURNS PRODUCT TO SHARE AMONG COMPONENETS.
  get product() {
    return this._product.asObservable();
  }
  //RETURNS COMMENTS TO SHARE AMONG COMPONENETS.
  get comments() {
    return this._comments.asObservable();
  }

  ngOnInit() {}

  //GET ALL PRODUCTS.
  getProducts(): Observable<Product[]> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders()
      .set('Authorization', token);
    return this.http.get<any>('/product', { headers })
      .pipe(map(res => {
        if (res.products) {
          console.log(res.products)
          this._products.next(res.products);
          return res.products;
        }
        return res;
      }));
  }
  //GET PRODUCT. 
  getProduct(productId: string): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders()
      .set('Authorization', token);
    return this.http.get<any>('/product/' + productId, { headers })
      .pipe(map(res => {
        if (res.product) {
          console.log(res.product)
          this._product.next(res.product);
          this.http.get<any>('/comments/' + productId, { headers })
            .subscribe(response => {
              console.log(response.comments)
              this._comments.next(response.comments)
            });
          return res.product;
        }
        return res;
      }));
  }

  //GET PRODUCT COMMENTS.
  getProductComments(productId: string): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders()
      .set('Authorization', token);
    return this.http.get<any>('/comments/' + productId, { headers })
      .pipe(map(res => {
        if (res.comments) {
          this._comments.next(res.comments);
          return res.comments
        }
        return res
      }));
  }
  //SAVE PRODUCT TO SALE.
  sellProduct(body: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders()
      .set('Authorization', token);
    return this.http.post('/product/save', body, { headers });
  }
  //SAVE NEW COMMENT.
  saveNewComment(comment: string, productId: string, userEmail: string): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders()
      .set('Authorization', token);
    const body = {
      product: productId,
      buyer: userEmail,
      message: comment
    }
    return this.http.post<any>('/comments/add-comment', body, { headers })
      .pipe(map(res => {
        if (res.comment) {
          const oldComments = Object.assign([], this._comments.value);
          this._comments.next([...res.comment, ...oldComments]);
          return res;
        }
        return res;
      }));
  }
  //SHOWS PRODUCTS CURRENT USER IS SELLING.
  selectMyProducts(myProducts: any[]): void {
    this._products.next(myProducts)
  }

  selectMyCommentedProducts(myProducts) { }
  
  //REPLY COMMENT. This action is onnly permited for the currentUser's products.
  replyToComment(body: any): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders()
      .set('Authorization', token)
    return this.http.post<any>('/comments/reply', body, { headers })
      .pipe(map(res => {
        if (res.comment) {
          console.log(res.comment)
          return res.comment
        }
        return res;
      }));
  }
  //DELETE PRODUCT.
  deleteProduct(productId): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders()
      .set('Authorization', token);
    return this.http.delete('/product/delete-product/' + productId, { headers })
  }

}
