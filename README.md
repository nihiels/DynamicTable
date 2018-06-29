# DynamicTable
DirectSmile Cross Media Extension to view and/or edit Data Relations.

To install, download the DynamnicTable_vXX.zip and import it in DirectSmile Cross Media in the Extension Items browser.

Dependencies:
- DSMX v 7

- dsmxapi -> https://github.com/nihiels/dsmxapi


It provides a custom content item to add additional content to the table.

Custom content features:

<code>
  <div class="customContent">
  	<div data-pos="0" data-label=""><div class="btn-group" ><button data-action="delete" data-confirm="Wirklich löschen?" class="btn btn-danger" >x</button><a heiopei="[[RootURL]][[CampaignName]]@[[PageName]]/[[LpLogin]]?{{dr}}_id=<|xmediaID|>" class="btn btn-default">Auswählen</a></div></div>
  	<div data-pos="top" data-label=""><div class="btn-group" style="margin-bottom:20px;"><button data-params="" class="btn btn-default" data-action="add" data-title="new record" data-width="400" data-btn-caption="Create">new record</button></div></div>
  </div>
</code>
