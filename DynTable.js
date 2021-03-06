/*Copyright 2019 nils pfeifenberger

Dynamic Table v 1.61

change Log:
1.61 load bootstrap vie cdn, optional...
1.60 feature: get filter from JS variable
1.59 feature: update records in a different data relation
1.58 feature: store filter in session storage
1.57 fixed: event handlers where applying to body. now they are restricted to the table item
1.56 fixed: head filter lost translation and pager was not updating after filtering
1.55 add new record hides form-goups when input type="hidden"
1.54 added url params support -> requires urlParams object (x-item is attached to project) and restrict to columns must have column names
1.53 fixed records per page was not reset after filtering
1.53 added init on custom event
1.52 added custom data type support for inline editing (select and checkbox) *no documentatiom yet -> beta
1.51 added short definition for add form params
1.51 added editable list mode without labels
1.50 Fix: width change on input changed to take outer width
1.50 Fix: detach click event on input was not set correcy and reselected the text again
1.49 Fix: added confirmation to dsmx-btn from custom content
1.48 Fix: prevented new record form from opening on enter
1.47 sumRow
1.46 Append table item to callback (NOT CHECKED IN)
1.46 width bugfix fix
1.45 fixed width bug of textarea input for editable content
1.44 fixed editable whitelist
1.43 fixed multiline bug for table mode
1.42 added sticky header support
1.40-41 fixed doubled records after adding one
1.39 auto detection of line breaks disabled
1.38 childs where visible
1.37 oFilter fix (oFilter wurde ignoriert)
1.36 fixed sort and filter pager pager issues
1.35 removed pre style and fixed undefined data-col in dsmx button action
1.34 steps bug fixed
1.33 added selected record and textarea support, fixed filter return bug
1.32 changed add panel location to body
1.30 fix of mixed heads from pager
1.29 dsmx-btn action supports pipe arrays
1.28 CSS change: removed :not[data-col='']
1.27: Select Custom Content Function
  switched to HTML instead of textarea JSON for custom content

1.26: New Record Custom Content with auto-reload by default.
  //"top":"<div class=\"btn-group\" style=\"margin-bottom:20px;\"><button data-params=\"\" class=\"btn btn-default\" data-action=\"add\" data-title=\"new record\" data-width=\"400\" data-btn-caption=\"Create\" data-success=\"addRow\">new record</button></div>"

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function ( $ ) {
  var tableOptions = {};
  var htmlEncode = function(t){
    return $("<div>").text(t).html().split('"').join('&quot;');
  };
  var getColName = function(t){
    // t = '<|colname|>'
    return t.substr(t.indexOf("<|")+2,t.indexOf("|>")-t.indexOf("<|")-2);
  };
  var replCustCont = function(row,t,cIs){
    var deb = 0;
    var jt;
    var joiner;
    while(t.indexOf("<|") !== -1 && deb < 900000000){
      var cname = getColName(t);//t.substr(t.indexOf("<|")+2,t.indexOf("|>")-t.indexOf("<|")-2);
      var rep = "<|"+cname+"|>";
      jt = row[cIs[cname]] || "";
      joiner = htmlEncode(jt);
      t = t.split(rep).join(joiner);
      deb++;
    }
    while(t.indexOf("&lt;|") !== -1 && deb < 900000000){
      var cname = t.substr(t.indexOf("&lt;|")+5,t.indexOf("|&gt;")-t.indexOf("&lt;|")-5);
      var rep = "&lt;|"+cname+"|&gt;";
      jt = row[cIs[cname]] || "";
      joiner = htmlEncode(jt);
      t = t.split(rep).join(joiner);
      deb++;
    }
    return t;
  };
  var mergeSettings = function(el,overrides){
    var settings = methods.getSettings(el) || $.fn.dynTable.settings;
    if(overrides === undefined){
      overrides = {};
    }
    var newSettings = $.extend({},settings, overrides );
    tableOptions[newSettings.tableID] = newSettings;
    return newSettings;
  };
  var createML = function($t,settings,response,s){

    //define trans
    if(settings.trans !== undefined){
      var trans = {};
      for(var t = 0; t < settings.trans.length; t++){
        var trs = settings.trans[t].split(":");
        trans[trs[0]] = trs[1];
      }
      settings.translations = trans;
    }
    //set cols
    settings.columns = settings.cols !== null && settings.cols[0] !== "" ? settings.cols.slice() : response.columns.slice();
    //remove custom Content columns from DR columns request
    for(col in settings.content){
      if(!isNaN(Number(col))){
        settings.columns.splice(col, 0, settings.content[col].col);
      }
    }

    //render Table Head if table mode and not already rendered
    if(settings.mode === "table"){
      var headExists = $t.find("thead").length === 0?false:true;
      if(!headExists){
        var $thr = $("<tr>");
        var $th = $("<thead>");
        for(var c = 0; c < settings.columns.length; c++){
          var hcol = settings.columns[c];
          var sO;
          if(settings.sortCols !== null){
            sO = settings.sortCols.indexOf(settings.columns[c]) === -1 || !settings.showSort ? '' : settings.dec;
          }
          if(s !== undefined && s.name === settings.columns[c]){
            sO = s.dec;
          }else if(s !== undefined){
            sO = "";
          }
          if(settings.content[c] !== undefined){
            hcol = "";
          }
          var hs = "";
          var cname = settings.columns[c];
          if(settings.hideCols.indexOf(cname) !== -1){
            hs = 'style="display:none;"';
          }
          if(trans !== undefined && trans[cname] !== undefined){
            cname = trans[cname];
          }
          $thr.append('<th data-col="'+hcol+'" '+hs+' data-dec="'+sO+'"><span>'+cname+'</span></th>');
        }

        if(settings.sort) $thr.find("th[data-col!='']").append('<div class="sort"></div>');
        if(settings.filter)$thr.find("th[data-col!='']").append('<div class="filter"></div>');
        $th.append($thr);
        $t.append($th);
      }
    }

    //add rows
    var rows = response.rows;
    var $outer = settings.mode === "table" ? $("<tbody>") : $('<ul class="list-group"></ul>');
    var $inner = settings.mode === "table" ? $("<tr>"): $('<li class="list-group-item"></li>');
    methods.addRows($t,settings,rows,$outer,$inner);

    //sum row
    if(settings.sumRow !== undefined){
      var sumRow = [];
      for(var i = 0; i < rows.length; i++){
        var row = rows[i];
        for (var c = 0; c < row.length; c++){
          var v = Number(row[c]);
          if(!isNaN(v)){
            if(sumRow[c] === undefined){
              sumRow[c] = 0;
            }
            sumRow[c]+=v;
          }else{
            sumRow[c] = settings.sumRow[c];
          }
        }
      }
      methods.addRows($t,settings,[sumRow],$outer,$inner.addClass("sumRow active"));
    }

    //add custom top content
    if(settings.content["top"] !== undefined){
      $("[data-from-dyn-table='"+settings.tableID+"']").remove();
      var $topContent = $(settings.content["top"]);
      $topContent.attr('data-from-dyn-table',settings.tableID);
      $t.before($topContent);
    }

    //appending markup
    settings.mode === "table" ? $t.find("thead").after($outer) : $t.append($outer);
    $t.parent().removeClass("loading");

    //init pager
    if(settings.pager)pager($t,settings);

    //init editability
    if(settings.editData === true || settings.editData.length > 0){
      initClick($t,settings);
    }

    //init customs
    initCustomClicks($t,settings);

    //init fixed head with scroll function
    if(settings.sticky){
      fixHeader($t,settings);
    }

    //init sort and filter in header
    if(!headExists && settings.sort)initSort($t,settings);
    if(!headExists && settings.filter)initFilter($t,settings);
  };

  var fixHeader = function($t,settings){
    $tHeadrow = $t.find("thead tr");
    $tHead = $t.find("thead");
    var hSt = $t.position().top;
    $t.find("th, tbody tr:first td").each(function(){
      var styles = {
        "width":$(this).width()+'px',
        display: 'block'
      };
      $(this).find("span").css(styles);
    });
    var stickIt = function(wSt,hSt){
      $tHeadrow.css("top", wSt + 'px');
    };

    //set new stick position while scrolling with timeout
    var timer;
    $(window).scroll(function(){
      var wSt = $(window).scrollTop();
      if(wSt >= hSt){
        stickIt(wSt,hSt);
      }

      if ( timer !== undefined) {clearTimeout(timer)};

      timer = setTimeout(function(){
          if(wSt >= hSt){
        stickIt(wSt,hSt);
            $tHead.css({
              'height':$tHeadrow.height() + 'px',
              display: 'block'
            });
            $tHeadrow.css({
              'position':'absolute',
              top: wSt + 'px',
              'z-index': 99
            });
          }else{
            $tHeadrow.css({
              'position':'relative',
              top: 0,
            });
            $tHead.css({
              display: 'table-header-group'
            });
          }

      }, 50);
    });
  };

  //methods object to provide these functions as plugin someday
  methods = {
    getSettings: function($el){
      return tableOptions[$el.attr("data-item-name")];
    },
    reload: function($el,overrides){
      var options = mergeSettings($el,overrides);
      $el.html("");
      getRecords($el,options);
    },
    addRows: function($el,settings,rows,$outer,$inner){

      var trans = settings.translations;

      var xI = settings.cIs.xmediaID;
      var activeRecord = settings.activeRecord;
      for(var r = 0; r < rows.length; r++){
        var cssClass = r%2 === 0?"even indexrow":"uneven indexrow";
        $inner.html("").removeClass("even uneven");
        $inner.addClass(cssClass);
        for(var cr = 0; cr < settings.columns.length; cr++){
          var rcol = settings.columns[cr];
          var t = rows[r][settings.cIs[rcol]] || "";
          //render custom content
          if(settings.content[cr] !== undefined && !$inner.is(".sumRow")){
            t = settings.content[cr].td;
            t = replCustCont(rows[r],t,settings.cIs);
            if(t.substr(0,8) === "<select "){
              var $ht = $(t);
              if($ht.is("[data-options]")){
                var options = $ht.attr("data-options").split(",");
                var values = $ht.attr("data-values").split(",") || $ht.attr("data-options").split(",");
                for(var o = 0; o < options.length; o++){
                  var $option = $("<option>",{
                    text: options[o],
                    value: values[o]
                  });
                  $ht.append($option);
                }
                t = $ht.prop('outerHTML');
              }
            }
            rcol = "";
          }

          //additional styles
          var ss = '';
          if(settings.tdStyles[cr] !== undefined){
            var w = settings.tdStyles[cr] || "";
            ss += w;
          }
          if(settings.hideCols.indexOf(rcol) !== -1){
            ss += 'display:none;';
          }
          var cellAttr = {
              class: "indexcol",
              "data-col": rcol,
              style: ss,
              html: t,
              id: rcol+r
            };

          //add dataType class
          if(settings.multilineCols.indexOf(rcol) !== -1){
            cellAttr.class = "indexcol multiline"
          }
          if(settings.dataTypes !== undefined && settings.dataTypes[rcol] !== undefined){
            cellAttr.class+=" customDataType";
          }

          if($inner.is("tr")){
            var $cellTd = $("<td>",cellAttr);
            $cellTd.html("").append('<span class="cellContent" data-col="'+rcol+'">'+t+'</span>');
            $inner.append($cellTd);
          }else{
            var $cellDiv = $("<div>",cellAttr);
            $cellDiv.html("");
            if(settings.listLabels){
              var hs = "";
              var cname = settings.columns[cr];
              if(trans !== undefined && trans[cname] !== undefined){
                cname = trans[cname];
              }
              $cellDiv.prepend('<span class="cellLabel">'+cname+'</span>');
            }
            $cellDiv.append('<span class="cellContent" data-col="'+rcol+'">'+t+'</span>');
            $inner.append($cellDiv);
          }
        }//End each column

        $inner.attr("data-xd",rows[r][xI]);
        //active record
        if(rows[r][xI] === activeRecord){
          $inner.addClass("activeRecord");
        }else{
          $inner.removeClass("activeRecord");
        }
        $outer.append($inner.clone());
      }//End each row
    }
  };

  var initSort = function($t,settings){
    $t.find("th[data-col!=''] .sort").click(function(){
      var $sth = $(this).parent();
      var dec = $sth.attr("data-dec") === "true" || $sth.attr("data-dec") === "" ?"false":"true";
      settings.sortCols = [$sth.attr("data-col")];
      settings.dec = dec;
      var rpp = settings.orpp || settings.rpp;
      getRecords($t,settings,rpp,[$sth.attr("data-col")],dec);
      $t.find("[data-dec]").removeAttr("data-dec");
      $sth.attr("data-dec",dec);
    });
  };

  //custom content functions
  var initCustomClicks = function($t,settings){

    var action = function(el){
      var $el = $(el);
      var $tr = $el.closest(".indexrow");
      var xID = $tr.attr("data-xd");

      var conf = !$el.is("[data-confirm]") || confirm($el.attr("data-confirm"));
      //dsmx button
      /*
        Fills input elements with selected values and clicks the button
        it collects all data-col values of selected options and elems with the class indexcol
          <select data-action="dsmx-btn" data-btn-class="className"></select>
      */
      if($el.attr("data-change") === "dsmx-btn" && conf){
        var $btn = $($("input[type='button']." + $el.attr('data-btn-class')+":first, ."+$el.attr('data-btn-class') + " input[type='button']:first")[0]);
        var cols = [];
        var vals = [];
        $el.closest(".indexrow").find("option[data-col!='']:selected,.indexcol[data-col!='']").each(function(){
          if($(this).attr("data-col") !== undefined){
            var elCols = $(this).attr("data-col").split("|");
            var elVals = $(this).attr("data-val") || $(this).val() || $(this).text();
            elVals = elVals.split("|");
            for(var c = 0; c < elCols.length; c++){
              cols.push(elCols[c]);
              vals.push(elVals[c]);
            }
          }
        });
        for(var i = 0; i < cols.length; i++){
          $("input." + cols[i]+", ."+ cols[i]+" input").val(vals[i]);
        }
        $btn.click();
      }

      //add new record
      else if($el.attr("data-action") === "add"){
        var params = {};
        var param = function(set){
          this.attrs = {
              "type": set.type || "text",
              "placeholder":set.placeholder || set.col,
              "id":set.id || set.col,
              "class":set.class || "form-control",
              "name":set.col,
              "data-validation": set["data-validation"],
              "data-dr":set["data-dr"],
              "data-filter":set["data-filter"],
              "value":set.value || ""
            };
          this.options = set.options;
          this.label = {
              "attrs":{
                "text":set.label || set.col,
                "for":set.id || set.col
              }
            };
          if(set.type === "textarea"){
            this.attrs.class = set.class || "form-control inp";
            this.attrs.rows = set.rows || "4";
          }
        };

        if($el.attr("data-params")!==''){
          if($el.attr("data-params").split(":")[0]==="js"){
            var shortParams = eval($el.attr("data-params").split(":")[1]);
            for(var p = 0; p < shortParams.length; p++){
              params[shortParams[p].col] = new param(shortParams[p]);
            }

          }else{
            try{
              params = JSON.parse($el.attr("data-params").replace(/\"/g,'\\\"').replace(/\'/g,'"'));
            }catch(er){
              alert("JSON parse error. Check Console for details");
              console.log(er);
              params = {};
            }
          }

        }else{
          //no params in custom content add elem. add all editable fields
          for(var c = 0; c < settings.columns.length; c++){
            var col = settings.columns[c];
            if(settings.editBlacklist.indexOf(col) === -1 && col !== ""){
              params[col] = new param({col:col});
            }
          }
        }
        //remove old panel if still in DOM
        $('#newLeadPanel'+settings.tableID).remove();
        //create new lead form
        var $panel = $('<div id="newLeadPanel'+settings.tableID+'" class="panel panel-default" style="height: auto;position:absolute;z-index:99;width:'+$el.attr("data-width")+'px;box-shadow: 0px 0px 100vh 100vh rgba(0,0,0,0.6);"></div>');
        var $panelBody = $('<div class="panel-body"></div>');
        var $closebtn = $('<button class="btn btn-danger btn-xs" style="float:right">x</button>');
        if($el.is("[data-title]")){
          $panel.prepend('<div class="panel-heading">'+$el.attr("data-title")+'</div>');
          $panel.find(".panel-heading").append($closebtn);
        }else{
          $panel.prepend($closebtn);
        }
        for(f in params){
          var item = params[f];
          var col = f;
          var $fGroup = $('<div class="form-group"></div>');
          if(item.label !== undefined){
            var $label = $("<label>",item.label.attrs);
            $fGroup.append($label);
          }

          var $i = $("<input>",item.attrs);
          if(item.attrs.type === "select"){
            delete item.attrs.type;
            $i = $("<select>",item.attrs);
            for(var o = 0; o < item.options.length; o++){
              $i.append('<option value="'+item.options[o].value+'">'+item.options[o].text+'</option>');
            }
          }else if(item.attrs.type === "textarea"){
            //textarea
            $i = $("<textarea>",item.attrs);
          }

          if(item.attrs.type==="checkbox" && item.label !== undefined){
            $i.removeClass("form-control");
            $label.prepend($i);
            $fGroup.removeClass("form-group").addClass("checkbox");
          }else{
            $fGroup.append($i);
          }
          if(item.attrs.type==="hidden"){
            $fGroup.css("display","none");
          }
          $panelBody.append($fGroup);
        }
        var $addBtn = $('<button class="btn btn-default" id="newUser'+settings.tableID+'">'+$el.attr("data-btn-caption")+'</button>');
        $panelBody.append($addBtn);
        $panel.append($panelBody);
        $("body").prepend($panel);
        var l = $(window).width() / 2 - $panel.width() / 2 > 0 ? $(window).width() / 2 - $panel.width() / 2 : 0;
        var t = $(window).height() / 2 - $panel.height() / 2 > 0 ? $(window).height() / 2 - $panel.height() / 2 : $(window).scrollTop();
        $panel.css({
          "left": l,
          "top": t
        });
        $(window).scrollTop( t );

        //add Data Relation Options
        var loadDrOptions = function(opts){
          var item = opts.item;
          var $dummyOption = $(item).find("option[value^='<|']").hide();
          dsmxapi.get({
            dr:opts.dr,
            query:{
              "mode" : "data",
              "filter": opts.filter || null,
              "columns": null
            },
            callback: function(data){
              var drOptions = dsmxapi.fromTableToArray(data);
              var vCol = getColName($dummyOption.val());
              var tCol = getColName($dummyOption.text());
              var newOptions = "";
              for(var r = 0; r < drOptions.length; r++){
                //add dr option
                newOptions += '<option value="'+drOptions[r][vCol]+'">'+ drOptions[r][tCol] +'</option>\n';
              }
              $dummyOption.after(newOptions);
            }
          });
        };

        $panel.find("[data-dr]").each(function(){
          loadDrOptions({
              item: this,
              dr: $(this).attr("data-dr"),
              filter: $(this).attr("data-filter")!==undefined?$(this).attr("data-filter").replace(/\</g,"<|").replace(/\>/g,"|>"):null
            });
        });

        //events
        $closebtn.click(function(){
          $panel.remove();
        });

        $addBtn.click(function(ev){
          ev.preventDefault();
          var validations = {
            vfunctions:{
              notempty:function(x){
                if(x === ''){
                  return false;
                }else{
                  return true;
                }
              },
              email:function(mail){
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                  return re.test(mail);
              }
            }
          };
          $panel.find("[data-validation]").each(function(){
              validations[$(this).attr("name")] = $(this).attr("data-validation");
          });
          var nRecord = $('#newLeadPanel'+settings.tableID).find("input,textarea,select").serializeArray();
          //validation
          var isValid = true;
          var $firstNotValid = undefined;
          for(var i = 0; i < nRecord.length; i++){
            if(validations[nRecord[i].name] !== undefined){
              var itemValid = validations.vfunctions[validations[nRecord[i].name]](nRecord[i].value);
              isValid = itemValid === false?false:isValid;
              //add not valid class
              if(!itemValid){
                $panel.find("[name='"+nRecord[i].name+"']").addClass("state-error");
              }
              //set first focus
              if($firstNotValid === undefined && !itemValid){
                $firstNotValid = $("#"+nRecord[i].name);
              }
            }
          }
          if(!isValid){
            alert("Bitte alle Pflichtfelder ausfüllen.");
            $firstNotValid.focus();
            $firstNotValid = undefined;
          }else{
            var nrecTable = dsmxapi.formArrayToTable(nRecord);
            dsmxapi.add({
              table: nrecTable,
              dr: settings.dataRelationName,
              callback: function(r){
                $panel.remove();
                $el.remove();
                methods.reload($t);
                if($el.is("[data-success]")){
                  var f = eval($el.attr("data-success"));
                  f(el,nrecTable,settings.tableID,r);
                }
              }
            });
          }

        });
      }//End add

      //update
      else if($el.attr("data-action") === "update" || $el.attr("data-change") === "update"){
        var cols = $el.attr("data-updatecol").split(",");
        if($el.is("[data-updateval]")){
          var vals = $el.attr("data-updateval").split(",");
        }else{
          var vals = [$el.find("option:selected").val()];
        }

        var updates = [];
        var customUpdates = function(ar){
          var que = ar;
          updateRecord(settings,que[0].xID,que[0].col,que[0].val,que[0].t,function(){
            que.shift();
            if(que.length > 0){
              customUpdates(que);
            }else if($el.is("[data-success]")){
              var f = eval($el.attr("data-success"));
              f(el);
            }
          });
        };
        for(var u = 0; u < cols.length; u++){
          var $td = $tr.find("[data-col='"+cols[u]+"']");
          $td.text(vals[u]);
          updates.push({
            xID: xID,
            col: cols[u],
            val: vals[u],
            t: $td
          });
        }
        if(conf){
          customUpdates(updates);
        }
      }

      //delete
      else if($el.attr("data-action") === "delete"){
        if(conf){
          dsmx.api.dataRelations.delete(settings.dataRelationName, xID, function(res){
            settings.successCallback(res,function(){
              $tr.remove();
              tdIndexes($t,settings);
            },settings.successFail)
          }, settings.failCallback);
        }
      }
      //dr-actions data-action="del" data-ex=\"delete\" data-params=\"dr:contacts,xid:<|xmediaID|>
      //Data relation button action
      else if($el.is("[data-ex]")){
        var dr = $el.attr("data-action");
        var btnA = $el.attr("data-ex");
        var paramsAr = $el.attr("data-params").split(",");
        var params = {};
        for(var p = 0; p < paramsAr.length; p++){
          var ppair = paramsAr[p].split(":");
          params[ppair[0]] = ppair[1];
        }

        if(conf){
          dsmx.api.dataRelations.execute(dr, btnA, params, function(res){
            settings.successCallback(res,function(){
              $tr.remove();
              tdIndexes($t,settings);
            },settings.successFail)
          }, settings.failCallback);
        }
      }
    };
    //data-action="delete" data-action="update" data-updatecol="Firstname" data-updateval"1"
    //"<div class=\"btn-group\" ><button data-params=\"Firstname:text:Vorname,Lastname:text:Nachname,Salutation:select:Anrede:Herr|Mr.;Frau|Mrs.\" class=\"btn btn-default\" data-action=\"add\" data-action=\"add\" data-title=\"New lead\">new lead</button></div>"

    //Register custom handlers
    $t.parent().find("[data-action]").off('click').click(function(ev){
      ev.preventDefault();
      action(this);
    });
    $t.parent().find("[data-change]").change(function(ev){
      ev.preventDefault();
      action(this);
    });

    $t.parent().find("[data-con]").each(function(){
      var con = eval($(this).attr("data-con"));
      if(!con){
        $(this).hide();
      }
    });

    $t.parent().find("[data-each]").each(function(){
      var f = eval($(this).attr("data-each"));
      f(this);
    });
    $t.parent().find("[data-hide],[data-show]").each(function(){
      $(this).click(function(){
        var hs = $(this).attr("data-hide");
        var ss = $(this).attr("data-show");
        $(hs).hide();
        $(ss).show();
      });
    });
    if(settings.callback !== undefined && typeof settings.callback === 'function'){
      settings.callback($t);
    }


  };

  var initFilter = function($t,settings){
    var restoreFilter = function(){
      var filterO = JSON.parse(sessionStorage.getItem("flterO"+settings.tableID));
      for (fCol in filterO){
        if(filterO[fCol] !== ''){
          var colTrans = settings.translations[fCol]||fCol;
          $t.find("th[data-col = '"+fCol+"']").attr("data-filter",filterO[fCol])
          .find("span").text(colTrans + " ~ " + filterO[fCol]);
        }
      }
    };
    if(settings.keepFilter && storageAvailable('sessionStorage')){
      restoreFilter();
    }
    var finpChange = function($inp){
      var t = $inp.val(),
        $td = $inp.parent();
        var col = $td.attr("data-col");
        var colTrans = settings.translations[col]||col;
      $td.find("span").text(colTrans + " ~ " + t);
      var prevFilter = $td.attr("data-filter") === undefined?"":$td.attr("data-filter");
      $td.attr("data-filter",t);
      if(t === ""){
        $td.find("span").text(colTrans);
      }
      $td.attr("data-filter",t);
      $inp.remove();

      var $activeFilters = $t.find("th[data-filter]");
      var thFilterString = "";
      var filterO = {};
      for(var f = 0; f < $activeFilters.length; f++){
        var fcol = $($activeFilters[f]).attr("data-col");
        var fs = $($activeFilters[f]).attr("data-filter");
        //store filter
        filterO[fcol] = fs;

        if(f === 0){
          thFilterString += "(<|" +fcol+"|> Contains '" + fs + "')";
        }else if($activeFilters.length > 1){
          thFilterString = "(" + thFilterString + " And " + "(<|" +fcol+"|> Contains '" + fs + "'))";
        }
      }
      if(settings.oFilter !== undefined){
        settings.query.filter = "("+settings.oFilter+" And " + thFilterString + ")";
      }else if(settings.query.oFilter !== undefined){
        settings.query.filter = "("+settings.query.oFilter+" And " + thFilterString + ")";
      }
      else{
        settings.query.filter = thFilterString;
      }

        if(t !== prevFilter){
          //store filter
          if(settings.keepFilter && storageAvailable('sessionStorage')){
            sessionStorage.setItem("dynFilter"+settings.tableID,settings.query.filter);
            sessionStorage.setItem("flterO"+settings.tableID,JSON.stringify(filterO));
          }

          dsmx.api.dataRelations.count(settings.dataRelationName, settings.query, function(result){
          settings.successCallback(result,function(c){
            settings.all = c;
            var rpp = settings.orpp || settings.rpp;
            settings.page = 1;
            getRecords($t,settings,rpp);
          },settings.successFail);
        }, settings.failCallback);

        }

    };

    var fclick = function($f){
      var ch = $f.closest("th").attr("data-filter");
      $finp = $("<input>",{
        type:"text",
        class:"filter",
        value: ch
        });


      $finp.focusout(function(){
        finpChange($(this));
      });
      $finp.keydown(function(ev){
        var code = ev.keyCode || ev.which;
        if (code == 13 || code == 9) {
          ev.preventDefault();
          finpChange($(this));
        }
      });
      $f.parent().append($finp);
      $finp.focus().select();
    };
    $t.find("th[data-col!=''] .filter").click(function(){
      fclick($(this));
    });
  };

  var tdIndexes = function($t,settings){
    var n = 0;
    var clickfilter = function(that){
      if(settings.editData !== false && settings.editData.length > 0 && settings.editData[0] !== ""){
        return $(that).attr("data-col") !== "" && settings.editBlacklist.indexOf($(that).attr("data-col")) === -1 && (settings.editData.indexOf($(that).attr("data-col")) !== -1 || settings.editData.indexOf($(that).find("span").attr("data-col")) !== -1);
      }else{
        return $(that).attr("data-col") !== "" && settings.editBlacklist.indexOf($(that).attr("data-col")) === -1;
      }
    };
    var $tds = $t.find(".indexcol").filter(function() {
      return clickfilter(this);
    });

    for(var i = 0; i < $tds.length;i++){
      $($tds[i]).attr("data-ix" + settings.tableID,i);
    }
    var $trs = $t.find(".indexrow");


    for(var i = 0; i < $trs.length;i++){

      $($trs[i]).attr("data-rx" + settings.tableID,i);
      var $stds = $($trs[i]).find(".indexcol").filter(function() {
        return clickfilter(this);
        });
      for(var t = 0; t < $stds.length;t++){
        $($stds[t]).attr("data-it" + settings.tableID,t);
      }
    }
    return $tds;
  };

  var initClick = function($t,settings){
    var tdclick = function(ev){
      var $td = $(ev.target);
      if($td.is("td,.indexcol")){
        $td.off("click");
      }else{
        $td.closest("td,.indexcol").off("click");
      }

      if(!$td.is(".cellContent")){
         $td = $td.find(".cellContent");
       }
       if($td.length === 0){
         $td = $(ev.target);
       }

      var inpKey = function(ev,$inp){
        var ix = Number($inp.closest("[data-ix"+settings.tableID+"]").attr("data-ix" + settings.tableID));
        var tdp = Number($inp.closest("[data-it"+settings.tableID+"]").attr("data-it" + settings.tableID));
        var trp = Number($inp.closest("[data-rx"+settings.tableID+"]").attr("data-rx" + settings.tableID))
        var code = Number(ev.keyCode || ev.which);
        var goNext = function(ev){
          ix++;
          var $nx = $("[data-ix"+settings.tableID+"='"+ix+"']");
          if($nx.length > 0){
              ev.preventDefault();
              inpChange($inp);
              $nx.click();
          }
        };
        var goPrev = function(ev){
          ix--;
          var $nx = $("[data-ix"+settings.tableID+"='"+ix+"']");
          if($nx.length > 0){
            ev.preventDefault();
            inpChange($inp);
            $nx.click();
          }
        };
        var goDown = function(ev){
          trp++;
          var $dtd = $(".indexrow[data-rx"+settings.tableID+"='"+trp+"'] .indexcol[data-it"+settings.tableID+"='"+tdp+"']");
          if($dtd.length > 0){
            ev.preventDefault();
            inpChange($inp);
            $dtd.click();
          }
        };
        var goUp = function(ev){
          trp--;
          var $dtd = $(".indexrow[data-rx"+settings.tableID+"='"+trp+"'] .indexcol[data-it"+settings.tableID+"='"+tdp+"']");
          if($dtd.length > 0){
            ev.preventDefault();
            inpChange($inp);
            $dtd.click();
          }
        };

        //returns
        if (code === 9 || code === 13) {
          if(!$inp.is("textarea,select")){
            goNext(ev);
          }
        }else if(code == 38){
          //up
          if(!$inp.is("textarea")){
            goUp(ev);
          }else{
            var pos = $inp.getCursorPosition();
            if(pos <= 0 || $inp.is("[type='checkbox']")){
              goUp(ev);
            }
          }

        }else if (code === 37){
          //left
          if(!$inp.is("select")){
            var pos = $inp.getCursorPosition();
            if(pos <= 0 || $inp.is("[type='checkbox']")){
              goPrev(ev);
            }
          }else{
            goPrev(ev);
          }
        }
        else if (code === 39){
          //right
          if(!$inp.is("select")){
            var tl = $inp.val().length;
            var pos = $inp.getCursorPosition();
            if(tl <= pos || $inp.is("[type='checkbox']")){
              goNext(ev);
            }
          }else{
              goNext(ev);
          }


        }
        else if (code === 40){
          //down
          if(!$inp.is("textarea")){
            goDown(ev);
          }else if($inp.is("textarea")){
            var tl = $inp.val().length;
            var pos = $inp.getCursorPosition();
            if(tl <= pos){
              goDown(ev);
            }
          }
        }

      };

      var inpChange = function($inp){
        var t = $inp.val(),
          v = $inp.attr("data-oldv"),
          xid = $inp.attr("data-xid"),
          $td = $inp.parent();
          if($inp.is("[type='checkbox']")){
            t = $inp.prop("checked").toString();
          }
          var col = $td.attr("data-col");
          $td.text(t);
        $inp.off("change");
        $inp.remove();
        if(!$td.is("td,.indexcol")){
          $td = $td.closest("td,.indexcol");
        }
        $td.click(tdclick);

        if(t !== v){
          updateRecord(settings,xid,col,t,$td);
        }
      };

    /*  settings.me.find(".inp").each(function(){
        inpChange($(this));
      });
      */
      var xid = $td.closest(".indexrow").attr("data-xd"),
        v = $td.text();
        if(!$td.is(".cellContent,.indexcol")){
          v = $td.find(".cellContent").text();
        }
      var $rtd = $td.is("td,.indexcol") ? $td : $td.closest("td,.indexcol");
      var cellWidth = $rtd.outerWidth();
      $rtd.css("width",cellWidth + "px");
      //var iw = "width: " + cellWidth + "px";
      var iw = "width: 100%";

      var inputTag = "<input>";
      var inputAttrs = {
                  type:"text",
                  class:"inp",
                  "data-oldv":v,
                  "data-xid":xid,
                  "style": iw
                  };



      //multiline
      if($td.is(".multiline") || $td.parent().is(".multiline")){
        var inputTag = "<textarea>";
        delete inputAttrs.type;
        //inputAttrs.class = "form-control inp";
        //inputAttrs.rows = "4";
      }

      var $inp = $(inputTag,inputAttrs);

      //customDataType
      if($td.is(".customDataType") || $td.parent().is(".customDataType")){
        var colName = $td.attr("data-col") || $td.parent().attr("data-col");
        if(settings.dataTypes[colName].type === "select"){
          inputTag = "<select>";
        }else if(settings.dataTypes[colName].type === "checkbox"){
          inputAttrs.type="checkbox";
        }else if(settings.dataTypes[colName].type === "textarea"){
          var inputTag = "<textarea>";
        }

        $inp = $(inputTag,inputAttrs);

        //add select options
        if(settings.dataTypes[colName].type === "select"){
          var options = settings.dataTypes[colName].values;
          var oml = "";
          for(var x = 0; x < options.length; x++){
            oml+='<option value="'+ (options[x].value || options[x].text) + '">' + (options[x].text || options[x].value) + '</option>';
          }
          $inp.html(oml);
        }
      }




      $td.text("");
      $inp.val(v);
      if($inp.is("[type='checkbox']")){
        var trues = ["true","1",1,"Yes"];
        if(trues.indexOf(v)!==-1){
          $inp.prop("checked",true);
        }
      }
      $td.append($inp);
      $inp.focus().select();

      if(settings.cursor){
        $inp.keydown(function(ev){
          inpKey(ev,$(this));
        });
      }else{
        $inp.keydown(function(ev){
          var code = ev.keyCode || ev.which;
          if ($inp.is("input") && code == 13 || code == 9) {
            ev.preventDefault();
            $inp.trigger('focusout');
          }
        });
      }


      $inp.focusout(function(){
        if(!settings.disableChange)inpChange($(this));
      });
      if($inp.is("select")){
        $inp.change(function(){
          inpChange($(this));
        });
      }
    };
    var $tds = tdIndexes($t,settings);
    $tds.click(tdclick);
  };

  var pager = function($t,settings){
    //Pager
    if(settings.pager){
      var $pd = $(settings.pagerSelector+" .pageDisplay");
      var $ppSelect = $(settings.pagerSelector + " .pageSize");

      $ppSelect.off("change").change(function(){
        settings.rpp = Number($(this).val());
        settings.page = 1;
        getRecords($t,settings);
      });

      $(settings.pagerSelector+" img").off("click").click(function(){
        var pp = settings.page;
        switch($(this).attr("class")) {
          case "first":
              settings.page = 1;
              break;
          case "prev":
              settings.page = settings.page === 1?1:settings.page-1;
              break;
          case "last":
            settings.page = settings.mpage;
          break;
          default:
            settings.orpp = settings.orpp || settings.rpp;
            settings.page = settings.all <= settings.rpp?1:settings.page+1;
        }
        if(pp !== settings.page){
          getRecords($t,settings);
        }
      });

    }

    //rpp
    if(settings.rpp > settings.all){
      settings.orpp = settings.orpp || settings.rpp;
      settings.rpp = settings.all;
    }
    if(settings.rpp === 0){
        settings.rpp = settings.orpp;
    }

    settings.mpage = settings.all !== 0 ? Math.ceil(settings.all / settings.rpp) : 1;
    //Seite {p} von {mp}, Daten {x} bis {y} von {all}
    var fromR = settings.all !== 0 ? settings.page * settings.rpp - settings.rpp+1 : 0;
    var toR = settings.page * settings.rpp;
    if(settings.page === settings.mpage){
      toR = settings.all;
    }



    var pText = settings.pText.replace(/\{all\}/g,settings.all).replace(/\{p\}/g,settings.page).replace(/\{mp\}/g,settings.mpage).replace(/\{x\}/g,fromR).replace(/\{y\}/g,toR);
    $pd.html(pText);

    //pager Select
    if($ppSelect.find("option").length === 0){
      var stepper = settings.psteps;
      var $option = $("<option>");
      while(stepper < settings.maxPerPage && stepper < settings.all){
        $option.text(stepper);
        $option.attr("value",stepper);
        stepper += settings.psteps;
        $ppSelect.append($option.clone());
      }
      var maxOption = settings.all < settings.maxPerPage ? settings.all : settings.maxPerPage;
      $option.text(maxOption);
      $option.attr("value",maxOption);
      $ppSelect.append($option.clone());
    }

    $ppSelect.find("option[value='"+settings.rpp+"']").prop("selected",true);
  };



  var updateRecord = function(settings,xid,col,val,$td,cb){
    $td.addClass("updating");
    var updateRelation = settings.updateRelation || settings.dataRelationName;
    //The records that should be updatet
    var table = {
      "columns" : ["xmediaID",col],
      "rows" : [
        [xid,val]
      ]
    };


    dsmx.api.dataRelations.update(updateRelation, table, function(result){
      settings.successCallback(result,function(){
        $td.removeClass("updating");
        if(cb !== undefined){
          cb(result);
        }
      },settings.successFail);
    }, function(r){
      if(cb !== undefined){
          cb(r);
      }
      settings.failCallback(r);
    });
  };



  var getCount = function($t,settings){
    dsmx.api.dataRelations.count(settings.dataRelationName, settings.query, function(result){
      settings.successCallback(result,function(c){
        settings.all = c;
        getRecords($t,settings);
      },settings.successFail);
    }, settings.failCallback);
  };


  var getRecords = function($t,settings,rpp,s,dec){
    $t.find("tbody").html('');
    $t.parent().addClass("loading");
    settings.query.currentPage = settings.page;
    settings.query.perPage = rpp || settings.rpp;
    settings.query.orderBy = s || settings.sortCols;
    if(settings.query.orderBy !== null && settings.query.orderBy[0] === ""){
      settings.query.orderBy = null;
    }
    var sObject = s !== undefined ? {name:s[0],dec:dec} : undefined;
    settings.query.descendingSortOrder = dec || settings.dec;
    dsmx.api.dataRelations.get(settings.dataRelationName, settings.query, function(result){
      settings.successCallback(result,function(responseObject){
        //set col indexes
        for(var e = 0; e < responseObject.columns.length; e++){
          settings.cIs[responseObject.columns[e]] = e;
          tableOptions[settings.tableID].cIs[responseObject.columns[e]] = e;
        }
        createML($t,settings,responseObject,sObject);
      },settings.successFail);
      }, settings.failCallback);
  };
  var storageAvailable = function(type) {
    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
  };

    $.fn.dynTable = function( options, overrides ) {
      //Store return object in $t
      var $t = this;
      if(typeof options === 'string'){
        methods[options]($t,overrides);
      }else{
        //define Settings from Defaults and Options
        var settings = mergeSettings($t,options);//$.extend({},$.fn.dynTable.settings, options );
        settings.me = $t;
        //Filter Handling
        //Save original filter for client Filtering
        if (settings.query.filter !== null && settings.query.filter !== ""){
          //unencode html encodings of filter string
          var $temp = $("<div>",{
            html: settings.query.filter
          });
          settings.query.filter = $temp.text();
          $temp = null;
          settings.query.oFilter = settings.query.filter;
          //Variable used in Designer
          if(settings.query.filter.indexOf("noencode_") !== -1){
            settings.query.filter = null;
            $("body").prepend($("<h1>Filter ignored in designer view (variable used)</h1>"));
          }
        }else{
          settings.query.filter = null;
        }
        //get filter from session storage
        if(settings.keepFilter && storageAvailable('sessionStorage') && sessionStorage.getItem("dynFilter"+settings.tableID) !== null && sessionStorage.getItem("dynFilter"+settings.tableID) !== undefined){
          //settings.query.oFilter = settings.query.filter;
          settings.query.filter = sessionStorage.getItem("dynFilter"+settings.tableID)!=="null"?sessionStorage.getItem("dynFilter"+settings.tableID):settings.query.filter;
          //sessionStorage.setItem("dynFilter"+settings.tableID,null);
        }

        //End Filter Handling

        //Check Columns
        if(settings.query.columns !== null && settings.query.columns[0] !== "" && settings.query.columns.indexOf("xmediaID") === -1){
          if(settings.query.mode === "data"){
            settings.query.columns.push("xmediaID");
            settings.hideCols.indexOf("xmediaID") === -1 ? settings.hideCols.push("xmediaID"):"";
          }
        }else if(settings.query.columns[0] === ""){
          settings.query.columns = null;
        }
        //start
        getCount($t,settings);
      }
      //Chaining...
      return $t;
    };

    $.fn.dynTable.settings = {
    // Defaults
      pager: false,
      pText: "Seite {p} von {mp}, Daten {x} bis {y} von {all}",
      pagerSelector: "div.pager",
      dataRelationName: "CampaignDatabase",
      editBlacklist:["LpLogin","xmediaID","DSM_LeadScore","DSM_LeadScoreSync"],
      psteps: 10,
      tableID:"",
      mode: "table",
      listLabels:false,
      trans: undefined,
      editData: true,
      multilineCols:[],
      all:0,
      page: 1,
      cursor: true,
      disableChange: false,
      mpage:0,
      maxPerPage:200,
      rpp: 50,
      query:{
        "mode" : "data",
        "filter": null,
        "columns": null
      },
      content:{},
      cols: null,
      sortCols: null,
      sort: true,
      filter: true,
      hideCols: [],
      showSort: false,
      dec: false,
      tdStyles:[],
      cIs:{},
      callback:undefined,
      failCallback: function() {
          alert('Unable to update records');
      },
      successFail: undefined,
      onInteraction: undefined,
      successCallback: function(result,cb,fcb) {
        if(result.state != 0) {
          if(fcb !== undefined){
            fcb(result);
          }else{
            alert('[' + result.failureDetail + '] ' + result.failureMessage);
          }
        } else {
          if(cb!== undefined){
            cb(result.responseObject);
          }
          if(this.onInteraction !== undefined){
            this.onInteraction();
          }
        }
      },
      sticky: false

  };
  $.fn.getCursorPosition = function() {
        var input = this.get(0);
        if (!input) return; // No (input) element found
        if ('selectionStart' in input) {
            // Standard-compliant browsers
            return input.selectionStart;
        } else if (document.selection) {
            // IE
            input.focus();
            var sel = document.selection.createRange();
            var selLen = document.selection.createRange().text.length;
            sel.moveStart('character', -input.value.length);
            return sel.text.length - selLen;
        }
    };
}( jQuery ));
