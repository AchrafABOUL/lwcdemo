/* eslint-disable guard-for-in */
import {
    LightningElement,
    wire
} from 'lwc';
import executeSearch from '@salesforce/apex/SearchController.executeSearch';
import getLastSearches from '@salesforce/apex/SearchController.getLastSearches';
import logSearchEntry from '@salesforce/apex/SearchController.logSearchEntry';
import {
    refreshApex
} from '@salesforce/apex';
import {
    CurrentPageReference
} from 'lightning/navigation';
import {
    fireEvent,
    registerListener
} from 'c/pubsub';
//import getIsSelfRegistrationEnabled from '@salesforce/apex/LightningLoginFormController.getIsSelfRegistrationEnabled';


export default class GlobalSearchBar extends LightningElement {

    searchInput = "";
    objectsForSearch = ["Account", "Contact"];
    recentSearchText;
    currentObject = "Account";
    @wire(getLastSearches)
    recentSearches;
    get getRecentSearches() {
        var recentSearchesOptions = [];
        if(this.recentSearches){
            // eslint-disable-next-line guard-for-in
            for(let i in this.recentSearches.data){
                recentSearchesOptions.push(
                    {
                        label : this.recentSearches.data[i],
                        value : this.recentSearches.data[i]
                    }
                )
            }
        } 
        return recentSearchesOptions; 
    }
    @wire(CurrentPageReference) pageRef;

    connectedCallback() {
        registerListener(
            "changeObject",
            (curObject) => {
                this.currentObject = curObject;
                console.log('This is the current object : ' + this.currentObject);
            },
            this
        );
    }
    searchInputChange(event) {
        this.searchInput = event.target.value;
    }
    handleSearchKeyUp(event) {
        if (this.searchInput != null && event.keyCode === 13 && this.searchInput.length > 1) {
            this.processSearch(this.searchInput);
        }
    }
    processSearch(searchText) {
        logSearchEntry({
            searchInput : this.searchInput
        })
        .then(()=>{
            refreshApex(this.recentSearches);
        })
        .then(()=>{
            this.searchInSingleObject(searchText, this.currentObject)
            .then(result => {
                console.log('*****respooonse ');
                console.log(result);
                fireEvent(this.pageRef, "gotResponse", JSON.parse(result));
            })
            .catch(error => {
                const errorResponse = {
                    title: this.currentObject
                };
                fireEvent(this.pageRef, "gotErrorResponse", errorResponse);
            });
        })
        
    }
    searchInSingleObject(searchInput, objectAPIName) {
        return executeSearch({
            searchInput: searchInput,
            objectAPIName: objectAPIName
        });
    }
    handleRecentSearchClick(event){
        console.log('event');
        console.log(event);
        console.log('searchtext');
        let searchText = event.target.value;
        console.log(searchText);
        this.processSearch(searchText);
    }
}