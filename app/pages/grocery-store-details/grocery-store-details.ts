import {Component} from '@angular/core';
import {NavController, ModalController, NavParams} from 'ionic-angular';
import {GroceryDataClass} from '../../providers/grocery-data/grocery-data';
import {GroceryProductDetailsModal} from '../grocery-product-details-modal/grocery-product-details-modal';

@Component({
  templateUrl: 'build/pages/grocery-store-details/grocery-store-details.html',
})
export class GroceryStoreDetailsPage {

	public groceryPageAction = this.navParams.get('groceryParamPageAction');
	public groceryProductIDInt = 0;
	public groceryProductDataSet = [];

	groceryDB_id: any;
	groceryDB_rev: any;
	groceryStoreName: any;
  groceryStoreDescription: any;

  constructor(
  	private navCtrl: NavController,
  	private navParams: NavParams,
  	private groceryDataService: GroceryDataClass,
  	public modalCtrl: ModalController) {
  }

  ionViewLoaded(){
		if (this.groceryPageAction == 'Create') {
			//Don't need to set up any default variable values
		}
		else {
			//Setup default variables
			this.groceryPageAction = 'Edit';
			this.groceryDB_id = this.navParams.get('groceryParamDB_id');
			this.groceryDB_rev = this.navParams.get('groceryParamDB_rev');
			this.groceryStoreName = this.navParams.get('groceryParamStoreName');
			this.groceryStoreDescription = this.navParams.get('groceryParamStoreDescription');
			this.groceryProductDataSet = this.navParams.get('groceryParamStoreProducts');

			//Determine the ID value for next Grocery Store Product
			this.groceryProductIDInt = this.findMaxArrayValuePlusOne(this.groceryProductDataSet, "product_id");
		}
  }

  saveGroceryStore(){
  	//GroceryData does not need to be re-loaded, as changes are being saved.
  	this.groceryDataService.forceReloadData = false;

  	//Calculate the Save Date
  	var groceryStoreSaveDate = (new Date()).toJSON();

  	//Sort the groceryProductDataSet by product_date_created
  	if(this.groceryProductDataSet.length > 1) {
  		this.groceryProductDataSet = this.groceryDataService.sortByKey(this.groceryProductDataSet,"product_date_created");
  	}

  	//Action id differnet depending on whether store is being CREATED or EDITED
  	if(this.groceryPageAction == 'Create'){
			//Create new store
			this.groceryDataService.createGroceryData({
	    	g_store_date_created: groceryStoreSaveDate,
	    	g_store_date_edited: groceryStoreSaveDate,
	    	g_store_name: this.groceryStoreName,
	    	g_store_description: this.groceryStoreDescription,
	    	g_store_products: this.groceryProductDataSet
	    });
  	} else {
  		//Retrieve the original CREATE date
  		var originalCreateDate = this.navParams.get('groceryParamStoreDateCreated');

  		//Edit existing store
  		this.groceryDataService.updateGroceryData({
	    	_id: this.groceryDB_id,
	    	_rev: this.groceryDB_rev,
	    	g_store_date_created: originalCreateDate,
	    	g_store_date_edited: groceryStoreSaveDate,
	    	g_store_name: this.groceryStoreName,
	    	g_store_description: this.groceryStoreDescription,
	    	g_store_products: this.groceryProductDataSet
	    });
  	}
    //Pop window
    this.navCtrl.pop();
  }

  cancelGroceryStore(){
  	//Ensure the GroceryData is re-loaded, so that any saved changes are not cached.
  	this.groceryDataService.forceReloadData = true;
  	//Pop window
    this.navCtrl.pop();
  }

	presentGroceryProductDetailsModal_Create() {

		let eventModal = this.modalCtrl.create(
			GroceryProductDetailsModal, {
				groceryParamProduct_action: 'Create',
				groceryParamProduct_id: this.groceryProductIDInt
			});
		eventModal.onDidDismiss(data => {
			
			//Calculate the Save Date
  		var productSaveDate = (new Date()).toJSON();

			var eventText = '{ "product_id":"' + data.groceryParamProduct_id + '",' +
												'"product_name":"' + data.groceryParamProduct_name + '",' +
												'"product_description":"' + data.groceryParamProduct_description + '",' +
												'"product_price":"' + data.groceryParamProduct_price + '",' +
												'"product_date_created":"' + productSaveDate + '",' +
												'"product_date_edited":"' + productSaveDate + '"}';
			var eventObj = JSON.parse(eventText);
			this.groceryProductDataSet.push(eventObj);
			this.groceryProductIDInt ++;
		});
		eventModal.present();
	}

	presentGroceryProductDetailsModal_Edit(groceryProductData) {

		let eventModal = this.modalCtrl.create(
			GroceryProductDetailsModal, {
				groceryParamProduct_action: 'Edit',
				groceryParamProduct_id: groceryProductData.product_id,
				groceryParamProduct_name: groceryProductData.product_name,
				groceryParamProduct_description: groceryProductData.product_description,
				groceryParamProduct_price: groceryProductData.product_price
			});
		eventModal.onDidDismiss(data => {
			
			//Calculate the Edit Date
  		var productEditDate = (new Date()).toJSON();

			for (var i = 0; i < this.groceryProductDataSet.length; i++){
				if( this.groceryProductDataSet[i].product_id == data.groceryParamProduct_id) {
					this.groceryProductDataSet[i].product_name = data.groceryParamProduct_name;
					this.groceryProductDataSet[i].product_description = data.groceryParamProduct_description;
					this.groceryProductDataSet[i].product_price = data.groceryParamProduct_price;
					this.groceryProductDataSet[i].product_date_edited = productEditDate;
					break;
				}
			}
		});
		eventModal.present();
	}

	findAndRemoveFromArray(array, property, value) {
		array.forEach(function(result, index) {
			if(result[property] === value) {
				//Remove from array
				array.splice(index, 1);
			}    
		});
  }

  findMaxArrayValuePlusOne(array, property) {
		var max = -Infinity;
		array.forEach(function(result, index) {
			if(result[property] > max) {
				max = result[property];
			}			
		});
		if(max == -Infinity){
			return 0;
		} else {
			return Number(max) + 1;
		}
  }

	deleteGroceryProduct(groceryProductData){
    this.findAndRemoveFromArray(this.groceryProductDataSet, 'product_id', groceryProductData.product_id);
  }
}
