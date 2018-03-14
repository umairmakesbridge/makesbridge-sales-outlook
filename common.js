/*----- Common Module ----*/

var commonModule = (function(){
                         var showLoadingMask = function(paramObj){
                           var loadingHtml = `<div class="loader-mask `+paramObj.extraClass+`">
                                     <div class="spinner">
                                       <div class="bounce1"></div>
                                       <div class="bounce2"></div>
                                       <div class="bounce3"></div>
                                     </div>
                                     <p>`+paramObj.message+`</p>
                                   </div>`;
                           $(paramObj.container).append(loadingHtml);
                         }

                         var hideLoadingMask = function(paramObj){
                           $('.loader-mask').remove();
                         }

                         var extractEmailsFromBody = function(text){
                             //return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
                             return 'fahad';
                         }

                         var encodeHTML= function(str){
                          if (typeof (str) !== "undefined") {
                                      str = str.replace(/:/g, "&#58;");
                                      str = str.replace(/\'/g, "&#39;");
                                      str = str.replace(/=/g, "&#61;");
                                      str = str.replace(/\(/g, "&#40;");
                                      str = str.replace(/\)/g, "&#41;");
                                      str = str.replace(/</g, "&lt;");
                                      str = str.replace(/>/g, "&gt;");
                                      str = str.replace(/\"/g, "&quot;");
                                      str = str.replace(/\‘/g, "&#8216;");
                                      str = str.replace(//g, "");
                                      // str = str.replace(/ /g,'+')
                                  }
                                  else {
                                      str = "";
                                  }
                                  return str;
                         }

                         var decodeHTML= function (str,lineFeed){
                          //decoding HTML entites to show in textfield and text area
                                 if (typeof (str) !== "undefined") {
                                     str = str.replace(/&amp;/g, "&");
                                     str = str.replace(/&#58;/g, ":");
                                     str = str.replace(/&#39;/g, "\'");
                                     str = str.replace(/&#40;/g, "(");
                                     str = str.replace(/&#41;/g, ")");
                                     str = str.replace(/&lt;/g, "<");
                                     str = str.replace(/&gt;/g, ">");
                                     str = str.replace(/&gt;/g, ">");
                                     str = str.replace(/&#9;/g, "\t");
                                     str = str.replace(/&nbsp;/g, " ");
                                     str = str.replace(/&quot;/g, "\"");
                                     str = str.replace(/&#8216;/g, "‘");
                                     str = str.replace(/&#61;/g, "=");
                                     str = str.replace(/%252B/g,' ');
                                     str = str.replace(/\+/g, " ");
                                     if (lineFeed) {
                                         str = str.replace(/&line;/g, "\n");   // NEED TO DISCUSS THIS WITH UMAIR
                                     }
                                 }
                                 else {
                                     str = "";
                                 }
                                 return str;
                        }

                         var getDataRequest = function(url,callBack){
                           $('.debugDiv').html(url)
                           $.ajax({
                                 url:url,
                                 type:"GET",
                                 success: function(data){
                                   try{

                                     if(data[0]!='err'){
                                       //$('.debugDiv').html(JSON.stringify(data))
                                       var result = JSON.parse(data);

                                       callBack(result);
                                     }else{
                                       if(data[1]=='SESSION_EXPIRED'){
                                         // Show Alert and logout
                                           $('.mksicon-logout').trigger('click');
                                         commonModule.ErrorAlert({message:data[1]});
                                       }else{
                                         //Just show Alert message
                                         commonModule.ErrorAlert({message:data.errorDetail});
                                       }
                                     }
                                   }catch(e){
                                     $("#error").html(e.message);
                                   }
                                 }
                               });
                         }

                       var saveData = function(url,data,callBack){
                           $('.debugDiv').html('Creating The ACCount')
                           $.ajax({
                                 url:url,
                                 type:"POST",
                                 data:data,
                                 contentType:"application/x-www-form-urlencoded",
                                 dataType:"json",
                                 success: function(data){
                                   try{
                                     //$('.debugDiv').html(data)
                                     if(data[1]=='SESSION_EXPIRED'){
                                       // Show Alert and logout
                                         $('.mksicon-logout').trigger('click');
                                       commonModule.ErrorAlert({message:data[1]})
                                     }else if(data.errorDetail){
                                       //call alert
                                       commonModule.ErrorAlert({message:data.errorDetail})
                                       commonModule.hideLoadingMask();
                                       return;
                                     }
                                     commonModule.hideLoadingMask();
                                     $('.debugDiv').html('Created The ACCount')
                                     //var jsonResponse = JSON.parse(data);
                                     callBack(data);
                                   }catch(e){
                                     $('.debugDiv').html(e.message);
                                   }

                                 }
                               });
                         }

                         var ErrorAlert = function(props) {
                           if (props.message) {
                                       var inlineStyle = '0px';
                                       var fixed_position = "fixed";
                                       var cl = 'error';
                                       var title = 'Error';
                                       var icon  = 'mksicon-Close';
                                       if (props && props.type == 'caution')
                                       {
                                           cl = 'caution';
                                           title = 'Caution';
                                       }
                                       else if (props && props.type == 'Disabled')
                                       {
                                           cl = 'caution';
                                           title = props.type;
                                       }

                                       var message_box = $('<div class="messagebox messsage_alert messagebox_ ' + cl + '" style=' + inlineStyle + '><span class="alert_icon '+icon+'"></span><h3>' + title + '</h3><p>' + props.message + '</p><a class="alert_close_icon mksicon-Close"></a></div> ');
                                       $('.ms-welcome').append(message_box);
                                       message_box.find(".alert_close_icon").click(function (e) {
                                           message_box.fadeOut("fast", function () {
                                               $(this).remove();
                                           })
                                           e.stopPropagation()
                                       });
                                   }
                         }

                         var SuccessAlert = function(props) {
                           var message_box = $('<div class="global_messages messagebox success"><span class="alert_icon mksicon-Check"></span><h3>Success</h3><p>'+props.message+'</p><a class="alert_close_icon mksicon-Close"></a></div>')
                             $('.ms-welcome').append(message_box);
                             $(".global_messages").hide();
                             $(".global_messages").slideDown("medium", function () {
                                 setTimeout('$(".global_messages").remove()', 4000);
                             });
                             $(".global_messages .alert_close_icon").click(function () {
                                 $(".global_messages").fadeOut("fast", function () {
                                     $(this).remove();
                                 })
                           });
                         }
                         return {
                           showLoadingMask: showLoadingMask,
                           hideLoadingMask: hideLoadingMask,
                           getDataRequest : getDataRequest,
                           saveData : saveData,
                           encodeHTML : encodeHTML,
                           decodeHTML : decodeHTML,
                           ErrorAlert : ErrorAlert,
                           SuccessAlert : SuccessAlert
                         };
                    })();
