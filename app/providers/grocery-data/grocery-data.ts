import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import * as PouchDB from 'pouchdb';
//The below line has been put in so I can use the PouchDB Chrome Extension (accessible via F12)
window["PouchDB"] = PouchDB;
 
@Injectable()
export class GroceryDataClass {
 
  data: any;
  db: any;
  cloudantUsername: string;
  cloudantPassword: string;
  remote: any;
  
  //To start with, data does nto need to be reloaded
  public forceReloadData = false;
 
  constructor(private http: Http) {
 
    this.db = new PouchDB('grocery_db');
    this.cloudantUsername = 'USERNAME';
    this.cloudantPassword = 'PASSWORD';
    this.remote = 'CLOUDANT DB URL';

    //Possible EventEmitter memory leak with PouchDB, therefore I am setting the listeners to the max limit
    this.db.setMaxListeners(0);
 
    //Set up PouchDB
    let options = {
      live: true,
      retry: true,
      continuous: true,
      auth: {
        username: this.cloudantUsername,
        password: this.cloudantPassword
      }
    };
 
    this.db.sync(this.remote, options);
  }
 
  getGroceryData() {
    
    //If data exists in the cache and the data doesn't need to be re-loaded, then just return the cached data
    if (this.data && !this.forceReloadData) {
      //Set forceReloadData to FALSE (i.e. data does not need to be re-loaded next time)
      this.forceReloadData = false;
      //Return the cached data
      return Promise.resolve(this.data);
    }

    return new Promise(resolve => {
   
      this.db.allDocs({
   
        include_docs: true
   
      }).then((result) => {
   
        this.data = [];
   
        let docs = result.rows.map((row) => {
          this.data.push(row.doc);
        });

        //Sort the data by g_store_date_created
        if(this.data.length > 1) {
           this.data = this.sortByKey(this.data,"g_store_date_created");
        }

        resolve(this.data);
   
        this.db.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
          this.handleChange(change);
        });
   
      }).catch((error) => {
   
        console.log(error);
   
      }); 
   
    });
   
  }

  //SORT BY KEY FUNCTION
  sortByKey(array, key) {
    return array.sort(function(a, b) {
      var x = a[key]; var y = b[key];
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
  }
 
  createGroceryData(groceryData){
    this.db.post(groceryData);
  }
   
  updateGroceryData(groceryData){
    this.db.put(groceryData).catch((err) => {
      console.log(err);
    });
  }
   
  deleteGroceryData(groceryData){
    this.db.remove(groceryData).catch((err) => {
      console.log(err);
    });
  }
 
  handleChange(change){
   
    let changedDoc = null;
    let changedIndex = null;
   
    this.data.forEach((doc, index) => {
   
      if(doc._id === change.id){
        changedDoc = doc;
        changedIndex = index;
      }
   
    });
   
    //A document was deleted
    if(change.deleted){
      this.data.splice(changedIndex, 1);
    } 
    else {
   
      //A document was updated
      if(changedDoc){
        this.data[changedIndex] = change.doc;
      } 
   
      //A document was added
      else {
        this.data.push(change.doc); 
      }
   
    }
   
  }
}