import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AuthService } from 'src/app/services/auth-service/auth.service';
import { ProductService } from 'src/app/services/product-service/product.service';
import * as socketIo from 'socket.io-client';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {

  public currentUser: any;
  public userComments: any[];

  @ViewChild('commentsModal', { static: false }) commentsModal: ModalDirective;
  @Output() getProduct = new EventEmitter(); //Opens the product-details modal.

  constructor(
    private authService: AuthService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.authService.currentUser
      .subscribe(res => this.currentUser = res);
    //Configure socket.io to update comments in every session in real time.
    const socket = socketIo('/');
    //Refresh comments on every active session in real time.
    socket.on('add comment', (data) => {
      this.getCurrentUserComments();
    });
    this.getCurrentUserComments();
  }
  //OPEN COMMENTS MODAL.
  showChildModal(): void {
    this.commentsModal.show();
  }
  //CLOSE COMMENTS MODAL.
  hideChildModal(): void {
    this.commentsModal.hide();
  }
  //OPEN PRODUCT DETAILS.
  openProductDetails(product): void {
    this.hideChildModal();
    this.getProduct.emit();
    this.productService.getProduct(product._id)
      .subscribe(res => {
        console.log(res)
    })
  }
  //GET CURRENT USER COMMENTS.
  getCurrentUserComments(): void {
    this.authService.getCurrentUserComments()
      .subscribe(res => {
        if (res.comments) {
          return this.userComments = res.comments
        }
        console.log(res.message)
      });
  }

}
