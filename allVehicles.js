/*
 * all-vehicles-keyvisual component's javascript 
 * 2017.02.03 이경주 ver1.0
 * 2017.02.23 이경주 autoSearchList added
 * 2017.03.24 이경주 ver1.1 noCormercial version line 9 추가. 
 * 2017.03.27 이경주 ver1.2 COMMERCIAL, SPECIAL-CV 카테고리일경우 btnCarMore 에 link 클래스 추가하고 link 걸기
 * 2017.04.04 정훈 Analytics 수정 (M-000007)
 * 2018.03.05 정훈       M-00108 Category Link 기능 수정
 */
$(function(){
	//for No Commercial category display
	var asisUrl = ''; //http://worldwide.hyundai.com/WW/Showroom/Commercial/Commercial/H350/PIP/index.html'; 
	var isAdd = 0;
	var defaultTitle = "All Vehicles";
	
   //current category name checked;
   var arPath = location.pathname.split(".");
   var categoryCode = "";
   var extension = ".html";
   if(!isAuthor){
       extension = "";
       categoryCode = (arPath.length > 1) ? arPath[1].toUpperCase() : "";
   }else{
   	   categoryCode = (arPath.length > 2) ? arPath[1].toUpperCase() : "";
   }

   var getCategoryUrl = "/wsvc/ww/findacar.category.do";
   var getVehiclesUrl = "/wsvc/ww/findacar.vehicles.do";
   var getTrimsUrl    = "/wsvc/ww/findacar.trims.do";
   var getSpecUrl     = "/wsvc/ww/findacar.specs.do";
   var sendDataSearch   = "";
   var autoSearchListCount = 4;
   var txtWord = "";
   
	$(window).resize(function(e){
		e.preventDefault();
		var $lineArea = $(".btnCarMore.on").closest(".lineArea");
		var $moreContent = $(".btnCarMore.on").closest(".item").find(".carMoreContent");
		$lineArea.css({height : 248 + $moreContent.outerHeight()+40});
	});
	
   //filter class 적용
   $("#fl_FuelTypeOptions li").each(function(i){
	   var nCol = (i % 3) + 1;
	   $(this).addClass("w"+nCol);
   });
   getCategory();

   /* get autoSearchList when search key input 
    * enter key : search
    * up key : autosearch popup show */
   $("#searchKey").on("keyup",function(e){
	   if(e.keyCode == 13 && $.trim($(this).val()).length > 0){            	
			$("#btnSearch").trigger("click");
       }else if(e.keyCode == 40 && $(this).closest(".searchWrap").find(".autoSearchList .link").length > 0){
           e.preventDefault();
           $(this).closest(".searchWrap").find(".autoSearchList").show();
           $(this).closest(".searchWrap").find(".autoSearchList .link").eq(0).focus();
       }else if(e.keyCode != 38 && $(this).val().length >= SEARCH_AUTO_COMPLETE_MIN_COUNT){
           fn_search_auto_complete($.trim($(this).val()), ".searchWrap .autoSearchList", SEARCH_AUTO_COMPLETE_VEHICLE_CODE, autoSearchListCount);        
       }else {
           $(this).closest(".searchWrap").find(".autoSearchList").hide();                   
       }
   });
   
   //hideAutoSearchList
   function hideAutoSearchList(){
	   $(".searchArea .autoSearchList").hide();
       $("#searchKey").focus();	   
   }
   //auto search list li's key event function
   $(document).on({
	   	"focus" : function(e){
		            $(".searchArea .autoSearchList").addClass("on");
		            $(this).addClass("on");
	   			},
	   	"blur": function(e){
	   		        $(".searchArea .autoSearchList").removeClass("on");
	   		        $(this).removeClass("on");
	   		    },
        "keydown" : function(e){
   		        if(e.keyCode == 40){
   		            e.preventDefault();
   		            var idx = $(".searchArea .autoSearchList .link.on").parent().index()+1;
   		            if(idx < $(this).parents("ul").find(".link").length){  		                
   		            	$(this).parents("ul").find(".link").eq(idx).focus(); 
   		            }else{
   		            	hideAutoSearchList();
   		            }
   		        }
   		        if(e.keyCode == 38){
   		            e.preventDefault();
   		            var idx = $("searchArea .autoSearchList .link.on").parent().index()-1;
   		            if(idx >= 0){
   		            	$(this).parents("ul").find(".link").eq(idx).focus();
   		            }else{
   		            	hideAutoSearchList();
   		            }
   		        }
   		    },
   		"click" : function(){
   			$("#searchKey").val($(this).text());
   			hideAutoSearchList();
   			$("#btnSearch").trigger("click");   				
   		}
     }, ".autoSearchList .link");
   
   /* popular search words click event */
   $("#AllVehiclesPopularSearchWords .link").on("click", function(e){
       $("#searchKey").val($(this).attr("data-item")).focus();
       $("#btnSearch").trigger("click");
   });
   
   /* search button click function */ 
   $("#btnSearch").on("click", function(e){
	   e.preventDefault();
       txtWord = gfnEscapeScript($("#searchKey").val());
       categoryCode = ""; //search하면 카테고리 초기화
       var pathName = arPath[0] + extension;
       //window.history.pushState(null, null, pathName);
    
       isAdd = (document.title.toLowerCase().indexOf(defaultTitle.toLowerCase())) ? 0 : 1;
       gfnChangeLocation(pathName, "", isAdd);
       //console.log("264. get search result with %s", txtWord);
       sendDataSearch = "searchKey=" + txtWord;
       $("#tiResult").text(Granite.I18n.get("Search results for") + ' "' + txtWord + '"');
       $("#resultWrap").removeClass("hide");
       
       $("#allVehiclesTabArea li").removeClass("on");
       getCategory();
       _satellite.track(all_vehicles_keyvisual_track_name, 'search');
       return true;
   });   
   
   $(document).on("click", ".tabWrap .tabArea a", function(e){
	   
	   if(!$(this).hasClass("newWin")){
	       e.preventDefault();
	       categoryCode = $(this).attr("data-item");
	       var pathName = ""; 
	       var array = ["CAR","SUV","MPV","NLINE","COMMERCIAL"];
	       if(array.indexOf(categoryCode) > -1) {
	    	   $(".vehiclesBanner").hide();
	       }else{
	    	   $(".vehiclesBanner").show();
	       }
	       
	       if(categoryCode){
	       	  pathName = arPath[0] + "." + categoryCode.toLowerCase() + extension;
	       	  
	       }else{
	       	  pathName = arPath[0] + extension;       
	       }
	       
	       if(pathName){	    	   
	    	   isAdd = document.title.toLowerCase().indexOf(defaultTitle.toLowerCase()) ? 0 : 1;	    	    
	    	   gfnChangeLocation(pathName, categoryCode, isAdd);
	           //window.history.pushState(null, null, pathName);
	           if($(this).attr("data-count") > 0) {
	        	   getVehicles();
	           }
	           else{
	        	   fnDrawNoResult("#vehicleList", $.trim($("#searchKey").val()));                	   
	           }
	       }			   
	   
       
	       var $target = $(this).closest(".tabWrap");
	       var idx = $(this).closest(".tab").index();
	       var activeTxt = $(this).text();
	       $target.find(".tabActive span").text(activeTxt);
	       $target.find(".tabArea .tab").removeClass("on").eq(idx).addClass("on");
	       $target.find(".tabArea").removeClass("open");       
	       $target.find(".tabArea .tab a").removeAttr("title");
	       $(this).attr("title","now page");
	   }
   });
  
   $( ".filterItem").each(function(){
       var $target = $(this);
       var $slide = $(this).find(".slider-range");
       var data_min = 0;
       var data_max = 0;
       if($target.hasClass("Seats")){
           data_min = ($target.attr("min")) ? parseInt($target.attr("min")) : 0;
           data_max = ($target.attr("max")) ? parseInt($target.attr("max")) : 0;                 
           $slide.slider({
               range: true,
               min: data_min,
               max: data_max,
               values : [ data_min, data_max], 
               create: function( event, ui ) { 
                    $target.find(".from input").val(data_min);
                    $target.find(".to input").val(data_max);
               },
               slide: function( event, ui ) {                               	   
                   $target.find(".from input").val(ui.values[ 0 ]);
                   $target.find(".to input").val(ui.values[ 1 ]);
               }
           });
       }
       if($target.hasClass("Displacement")){
           data_min = ($target.attr("min")) ? parseInt($target.attr("min")) : 0;
           data_max = ($target.attr("max")) ? parseInt($target.attr("max")) : 0;
           $slide.slider({
               range: true,
               min: data_min,
               max: data_max,                   
               values : [data_min, data_max],
               create: function( event, ui ) {
                   $target.find(".from input").val(data_min);
                   $target.find(".to input").val(data_max);
               },
               slide: function( event, ui ) {
                   $target.find(".from input").val(ui.values[ 0 ]);
                   $target.find(".to input").val(ui.values[ 1 ]);
               }
           });
       }
       if($target.hasClass("Maxpower")){
           data_min = ($target.attr("min")) ? parseInt($target.attr("min")) : 0;
           data_max = ($target.attr("max")) ? parseInt($target.attr("max")) : 0;
           
           $slide.slider({
               range: true,
               min: data_min,
               max: data_max,
               values: [ data_min, data_max], 
               create: function( event, ui ) {
                   $target.find(".from input").val(data_min);
                   $target.find(".to input").val(data_max);
               },
               slide: function( event, ui ) {
                   $target.find(".from input").val(ui.values[ 0 ]);
                   $target.find(".to input").val(ui.values[ 1 ]);
               }
           });
       }
       if($target.hasClass("Fuelconsumption")){
           data_min = ($target.attr("min")) ? parseInt($target.attr("min")) : 0;
           data_max = ($target.attr("max")) ? parseInt($target.attr("max")) : 0;
           
           $slide.slider({
               range: true,
               min: data_min,
               max: data_max,
               values: [ data_min, data_max], 
               create: function( event, ui ) {
                   $target.find(".from input").val(data_min);
                   $target.find(".to input").val(data_max);
               },
               slide: function( event, ui ) {
                   $target.find(".from input").val(ui.values[ 0 ]);
                   $target.find(".to input").val(ui.values[ 1 ]);
               }
           });
       }
       $target.find(".inputNumber").on("change, keyup", function(e) {   
		   if(e.type == "keyup" && e.keyCode == 13 || e.type == "change"){
		   	   var val1 = $target.find(".from input").val();
           	   var val2 = $target.find(".to input").val();
           	   $slide.slider("values", [val1, val2]);
		   }           
       });       
   });

   
   $(document).on("click", "#btnReset", function(){
       $("form").each(function(){
           if(this.id == 'frmVehicles') {
               this.reset();
               $(".slider-range").each(function(){     
            	   var val1 = $(this).parent(".filterItem").attr("min");
            	   var val2 = $(this).parent(".filterItem").attr("max");
            	   $(this).slider("values", [val1, val2]);
                   });
               }
               return false;
           });
           return false;
       });
   
       
    $(document).on("click", "#btnFilterSearch", function(e){
       e.preventDefault();
       //searchKeyword와 filter는 서로 무관함.
       $("#searchKey").val("");
       sendDataSearch = $("#frmVehicles").serialize();  
       if(!$("#resultWrap").hasClass("hide")) $("#resultWrap").addClass("hide");
       categoryCode = "";
       $("#allVehiclesTabArea li").removeClass("on");       
       getCategory();
   });       
   
   $(document).on("click", ".btnCarMore", function(e){
	   if(!$(this).hasClass("link")){ //2017.03.27 added why "COMMERCIAL", "SPECIAL-CV" EXCEPT
	       e.preventDefault();
	       var $lineArea = $(this).closest(".lineArea");
	       var $moreContent = $(this).closest(".item").find(".carMoreContent");
	       if(!$(this).hasClass("on")){
	           $(".btnCarMore").removeClass("on");
	           $(this).addClass("on");
	           $(".carMoreContent").hide();
	           //call getTrims if never got it.
	       	   if($("option", $(this).next(".carMoreContent").find("select")).length < 1) getTrims($(this));
	           $moreContent.show();
	           $(".findacarList .lineArea").css({height : 248});
	           var nHeight = $moreContent.outerHeight() ? $moreContent.outerHeight()+40 : 40;
	           $lineArea.css({height : 248 + nHeight});
	       }else{
	           $(this).removeClass("on");
	           $lineArea.css({height : 248});
	           setTimeout(function(){
	               $moreContent.hide();
	           },200);
	       }
	       var _this = $(this);
	       setTimeout(function(){
	           $("body,html").animate({scrollTop : _this.closest(".item").offset().top},500);  
	       },300);  
	   }
   });
   
	$(document).on("click", ".btnMoreClose", function(e){
		e.preventDefault();
		var $lineArea = $(this).closest(".lineArea");
		var $moreContent = $(this).closest(".item").find(".carMoreContent");
		$(".btnCarMore").removeClass("on");
		$lineArea.css({height : 248});
		setTimeout(function(){
			$moreContent.hide();
		},200)
	});   
   
   //트림 선택시 Overview 내용 변경하기
   $(document).on("change", ".carMoreContent .sortSelect select", function(){
       var modelCode = $(this).attr("data-item");
       //modelCode = "HG-2011";          
       var trimCode  = $(this).val();
       var $target = $(this).closest(".item").find("table.infoTableType td");
       if(modelCode && trimCode){
           var sendData2 = "modelYear=" + modelCode + "&trim=" + trimCode;
           //console.log("291 %s?%s",getSpecUrl, sendData);
           $.ajax({
              type: "POST",
              url: getSpecUrl,
              data : sendData2,
              dataType : 'json',      
              async:false,              
              success: function(resData) {
                  var item = resData.data[0];     
                  if(item){
                      $target.eq(0).text(item.category);
                      $target.eq(1).text(item.productLabel);
                      $target.eq(2).text(item.modelName);
                      $target.eq(3).text(item.seats);
                  }
                  else{
                      $target.eq(0).text("");
                      $target.eq(1).text("");
                      $target.eq(2).text("");
                      $target.eq(3).text("");                        	  
                  }
              }
           });                 
       }//model&trim code가 있는 경우만         
   });  
   
   /*
    * getCategory() 
    */
   function getCategory(){
     var $target   = $("#allVehiclesTabArea");
     var html      = "";
     var nTotCount = 0;

     $.ajax({
        type: "POST",
        url: getCategoryUrl,
        data : sendDataSearch,
        dataType : 'json',      
        async:true,
        beforeSend: function(){
      	  loadingStart();
        },
        complete: function(){
        	loadingEnd();
        },
        success: function(resData) {
           // nTotCount = 0; 
            var items = resData.data;     
            if(items){
                var tabClass = "";
                for(var i=0; i < items.length ; i++){
                    var item = items[i];
                    if(item.useCategoryLink != "Y"){
	                    tabClass = (categoryCode == item.code ) ? " on" : "";
	                    nTotCount += parseInt(item.count);
	                    html += '<li class="tab' + tabClass + '"><h2>' 
	                         + '<a href="'+ arPath[0] + "."+ item.code.toLowerCase() +'" class="link"  data-item="'+ item.code 
	                         + '" data-count="' + item.count 
	                         + '" onClick="_satellite.track(\''+all_vehicles_keyvisual_track_name+'\', \'tab^'+item.code+'\')">' 
	                         + item.displayName + '(' + item.count + ')' 
	                         +'</a></h2></li>\n';                    	
                    }else{
                    	html += '<li class="tab' + tabClass + '"><h2>' 
                		+ '<a href="#" class="link newWin"  data-item="'+ item.code + '" target="' + item.linkTarget + '"' 
                		+ '" onClick="_satellite.track(\''+all_vehicles_keyvisual_track_name+'\', \'tab^'+item.code+'\'); window.open(\''+ item.linkUrl  + '\'); window.location.reload();return false;">'
                		+ item.displayName 
                		+'</a></h2></li>\n';
                    }
                }
                tabClass = (categoryCode) ? "" : " on";            	
                html = '<li class="tab' + tabClass + '">' 
                        + '<h2><a href="' + arPath[0] + '" class="link" data-item=""' 
                        + ' data-count="' + nTotCount + '" onClick="_satellite.track(\''+all_vehicles_keyvisual_track_name+'\', \'tab^All\')">'
                        + Granite.I18n.get("All") + '(' + nTotCount + ')' 
                        +'</a></h2></li>\n'
                        + html;
                
                //Commecial hard coding
                //console.log("399 asisUrl=", asisUrl);                
                if(asisUrl){
                    html += '<li class="tab">'
                  		 + '<h2><a href="'+ asisUrl + '" target="_blank" class="link newWin"'
                        + '" onClick="_satellite.track(\''+all_vehicles_keyvisual_track_name+'\', \'tab^COMMERCIAL\')">' 
                        +'Commercial</a></h2></li>\n';                	
                }
                
                $target.html(html);
                //if(categoryCode == "") categoryCode = items[0].code; //all is not a category... 
                var spanTxt = (categoryCode) ? categoryCode : "All(" + nTotCount + ")";
                $("#btnTab span").text(spanTxt);

                //갯수에 따른 class 변경건    
                if($target.find("li").length != 5) $("#vlTabWrap").removeClass("n5").addClass("n"+$target.find("li").length)

                var trackData =  {};
                trackData.searchTerm = txtWord.replace(/\n/g, " ").replace(/\'/g, "").replace(/\"/g, "");
                trackData.searchResultCount = nTotCount;
                trackData.filter = makeJSON(sendDataSearch);
                if(typeof _satellite.track !== "undefined") {
                    _satellite.track(all_vehicles_keyvisual_track_name, trackData);
                }

                if(nTotCount < 1){
                	fnDrawNoResult("#vehicleList", $.trim($("#searchKey").val()));            	
                }
                else{
                    //get curreunt category's 
                    getVehicles();                        	
                }
            }
            else{ //error case 
                gfnAlert('type4', Granite.I18n.get('Search Message') , Granite.I18n.get('System Error'));
            }
        }
     });
     
     
   }
 
   //카테고리에 따른 Vechicles 정보 가져오기
   function getVehicles(){
  
       var $target = $("#vehicleList");
       var html = ""; 
       var linkCategory = " COMMERCIAL,SPECIAL-CV"; //link Category
       
        //get Data
        $.ajax({
            type: "POST",
            url: getVehiclesUrl,
            data : "category=" + categoryCode.toUpperCase() + "&" +  sendDataSearch,
            dataType : 'json',      
            async:false,
            beforeSend: function(){
            	  loadingStart();
              },
              complete: function(){
              	loadingEnd();
              },            
            success: function(resData) {
                var items = resData.data;
                var item, nClass;
                for(var i=0; i < items.length; i++){
                    item = items[i];
                    nClass = i%4 + 1;
                    if(nClass == 1) html += '  <div class="lineArea">\n';
                    html += '    <div class="item item' + nClass ;
                    if(nClass == 4) html+= ' nomargin';
                    html += '">\n';
                   
                    if(linkCategory.indexOf(item.category) > 0){ //COMMERCIAL, SPECIAL-CV는 LINK 걸기
                    	html += '      <a class="btnCarMore link" href="' 
                    			+ item.pipUrl + '" title="' 
                    			+ item.displayName 
                    			+ '" onClick="_satellite.track(\''
                    			+ all_vehicles_keyvisual_track_name+'\', \''
                    			+ item.displayName.replace(/\n/g, " ").replace(/\'/g, "").replace(/\"/g, "")+'\')">\n'
		                        + '        <div class="thumbnail"><img src="' + item.image2 +'" alt="'+ item.displayName+'"/></div>\n'
		                        + '        <h3 class="subTit4 goTo">'+ item.displayName + '</h3>\n'
		                        + '      </a>\n';
                    }
                    else{
                        html += '      <button class="btnCarMore" data-item="'+ item.modelYear +'" onClick="_satellite.track(\''+all_vehicles_keyvisual_track_name+'\', \''+item.displayName.replace(/\n/g, " ").replace(/\'/g, "").replace(/\"/g, "")+'\')">\n'
	                        + '        <div class="thumbnail"><img src="' + item.image2 +'" alt="'+ item.displayName+'"/></div>\n'
	                        + '        <h3 class="subTit4">'+ item.displayName +'</h3>\n'
	                        + '      </button>\n'
	                        + '      <div class="carMoreContent">\n'
	                        + '        <div class="thumbArea">\n'
	                        + '          <div class="thumbImg"><img src="'+ item.image3 +'" alt="'+ item.image3Caption +'"></div>\n'
	                        + '          <h4 class="subTit2">' + item.overviewTitle + '</h4>\n'
	                        + '          <div class="txt">' + item.overviewDescription + '</div>\n'
	                        + '          <a href="'+ item.pipUrl +'" class="btn" title="' + item.displayName + ' Learn more" onClick="_satellite.track(\''+all_vehicles_keyvisual_track_name+'\', \'Learn more '+item.displayName.replace(/\n/g, " ").replace(/\'/g, "").replace(/\"/g, "")+'\')">Learn more</a>\n'
	                        + '        </div><!-- //thumbArea -->\n'
	                        + '        <div class="tableConArea">\n'
	                        + '           <h5 class="subTit4">Choose a Trim</h5>\n'
	                        + '           <div class="sortSelect">\n'
	                        + '              <select title="Choose a Trim" data-item="'+ item.modelYear +'">\n'
	                        + '              </select>\n'
	                        + '           </div>\n'
	                        + '           <h5 class="subTit4">Overview</h5>\n'
	                        + '           <div class="overViewTableCon">\n'
	                        + '             <div class="overViewTable on">\n'
	                        + '               <table class="infoTableType">\n'
	                        + '                 <caption>Overview Table</caption>\n'
	                        + '                 <tbody>\n'
	                        + '                   <tr>\n'
	                        + '                       <th scope="row">'+Granite.I18n.get("Category")+'</th>\n'
	                        + '                       <td> </td>\n'
	                        + '                   </tr><tr>\n'
	                        + '                       <th scope="row">'+Granite.I18n.get("Product label")+'</th>\n'
	                        + '                       <td> </td>\n'
	                        + '                   </tr><tr>\n'
	                        + '                       <th scope="row">'+Granite.I18n.get("Model name")+'</th>\n'
	                        + '                       <td> </td>\n'
	                        + '                   </tr><tr>\n'
	                        + '                       <th scope="row">'+Granite.I18n.get("Seats")+'</th>\n'
	                        + '                       <td> </td>\n'
	                        + '                   </tr>\n'
	                        + '                   </tbody>\n'
	                        + '               </table>\n'
	                        + '             </div><!-- //overViewTable -->\n'
	                        + '           </div><!-- //overViewTableCon -->\n'
	                        + '        </div><!-- //tableConArea -->\n'
	                        + '        <button class="btnMoreClose"><img src="/etc/designs/hyundai/ww/en/images/findacar/btn_more_close.png" alt="btnMoreClose"></button>\n'
	                     + '      </div><!-- //carMoreContent -->\n';
                               	
                    }
                    html += '    </div><!-- //item -->';
                 if(nClass == 4 || i == items.length-1) html += "  </div><!-- //.lineArea -->\n";
                }
                $target.html(html);
            }
        });                    
   }//getVehicles()
      
    function getTrims($obj){
       var modelCode = $obj.attr("data-item");
       //modelCode = "HG-2011"; //for the test
       if(modelCode){
           var optHtml = "";
           var sendData2 = "modelYear="+modelCode;
           $target = $obj.next(".carMoreContent").find("select");
           $("option", $target).remove();
           //console.log("435 %s?%s",getTrimsUrl,sendData);           
           $.ajax({
               type: "POST",
               url: getTrimsUrl,
               data : sendData2,
               dataType : 'json',      
               async:false,
               success: function(resData) {
                   var items = resData.data;
                   if(items){
                       for(var i=0; i < items.length; i++){
                           var item = items[i];                     
                           $target.append('<option value="' + item.code + '" onClick="_satellite.track(\''+all_vehicles_keyvisual_track_name+'\', \'trim '+item.displayName.replace(/\n/g, " ").replace(/\'/g, "").replace(/\"/g, "")+'\')">' + item.displayName + '</option>');
                       }
                       var trimCode = items[0].code;
                       $target.val(trimCode).trigger('change');
                   }                       
               }
           });                 
         }      
    }    
    
    function makeJSON(strData){
    	if(strData){
    		var arData = $("#frmVehicles").serializeArray();
    		var obj = {};
    		$.each(arData, function(idx, ele){
    			if(ele.name in obj){
    				obj[ele.name] = obj[ele.name] + ", " + ele.value; 
    			}
    			else
    				obj[ele.name] = ele.value;
    		});
    		return  obj;
    	}
    	else
    		return strData;
    }
});    

