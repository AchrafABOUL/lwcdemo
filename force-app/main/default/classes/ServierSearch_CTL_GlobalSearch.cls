/**
* @author: Achraf ABOUL (aaboul@salesforce.com)
* @date: 19/09/2019
* @description: This class contains controller methods for the custom advanced global search
*/
public class ServierSearch_CTL_GlobalSearch {

/*
    @AuraEnabled
    public static Boolean logSearchEntry(String searchInput){
        SearchAction__c searchEntry = new SearchAction__c(SearchInput__c = searchInput);
        Database.SaveResult result = Database.insert(searchEntry, false);
        return result.isSuccess();
    }
    @AuraEnabled
    public static String searchExternalObject(String searchInput, String objectAPIName, String developerName,Boolean viewMore){
        System.debug('objectAPIName : ' + objectAPIName);
        Globalsearchobjects__mdt globalSearchMetadata =  [SELECT ResultsNumber__c, FieldsDisplay__c,WebsitePrefix__c,SearchInChildren__c 
                                                          FROM globalsearchobjects__mdt 
                                                          WHERE ObjectAPIName__c = :objectAPIName].get(0);
        System.debug('globalSearchMetadata from global search : ******' + globalSearchMetadata);
        String fields = globalSearchMetadata.FieldsDisplay__c;
        system.debug(fields);
        //The key is the label of the field and the value is the APIName of the field
        Map<String, List<String>> objectFieldsMap = new Map<String, List<String>>();
        List<String> splitArray = new List<String>();
        //For solving the problem of url labels taking other fields value in datatable
        List<String> extraFieldsData = new List<String>();
        
        //Splitting the FieldsDisplay__c containing mapping info
        for(String eachFieldEntry : fields.split('\n')){
            eachFieldEntry = eachFieldEntry.trim();
            splitArray = eachFieldEntry.split(':');
            //We will use it later to store labels and types and mapping
            List<String> labelAndType = new List<String>();
            //if(!splitArray.get(0).toUpperCase().equals('IDURL')){
            //Constructing a list of info about the columns for the object datatable : 
            // we will let index
            //at index 0 : The label to show
            //at index 1 : The type of the field
            //at index 2 : The the field value to show insteed of the url (if it is url)
            labelAndType.add(splitArray.get(1).trim());
            if(splitArray.size()>2){
                labelAndType.add(splitArray.get(2).trim());
            }
            if(splitArray.size()>3){
                labelAndType.add(splitArray.get(3).trim());
                extraFieldsData.add(splitArray.get(3).trim());
            }
            // splitArray.get(0) contains the field API name
            objectFieldsMap.put(splitArray.get(0).trim(), labelAndType);
            System.debug('Label and Type ' + labelAndType);
        }
        
        Integer numberOfResults = (Integer) globalSearchMetadata.ResultsNumber__c;
        Integer exceedNumberOfResults = numberOfResults + 1;
        //TODO offset for search
        //handle simple load view more
        if(viewMore){
            numberOfResults = 50;
            exceedNumberOfResults = 50;
        }
        
        //Construct the query using the wanted fields and extra fields
        String searchQuery;
        
        //Get list of fields to retrieve
        Map<String,String> mapForSoql = new Map<String,String>();
        String primaryObjectFields = '';
        for(String eachFieldAPIName : objectFieldsMap.keySet()){
            if(!eachFieldAPIName.equalsIgnoreCase('IDURL')){
                primaryObjectFields = primaryObjectFields + eachFieldAPIName + ',';
            }
        }
        for(String eachExtraField : extraFieldsData){
            if(!objectFieldsMap.keySet().contains(eachExtraField)){
                primaryObjectFields = primaryObjectFields + eachExtraField +',';
            }
        }
        primaryObjectFields = primaryObjectFields.left(primaryObjectFields.length()-1);
        
        //If children : search in all children then do SOQL to retrieve record values based on Ids
        if(String.isNotBlank(globalSearchMetadata.SearchInChildren__c)){
            mapForSoql.put(objectAPIName,'Id');
            searchQuery = 'FIND \'' + searchInput + '\' IN ALL FIELDS RETURNING ' + objectAPIName + '(Id),';
            List<String> entries = new List<String>();
            for(String eachFieldEntry : globalSearchMetadata.SearchInChildren__c.split('\n')){
                eachFieldEntry = eachFieldEntry.trim();
                entries = eachFieldEntry.split(':');
                searchQuery = searchQuery + entries[0] + '(' + entries[1] + '),';
                mapForSoql.put(entries[0],entries[1]);
            }
            searchQuery = searchQuery.left(searchQuery.length()-1);
        }
        else{
            //Construct the query using the wanted fields and extra fields
            searchQuery = 'FIND \'' + searchInput + '\' IN ALL FIELDS RETURNING '+objectAPIName+'(';
            searchQuery = searchQuery + primaryObjectFields;
            //We will query on an exceeded number of results to provide the information if there is more results 
            //than what was requested (the '+' sign)
            searchQuery = searchQuery + ') ';
        }
        
        searchQuery = searchQuery + ' limit ' + exceedNumberOfResults;
        System.debug(searchQuery);
        List<List<sObject>> results = Search.query(searchQuery);
        System.debug(results);
        List<sObject> searchList = new  List<sObject>();
        
        if(String.isNotBlank(globalSearchMetadata.SearchInChildren__c)){
            String soqlQuery = 'SELECT ' + primaryObjectFields + ' FROM ' + objectAPIName +' WHERE Id IN (';
            Boolean hasResults = false;
            for(List<sObject> rs :results){
                for(sObject o :rs){
                    soqlQuery = soqlQuery + '\'' + o.get(mapForSoql.get(o.getSObjectType().getDescribe().name)) + '\',';
                    hasResults = true;
                }
            }
            if(hasResults){
                soqlQuery = soqlQuery.left(soqlQuery.length()-1);
                soqlQuery = soqlQuery + ')';
                System.debug('soqlQuery: ' + soqlQuery);
                searchList = Database.query(soqlQuery);
            }
        }
        else{
            //just get first result
            searchList = results.get(0);
        }
        
        String resultsNumberString = '';
        Boolean showViewMore= false;
        
        if(searchList.size() > numberOfResults) {
            //We give back the string to show in results number badge
            resultsNumberString = resultsNumberString + numberOfResults + '+';
            //Recover the results with the number we requested initially
            searchList.remove(searchList.size()-1);
            showViewMore = true;
        }
        else{
            resultsNumberString = resultsNumberString + searchList.size();
        }
        System.debug(searchList);
        WRP_GlobalSearchResult globalSearchResult = new WRP_GlobalSearchResult(objectAPIName, developerName, resultsNumberString, searchList, objectFieldsMap,globalSearchMetadata.WebsitePrefix__c,showViewMore);
        System.debug('globalSearchResult : ' + globalSearchResult);
        return JSON.serialize(globalSearchResult);
    }
    
    //To get all the api names mapped to developer name of external objects which are target of search
    @AuraEnabled(cacheable=true)
    public static List<globalsearchobjects__mdt> getAllAPINamesForSearch(){
        return [SELECT ObjectAPIName__c,developername,SelectedByDefault__c,Label 
                FROM globalsearchobjects__mdt 
                WHERE Active__c = True Order By developername 
                LIMIT 2000];
    }
    
    @AuraEnabled(cacheable=true)
    public static List<String> getLastSearches(){
        List<String> recentSearches = new List<String>();
        Id currentUserId = UserInfo.getUserId();
        system.debug('currentUserId  ' +currentUserId);
        System.debug('globalsearchsettings : ****** ' + GlobalSearchSettings__c.getInstance());
        Integer recentSearchesNumber = (Integer) GlobalSearchSettings__c.getInstance().RecentSearchesNumber__c;
        System.debug('recentSearchesNumber  ' + recentSearchesNumber);
        List<SearchAction__c> searchActionsList = [select Id,SearchInput__c from SearchAction__c where ownerId = :currentUserId order by CreatedDate desc limit :recentSearchesNumber];
        
        for(SearchAction__c eachSearchAction : searchActionsList){
            recentSearches.add(eachSearchAction.SearchInput__c);
        }
        system.debug('recentSearches  ' + recentSearches);
        return recentSearches;
    }
    */
}