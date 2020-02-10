import {
  LightningElement,
  track,
  wire,
  api
} from 'lwc';
import {
  CurrentPageReference
} from 'lightning/navigation';
import {
  registerListener,
  fireEvent
} from 'c/pubsub';
export default class GlobalSearchResults extends LightningElement {
    @track shownResults = [];
    @track focusOnOneEntry = false;
    shownResultsTMP = [];
    //@track results;

    @wire(CurrentPageReference) pageRef;
    connectedCallback() {
        registerListener("scrollToObject",
            (title) => {
                console.log("*******scroll to object event");
                console.log("**"+title+"**");
                let target = this.template.querySelector(`[data-title="${title}"]`);
                target.scrollIntoView();
                /*
                this.template.querySelectorAll(`[data-title="${title}"]`)
                .forEach(e => {
                    if (e != null) {
                        console.log("**********Element");
                        console.log(e);
                        e.scrollIntoView();
                    }
                });
                */
            },
            this
        );

        registerListener(
            "initializeList",
            (titles) => {
                this.shownResults = [];
                // eslint-disable-next-line guard-for-in
                for (let i in titles){
                    this.shownResults.push({
                        "title": titles[i],
                        "showSpinner": true,
                        "error" : false
                    });
                }
            },
            this
        );

        registerListener(
            "gotResponse",
            (resp) => {
                //Adding IdRef to each data list inside a record
                if(resp.data.length >0){
                    for(let j = 0 ; j< resp.data.length; j++){
                        resp.data[j]["IDURL"] = "/" + resp.data[j].Id;
                    }
                }

                    for (let i in Object.keys(this.shownResults)) {
                        if (this.shownResults[i].title === resp.title) {
                            resp.showSpinner = false;
                            this.shownResults[i] = resp;
                        }
                    }
                
                
                //console.log('gooot one response : '  );
                //console.log(resp);
            },
            this
        );

        registerListener("gotErrorResponse",
            (err)=>{
                    for (let i in Object.keys(this.shownResults)) {
                        if (this.shownResults[i].title === err.title) {
                            err.showSpinner = false;
                            err.error = true;
                            this.shownResults[i] = err;
                        }
                    }
                
                
            },
            this);
            
    }

    handleViewMore(event){
        var target = event.currentTarget.dataset.object;
        var title = event.currentTarget.dataset.title;
        this.focusOnOneEntry = true;

        //Initialize the shown results by just the element targeted
        this.shownResults = [];
        this.shownResults.push({
            "title": title,
            "showSpinner": true,
            "error" : false
        });
        this.dispatchEvent(new CustomEvent('viewmore', {detail: { target }}));
    }

}