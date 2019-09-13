import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
// import { apiKey } from '../../config-env';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AgmCoreModule } from '@agm/core';
//Components
import { AuthComponent } from './pages/auth/auth.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { HomeComponent } from './pages/home/home.component';
import { MapComponent } from './components/map/map.component';
import { ProductsComponent } from './components/products/products.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { SearchPipe } from './pipes/search.pipe';
import { CommentsComponent } from './components/comments/comments.component';
import { SortPipe } from './pipes/sort/sort.pipe';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';


@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    DashboardComponent,
    ProfileComponent,
    HomeComponent,
    MapComponent,
    ProductsComponent,
    ProductFormComponent,
    ProductDetailsComponent,
    SearchPipe,
    CommentsComponent,
    SortPipe
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    FontAwesomeModule,
    AgmCoreModule.forRoot({
      apiKey: environment.apiKey
    }),
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    ButtonsModule.forRoot(),
    TooltipModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
