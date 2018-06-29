# DynamicTable
DirectSmile Cross Media Extension to view and/or edit Data Relations.

## Install
To install, download the DynamnicTable.zip and import it in DirectSmile Cross Media in the Extension Items browser.

## Dependencies:
- DSMX v 7

- dsmxapi -> https://github.com/nihiels/dsmxapi


It provides a custom content item to add additional content to the table...
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
- data-action<br />
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
    updates the current record via AJAX. Column names and values will be specified like this:
    ```html
      data-updatecol="columns1,column2,..."
      data-updateval="value1,value2,..."
    ```
    or if it's a select field, the function will search for the selected option
