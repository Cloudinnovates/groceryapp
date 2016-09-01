import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ViewController } from 'ionic-angular';

@Component({
  templateUrl: 'build/pages/grocery-product-details-modal/grocery-product-details-modal.html',
})
export class GroceryProductDetailsModal {

	public groceryProductPageAction = this.navParams.get('groceryParamProduct_action');

  groceryModalProduct_id: any;
	groceryModalProduct_name: any;
	groceryModalProduct_description: any;
	groceryModalProduct_price: any;

  constructor(private navCtrl: NavController, private viewCtrl: ViewController, private navParams: NavParams) {
  	//Setup default variables
		this.groceryModalProduct_id = navParams.get('groceryParamProduct_id');
    this.groceryModalProduct_name = navParams.get('groceryParamProduct_name');
    this.groceryModalProduct_description = navParams.get('groceryParamProduct_description');
    this.groceryModalProduct_price = navParams.get('groceryParamProduct_price');
  }

  saveGroceryStoreProduct() {
  	
    let data = {
  		groceryParamProduct_id: this.groceryModalProduct_id,
  		groceryParamProduct_name: this.groceryModalProduct_name,
  		groceryParamProduct_description: this.groceryModalProduct_description,
  		groceryParamProduct_price: this.groceryModalProduct_price
  	}
  	this.viewCtrl.dismiss(data);
  }

  cancelGroceryStoreProduct() {
  	this.navCtrl.pop();
  }

}
