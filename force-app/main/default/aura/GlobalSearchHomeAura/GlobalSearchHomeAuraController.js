({
    doInit: function (component, event, helper) {
        //console.log("HEllo aura home ");
        //document.body.setAttribute('style', 'overflow: hidden;');
        //console.log(document);

    },
    handleToggleResultViewEvent: function (component, event) {
        //console.log(event.getParam('tabtitleid') === "analytics");
        component.set("v.showDashboard", event.getParam('tabtitleid') === "analytics");
    },
    handleFilterDashboard: function (component, event) {
        //console.log("handle filter text");
        const filterText = event.getParam('searchText');
        //console.log("filterText : " + filterText);
        const splittedFilterText = filterText.split(' ')[0].trim();
        //console.log("splittedFilterText : " + splittedFilterText);

        const filter = {
            "datasets": {
                "ICR": [{
                    "fields": ["search"],
                    "filter": {
                        "operator": "matches",
                        "values": splittedFilterText.toUpperCase()
                    }
                }]
            }
        };
        component.set("v.dashboardFilter", JSON.stringify(filter));
        var dashboardDeveloperName = component.get("v.developerName");
        console.log("developer name : " + dashboardDeveloperName);
        var evt = $A.get('e.wave:update');
        evt.setParams({
            value: JSON.stringify(filter),
            id: dashboardDeveloperName,
            type: "dashboard"
        });
        evt.fire();
        console.log('event handled successfully!************');
        console.log(filter);
        //$A.get('e.force:refreshView').fire();
    },
    handleViewMore : function(component,event){
        var target = event.getParam("target");
        component.set("v.viewmoretarget",target);
        var searchbar = component.find("searchbar");
        if(searchbar && !$A.util.isEmpty(target)){
            searchbar.handleSingleSearch(target);
        }
    }
})