/* eslint-disable guard-for-in */
import { LightningElement, api, track, wire } from 'lwc';
import searchExternalObject from '@salesforce/apex/ServierSearch_CTL_GlobalSearch.searchExternalObject';
import getAllAPINamesForSearch from '@salesforce/apex/ServierSearch_CTL_GlobalSearch.getAllAPINamesForSearch';
import logSearchEntry from '@salesforce/apex/ServierSearch_CTL_GlobalSearch.logSearchEntry';
import getLastSearches from '@salesforce/apex/ServierSearch_CTL_GlobalSearch.getLastSearches';
import { refreshApex } from '@salesforce/apex';
import {CurrentPageReference} from 'lightning/navigation';
import {fireEvent, registerListener} from 'c/pubsub';
//import getIsSelfRegistrationEnabled from '@salesforce/apex/LightningLoginFormController.getIsSelfRegistrationEnabled';


export default class GlobalSearchBar extends LightningElement {

    searchInput = "";

    objectsForSearch = ["Account", "Contact"];
    @track objectsAPINamesMap;
    searchObjects;
   
    searchResults = [];
    _currentSearchText;
    @track isAll ;
    stillFocus = false;
    @track filterString = "All";

    connectedCallback(event){
        //const searchInputZone = this.template.querySelector('[data-id="inputElement"]');
        //searchInputZone.focus();
        //console.log("connected callback done!")
        //Listen on the event of show top results
        registerListener("showTopResults",
        ()=>{
            if( this.searchInput  !=null && this.searchInput.length > 1){
        
                this.recentSearchText = null;
                this.searchPipeline(this.searchInput);
    
            }
        },
        this);
    }
    renderedCallback() {
            const inputBox = this.template.querySelector(`[data-id="inputElement"]`);
            inputBox.focus();
    }

    @api
    handleSingleSearch(target){
        let targetedTitle = [];
        targetedTitle.push(this.objectsAPINamesMap[target]);
        fireEvent(this.pageRef, "initializeList", targetedTitle);
        this.searchInSingleObject(this._currentSearchText, target, this.objectsAPINamesMap[target],true)
        .then(result=>{
            fireEvent(this.pageRef, "gotResponse", JSON.parse(result));  
        })
        .catch(error=>{
            const errorResponse = {title : this.objectsAPINamesMap[this.objectsForSearch[i]]};
            fireEvent(this.pageRef, "gotErrorResponse", errorResponse);  
            //console.log("*******error in gotResponse from globalsearchbar : ");
            //console.log({error});
        });
    }

    @wire(CurrentPageReference) pageRef;

    @wire(getLastSearches)
    recentSearches;

    //Get the API names of objects to search
    @wire(getAllAPINamesForSearch)
    wiredAPINames({ error, data }) {
        if (data) {
            //map of api name mapped to developer name  of objects we want to search for
            this.searchObjects = data;
            this.objectsAPINamesMap = {};
            for(let i in this.searchObjects){
                this.objectsAPINamesMap[this.searchObjects[i].ObjectAPIName__c] = this.searchObjects[i].DeveloperName;
            }
            //contains just api names of objects we need to search for
            this.objectsForSearch = Object.keys(this.objectsAPINamesMap);
        } else if (error) {
            //window.console.log(error);
        }
    }
    //Handle the key up event on the search bar
    handleSearchKeyUp(event){
        const inputBox = this.template.querySelector(`[data-id="filterInput"]`);
        //console.log(inputBox);
        //inputBox.focus();
        //var searchText = event.target.value;
        //this.searchInput = searchText;
        //Number 13 is for "Enter" key on the keyboard
        if( this.searchInput  !=null && event.keyCode === 13 && this.searchInput.length > 1){
        
            this.recentSearchText = null;
            this.searchPipeline(this.searchInput);

        }
    }
    //Returns a promise of the result of searching in a single object
    searchInSingleObject(searchInput, objectAPIName, developerName,viewMore){
        return searchExternalObject({
            searchInput : searchInput,
            objectAPIName : objectAPIName,
            developerName : developerName,
            viewMore : viewMore
        });
    }
    processSearch(searchText){
        if(this.objectsForSearch.length > 0){
            this._currentSearchText = searchText;
            // eslint-disable-next-line guard-for-in
            for(let i in this.objectsForSearch){
                this.searchInSingleObject(searchText, this.objectsForSearch[i], this.objectsAPINamesMap[this.objectsForSearch[i]],false)
                .then(result=>{
                    fireEvent(this.pageRef, "gotResponse", JSON.parse(result));  
                })
                .catch(error=>{
                    const errorResponse = {title : this.objectsAPINamesMap[this.objectsForSearch[i]]};
                    fireEvent(this.pageRef, "gotErrorResponse", errorResponse);  
                    //console.log("*******error in gotResponse from globalsearchbar : ");
                    //console.log({error});
                });
            }
        }
    }
    searchPipeline(){
        //Save the search entry
        logSearchEntry({
            searchInput : this.searchInput
        })
        .then(()=>{
            refreshApex(this.recentSearches);
        })
        .then(()=>{
            //this.dispatchEvent(new CustomEvent('sendobjectnames', {detail : this.objectsAPINamesMap}));
            let titles = [];
            // eslint-disable-next-line guard-for-in
            for(let i in this.objectsForSearch){
                titles.push(this.objectsAPINamesMap[this.objectsForSearch[i]]);
            }
            fireEvent(this.pageRef, "initializeList", titles);
            
        })
        .then(()=>{
            this.processSearch(this.searchInput);
        })
        .catch((err)=>{
            window.console.error(err);
        });
        //Send searchInput to parent to set it as a filter of the dashboard
        let searchText = this.searchInput;
        this.dispatchEvent(new CustomEvent("filterdashboard", {detail : {searchText}}));
    }
    //Constructs "filterOptions" for the searchFilter combobox
    get getAllObjectsForSearch(){
        var filterOptions = [];
        if(this.searchObjects){
            // eslint-disable-next-line guard-for-in
            /*for(let i in this.objectsAPINamesMap){
                filterOptions.push({value : i, label : this.objectsAPINamesMap[i]});
            }*/
            for(var i in this.searchObjects){
                filterOptions.push({value:this.searchObjects[i].ObjectAPIName__c,
                                    label:this.searchObjects[i].Label});
            }
            //selected:this.objectsAPINamesMap[i].SelectedByDefault__c
        }
        this.filterOptions = filterOptions;
        return filterOptions;
    }
    searchInputChange(event){
        this.searchInput = event.target.value;
    }
    filterInputFocus(event){
        this.template.querySelector('section').style.display = 'block';
    }
    hideFilters(event){
        this.template.querySelector('section').style.display = 'none';
    }
    filterInputBlur(event){
        if(!this.stillFocus){
            this.template.querySelector('section').style.display = 'none';
        }
    }
    stillMouseOverFilters(event){
        this.stillFocus = true;
    }
    mouseOutFilters(event){
        this.stillFocus = false;
    }

    filterChange(event){
        this.objectsForSearch = event.target.value;
        
        if(this.objectsForSearch.length == this.objectsAPINamesMap.length){
            this.isAll = true;
            this.filterString = "All";
        }
        else{
            this.isAll = false;
            let temp = "";
            //eslint-disable-next-line guard-for-in
            for(let i in this.objectsForSearch){
                temp = temp  +  this.objectsAPINamesMap[this.objectsForSearch[i]] + ", ";
            }
            this.filterString = temp.substring(0, temp.length-2);
        }
    }
    filterChangeAll(event){
        this.isAll = event.target.checked;
        if(event.target.checked){
            this.objectsForSearch = Object.keys(this.objectsAPINamesMap);
            this.filterString = "All";
        }
        else {
            this.objectsForSearch = [];
            this.filterString = "";
        }
    }

    get getFiltersString(){
        if(this.objectsAPINamesMap && this.objectsForSearch){
            if(this.objectsAPINamesMap.length == this.objectsForSearch.length){
                return "All";
            }
        }
        return "All";
    }

    //Constructs "recentSearchesOptions" for the recent Searches combobox
    get getRecentSearches(){
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
    //Handle the click on a recent search
    handleRecentSearchClick(event){
        //this.searchInput = null;
        let searchText = event.target.value;
        let tmpList = [];
                // eslint-disable-next-line guard-for-in
                for(let i in this.objectsForSearch){
                    tmpList.push(this.objectsAPINamesMap[this.objectsForSearch[i]]);
                }
        fireEvent(this.pageRef, "initializeList", tmpList);
        this.processSearch(searchText);
    }
   
}