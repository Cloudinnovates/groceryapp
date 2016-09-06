import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {GroceryDataClass} from '../../providers/grocery-data/grocery-data';
import {GroceryStoreDetailsPage} from '../grocery-store-details/grocery-store-details';

@Component({
  templateUrl: 'build/pages/home/home.html'
})

export class HomePage {

	groceryStoreDataSet: any;
      
  constructor(public navCtrl: NavController, private groceryDataService: GroceryDataClass){
    
  }

  ionViewDidEnter(){
    this.groceryDataService.getGroceryData().then((data) => {
        this.groceryStoreDataSet = data;
    });
  }

  deleteGroceryStore(groceryData){
    this.groceryDataService.deleteGroceryData(groceryData);
  }

  navGroceryStoreCreate(): void {
    this.navCtrl.push(GroceryStoreDetailsPage, {groceryParamPageAction: 'Create'});
  }

  navGroceryStoreUpdate(groceryData): void {

    this.navCtrl.push(GroceryStoreDetailsPage, {
      groceryParamPageAction: 'Edit',
      groceryParamDB_id: groceryData._id,
      groceryParamDB_rev: groceryData._rev,
      groceryParamStoreDateCreated: groceryData.g_store_date_created,
      groceryParamStoreName: groceryData.g_store_name,
      groceryParamStoreDescription: groceryData.g_store_description,
      groceryParamStoreProducts: groceryData.g_store_products.slice() //The slice() method returns the selected elements in a new array object.
    });
  }
}
