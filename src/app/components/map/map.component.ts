import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { GeocodeService } from '../../services/geocode-service/geocode.service';
import { ProductService } from '../../services/product-service/product.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SanitizeText } from '../../validators/form.validators';
import { Product } from 'src/models/product-model';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  @Input() products: Product[];
  @Output() getProduct = new EventEmitter();

  public title: string = 'My first AGM project';
  public latitude: number = 41.05926405379701;
  public longitude: number = 16.931019109514978;
  public zoom: number = 12;
  public infoWindowPop: string = null;
  public hover: number;
  public query: string;

  // private address: string;
  // private searchForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private geocodeService: GeocodeService,
    private productService: ProductService
  ) { }

  ngOnInit() {
    // this.searchForm = this.formBuilder.group({
    //   address: ['', [Validators.required, SanitizeText]]
    // });
  }
  //CHOSE LOCATION. The marker moves to the selected point in the map.
  onChoseLocation(event) {
    this.latitude = event.coords.lat;
    this.longitude = event.coords.lng;

    this.geocodeService.setCoordinates(this.latitude, this.longitude)
  }
  //GET LOCATION.
  onGetLocation(event) {
    this.latitude = event.latitude;
    this.longitude = event.longitude;
    this.geocodeService.setCoordinates(this.latitude,this.longitude)
  }
  //OPEN INFOWINDOW WHEN MOUSE HOVER.
  onMouseOverMarker(porductId) {
    this.infoWindowPop = porductId;
  }
  //CLOSE INFO WINDOW WHEN MOUSE OUT.
  onMouseOutMarker() {
    this.infoWindowPop = null;
  }
  //OPEN PRODUCT DETAILS MODAL.
  openProductDetails(product) {
    this.productService.getProduct(product._id)
      .subscribe(res => {
        this.productService.product
          .subscribe(product => {
            this.getProduct.emit();
        });
    });
  }

  //SEARCH QUERY.
  onChange(event) {
    this.query = event.target.value;
  }

  //GET LATITUD $ LONGITUDE BY ADDRESS.
  // getLocation() {
  //   this.geocodeService.getLocation(this.searchForm.value)
  //     .subscribe(location => console.log(location));
  // }

  //GET DISTANCE BETWEEN MY USER POSITION AND SELER POSITION.
  // getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  //   const R = 6371; // Radius of the earth in km
  //   const dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
  //   const dLon = this.deg2rad(lon2 - lon1);
  //   const a =
  //     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  //     Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
  //     Math.sin(dLon / 2) * Math.sin(dLon / 2)
  //     ;
  //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  //   const d = R * c; // Distance in km
  //   return d;
  // }

  // deg2rad(deg) {
  //   return deg * (Math.PI / 180)
  // }




}
