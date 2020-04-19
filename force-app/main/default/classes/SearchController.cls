public class SearchController {

    @AuraEnabled
    public static String executeSearch(String searchInput, String objectAPIName){
        System.debug('hello from ctrl');
        system.debug('searchinput '+ searchInput);
        system.debug('objectAPIName '+ objectAPIName);
        String searchQuery;
        searchQuery = 'FIND \'' + searchInput + '\' IN ALL FIELDS RETURNING ' + objectAPIName;
        if(objectAPIName.equals('Account')){
          searchQuery +='(Id,Name,Type,Phone,BillingCountry) limit 10' ;

        }
        else if(objectAPIName.equals('Contact')){
             searchQuery +='(Id,LastName,Phone,Email) limit 10' ;
        }
        else if(objectAPIName.equals('Opportunity')){
             searchQuery += '(Id,Name,Description,StageName,CloseDate) limit 10' ;
        }
        List<List<sObject>> results = Search.query(searchQuery);
        List<sObject> searchList = results.get(0);
        system.debug('searchList  : ' + searchList);
        return JSON.serialize(searchList);
    }

     @AuraEnabled(cacheable=true)
    public static List<String> getLastSearches(){
        List<String> recentSearches = new List<String>();
        Id currentUserId = UserInfo.getUserId();
        Integer recentSearchesNumber = 3;
        List<SearchAction__c> searchActionsList = [select Id,SearchInput__c from SearchAction__c where ownerId = :currentUserId order by CreatedDate desc limit :recentSearchesNumber];

        for(SearchAction__c eachSearchAction : searchActionsList){
            recentSearches.add(eachSearchAction.SearchInput__c);
        }
        return recentSearches;
    }
    
    @AuraEnabled
    public static Boolean logSearchEntry(String searchInput){
        SearchAction__c searchEntry = new SearchAction__c(SearchInput__c = searchInput);
        Database.SaveResult result = Database.insert(searchEntry, false);
        return result.isSuccess();
    }
    
}