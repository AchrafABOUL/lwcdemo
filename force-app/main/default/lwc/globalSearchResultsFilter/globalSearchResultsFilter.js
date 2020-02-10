import { LightningElement, api, wire, track } from 'lwc';
import {CurrentPageReference } from 'lightning/navigation';
import {fireEvent, registerListener} from 'c/pubsub';


export default class GlobalSearchResultsFilter extends LightningElement {


    @wire(CurrentPageReference) pageRef;
    @track newResults = [];

   connectedCallback(){
    registerListener(
        "initializeList",
        (names)=>{
            this.newResults = [];
            // eslint-disable-next-line guard-for-in
            for (let i in names) {
              this.newResults.push({
                "title": names[i]
              });
            }
        },
        this
      );
    registerListener(
        "gotResponse",
        (resp) => {
  
          for (let i in Object.keys(this.newResults)) {
            if (this.newResults[i].title == resp.title) {
              this.newResults[i] = resp;
            }
          }
  
        },
        this
      );


   }


   //handle case of choosing the Search Objects Tab or Search Analaytics tab
   toggleSearchType(event){
     //objects or analytics
    const tabtitleid = event.currentTarget.dataset.tabtitleid;
    //Like a name for all tab titles
    const tabTitle = "tabTitle";
    //Like a name for all tab contents
    const tabContent = "tabContent";
    //clear the content of the objects tab if we choose the tab analytics
    if(tabtitleid === "analytics"){
      this.newResults = [];
    }
    //Highlight the selected tab title
    this.template.querySelectorAll(`[data-name="${tabTitle}"]`)
    .forEach(e=>{
      if(e.dataset.tabtitleid === tabtitleid){
        e.setAttribute("class", "slds-tabs_default__item slds-is-active");
      }
      else{
        e.setAttribute("class", "slds-tabs_default__item");
      }
    });
    //Show the contenet of the selected tab
    this.template.querySelectorAll(`[data-name="${tabContent}"]`)
    .forEach(e=>{
      if(e.dataset.tabcontentid === tabtitleid){
        e.setAttribute("class","slds-tabs_default__content slds-show");
      }
      else{
        e.setAttribute("class", "slds-tabs_default__content slds-hide");
      }
    });

    //Send event to the parent to toggle the results view
    this.dispatchEvent(new CustomEvent("toggleresultsview", {detail : {tabtitleid}}));

   }
   //Show all results again in the results part
   showTopResults(){
    fireEvent(this.pageRef, "showTopResults", null);
   }

   //Handle the click on a result category (object)
    filterClicked(event){
        event.currentTarget.setAttribute("class", "slds-nav-vertical__item slds-is-active");
        let title = event.currentTarget.dataset.title;
        
        this.template.querySelectorAll(`[data-name="resultsTitles"]`)
          .forEach(e => {
            if (e.dataset.title !== title) {
                e.setAttribute("class", "slds-nav-vertical__item");
            }
          });
          
        fireEvent(this.pageRef, 'scrollToObject', title);
    }

}