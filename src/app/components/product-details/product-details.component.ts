import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Product } from '../../../models/product-model';
import { ProductService } from '../../services/product-service/product.service';
import { AuthService } from 'src/app/services/auth-service/auth.service';
import { faTimes, faArrowRight, faReply } from '@fortawesome/free-solid-svg-icons';
import { faComment } from '@fortawesome/free-regular-svg-icons';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {

  public product: Product;
  public faComment= faComment;
  public faTimes= faTimes;
  public faArrowRight = faArrowRight;
  public faReply = faReply;
  public commentsBoardOpen: boolean = false;
  public iconAnimation: boolean = false;
  public comment: string;
  public currentUser: any;
  public comments: any[];
  public replyInputOpen: string = null;
  public buyerEmail: string = null;
  public replyMessage: string = '';
  public commentInp: string = '';
  public url: string = environment.url;

  @ViewChild('productDetails', { static: false }) productDetails: ModalDirective;
 
  constructor(
    private productService: ProductService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.productService.product
      .subscribe(res => {
        this.product = res;
      });
    this.authService.currentUser
      .subscribe(res => this.currentUser = res);
    this.productService.comments
      .subscribe(res => this.comments = res);
  }
  //OPEN PRODUCT DETAILS MODAL.
  showChildModal(): void {
    this.productDetails.show();
  }
  //CLOSE PRODUCT DETAILS MODAL.
  hideChildModal(): void {
    this.productDetails.hide();
    /* setTimeout(() => { //We use setTimeout in order to have product 
    parameters till modal is totally closed.
    this.product = new Product; 
    },500) */ 
  }
  //OPEN COMMENTS BOARD.
  openCommentsBoard() {
    this.commentsBoardOpen = true;
  }
  //CLOSE COMMENTS BOARD.
  closeCommentsBoard() {
    this.commentsBoardOpen = false;
  }
  //EXTEND ICON BUTTON.
  extendButton() {
    this.iconAnimation = true;
  }
  //WRITE COMMENT.
  onWriteComment(event, productId) {
    if(event.keyCode == 13){
      if (this.comment) {
        this.commentInp = '';
        return this.productService.saveNewComment(
          this.comment,
          productId,
          this.currentUser.email
        )
        .subscribe(res => {
          console.log(res)
        });
      }
    }
    this.comment = event.target.value;
  }
  //SAVE NEW COMMENT.
  saveNewComment(productId: string) {
    if (this.comment) {
      this.commentInp = '';
      this.productService.saveNewComment(
        this.comment,
        productId,
        this.currentUser.email
      )
      .subscribe(res => {
        console.log(res)
      });
    }
  }
  //OPEN REPLY INPUT.
  openReplyInput(commentId: string) {
    this.replyInputOpen = commentId;
  }
  //REPLY TO BUYER.
  onReplyComment(event, comment: any) {
    if (event.keyCode == 13) {
      const body = {
        replyMessage: this.replyMessage,
        commentId: comment._id
      }
      //Save reply in DB.
      this.productService.replyToComment(body)
        .subscribe(res => {
          console.log(res.message)
          this.replyMessage = '';
          this.replyInputOpen = null;
      })
    }
  }


}
