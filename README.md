# DynamicTable
DirectSmile Cross Media Extension to view and/or edit Data Relations or the primary database (requires admin rights). It loads data via the AJAX DSMX API, supports inline editing, filtering and sorting.

## Install
To install, download the DynamnicTable.zip and import it in DirectSmile Cross Media in the Extension Items browser.

## Dependencies:
- DSMX v 7

- dsmxapi -> https://github.com/nihiels/dsmxapi

## Item Parameters
![Parameter screen shot](dynTableParams.png "DynamicTable Params")

## Custom Content
Custom content features:
The X-Item contains a sub item that describes the custom content with html elements in a div with the id customContent...
```
<div class="customContent">
  <div data-pos="0" data-label="">
    <div class="btn-group" >
      <button data-action="delete" data-confirm="Do you really want to delete this record?" class="btn btn-danger" >
        x
      </button>
      <a heiopei="[[RootURL]][[CampaignName]]@[[PageName]]/[[LpLogin]]?{{dr}}_id=<|xmediaID|>"
        class="btn btn-default">
        select
      </a>
    </div>
  </div>
  <div data-pos="top" data-label="">
    <div class="btn-group" style="margin-bottom:20px;">
      <button data-params="" class="btn btn-default" data-action="add" data-title="new record" data-width="400" data-btn-caption="Create">
        new record
      </button>
    </div>
  </div>
</div>
```
### Costom Content supported attributes:
- data-pos<br />
describes the position of the custom content. If it's a number, the content will be rendered in each row at the index of this number. 0 stands for the first column
- data-action and data-change<br />
First will init a click listener, while the second will init a change listener that can have different actions:
    - add<br />
    opens a new record form according to the data-params JSON string. If data-params is empty, the form will render a text input field for every available column.
    The object of the JSON string should be structured like this:
    ```javascript
    {
      [ColumnName]:{
        "attrs":{
          "type": "text",
          "placeholder":'string',
          "id":ColumnName,
          "class":"form-control",
          "name":ColumnName,
          "data-validation":'notempty'//can be notempty or email so far.
        },
        "label":{
          "attrs":{
            "text":ColumnName,
            "for":ColumnName
          }
        }
      }
    };
    ```
    - update<br />
    updates the current record via AJAX. Column names and values will be specified within the custom content HTML attributes:
    ```html
      <button
        data-updatecol="columns1,column2,..."
        data-updateval="value1,value2,...">
          update
      </button>      
    ```
    or if it's a select field, the function will search for the selected option.
    - delete<br />
      Will delete the current record via AJAX and remove the table row from DOM.
- data-success<br />
    Here you can specify the function name that should be executed after completing the actions of this custom content element. The function will have the custom content element as first parameter and if it was an add action, the added record table object as second and the table ID as third parameter.
- data-confirm<br />
  If this parameter is specified, the action will need a user confirmation. The Question for the confirmation can be defined as parameter value:
  ```html
    <button
      data-confirm="Do you really want to do this?">
        I need confirmation
    </button>      
  ```
- data-con<br />
  This parameter describes the condition on which this custom content element will be displayed or hidden. The script expects an expression in the parameter:
  ```html
    <button
      data-con="'<|datarelationField|>' === '[[PrimaryRecordField]]'">
        I will be displayed when the expression in my data-con param is true
    </button>      
  ```
- data-each<br />
  expects a function name that will be executed for this element or these elements. The funciton will get the element as parameter.
  ```html
    <button
      data-each="myEach">
        I have a function name that will be executed for me.
    </button>      
  ```
  The function could look like this:
  ```javascript
    function myEach(elem){
      $(elem).click(function(){
        console.log("each item has been clicked");
      });
    }      
  ```
- data-hide and data-show<br />
  This parameter is meant to hide and show other DOM elements. It expects a selector as parameter value:
  ```html
    <button
      data-hide=".was-here"
      data-show=".was-not-here">
        Clicking me will hide all DOM elements with the CSS class "was-here" and show all elements with "was-not-here"
    </button>      
  ```
