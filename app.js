/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

'use strict';

(function () {

  // The initialize function must be run each time a new page is loaded
  Office.initialize = function (reason) {
    $(document).ready(function () {
      $("#run").html("init");
      /*=======Append Emails to Body after grabbing======*/
      function appendArray(uniqueAr){
        var emailsHTML = "";
        $('.debugDiv').html(uniqueAr.toString());

        $.each(uniqueAr,function(key,value){
          emailsHTML += `<div class="contact_found ripple">
                          <div class="cf_silhouette">
                            <div class="cf_silhouette_text c_txt_s"><p>`+value.charAt(0)+`</p>
                            </div>
                        </div>
                        <div class="cf_email_wrap">
                          <div class="cf_email">
                            <p>`+value+`</p>
                          </div>
                        </div>
                        </div>`;
        })
        $(".email_found_in_message .total-count").html(uniqueAr.length);
        $(".emails_lists_from_body").html(emailsHTML);

        $('.emails_lists_from_body .contact_found').on("click",function(event){
         var email = $(this).find('.cf_email p').text();
         attachedEvents.searchEmailInMks(email);
       });

      }
      /*=======End : Append Emails to Body after grabbing======*/
      var _mailbox = Office.context.mailbox;
      var _settings = Office.context.roamingSettings;
       // Obtains the current item.
       $("#error").html("mail box");
       try {
       var item = _mailbox.item;
       var emailsHTML = "";
       var emailCount = 0;
       var allMsgEmails = [];


       emailCount = emailCount + 1;
       allMsgEmails.push(item.sender.emailAddress);
       var toEmail = item.to;
       for (var i=0;i <toEmail.length;i++){
         allMsgEmails.push(toEmail[i].emailAddress);
          /*emailsHTML +=`<div class="contact_found ripple">
                          <div class="cf_silhouette">
                            <div class="cf_silhouette_text c_txt_s"><p>`+toEmail[i].emailAddress.charAt(0)+`</p></div>
                        </div>
                        <div class="cf_email_wrap">
                          <div class="cf_email">
                            <p>`+toEmail[i].emailAddress+`</p>
                          </div>
                        </div>
                      </div>`;*/
          emailCount = emailCount + 1;
       }

       var ccEmail = item.cc;
       for (var i=0;i <ccEmail.length;i++){
         allMsgEmails.push(ccEmail[i].emailAddress);
          /*emailsHTML += `<div class="contact_found ripple">
                          <div class="cf_silhouette">
                            <div class="cf_silhouette_text c_txt_s"><p>`+ccEmail[i].emailAddress.charAt(0)+`</p>
                            </div>
                        </div>
                        <div class="cf_email_wrap">
                          <div class="cf_email">
                            <p>`+ccEmail[i].emailAddress+`</p>
                          </div>
                        </div>`;*/
          emailCount = emailCount + 1;
       }

       item.body.getAsync('text', function (async) {
         // console.log(async.value)
         // var emails = commonModule.extractEmailsFromBody(async.value);
          var emails = '';
          var emailString = async.value.replace(/.com/g, '.com ');
         emails = emailString.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
         //emails = emails[0].split(',');
         $.each(emails,function(key,value) {
            allMsgEmails.push(value);
         });
        //  //emails.push(commonModule.extractEmailsFromBody(async.value));
        //  $('.debugDiv').html(async.value.text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi));

        //var uniqueAllMsgEmails = $.unique();

        var array = allMsgEmails;
        var uniqueAr = [];
          for(var i=0;i < array.length;i++){
            if(uniqueAr.indexOf(array[i]) == -1){
              uniqueAr.push(array[i]);
            }
          }
        appendArray(uniqueAr);

       });








       $("#error").html(item.itemType);

       /*----- Global Object ----*/
       var baseObject = {
            baseUrl   : 'https://test.bridgemailsystem.com/pms',
            users_details    : [],
            gmail_email_list : [],
            subNum : ""
       }
       /*-----------Common Event Attach-------------*/
       var attachedEvents = (function(){
         var attachedSearchMks = function(params){
           $('.mksph_icon_search').click(function(event){
              // $('.YesF').html($('.mksSearchEmail').val())
              if($('.mksSearchEmail').val())
                  searchContact($('.mksSearchEmail').val());
                  $('.mksicon-Close').removeClass('hide');
                  $(this).addClass('hide');
           });
           $('.mksicon-Close').click(function(event){
             $('.mksph_icon_search').removeClass('hide');
             $(this).addClass('hide');
             $('.mksSearchEmail').val('');
             $('.searched_results_wrap').hide();
             $('.searched_results_wrap .search_results_single_value').html('');
           });
           $('.mksSearchEmail').keypress(function(event){
              if(event.which == 13){
                $('.mksicon-Close').removeClass('hide');
                 $('.mksph_icon_search').addClass('hide');
                searchContact(event.currentTarget.value);
              }
           });
         }
         var searchContact = function(value){
           if($('.toggletags').text().toLowerCase()=="tags"){
             var searchUrl = baseObject.baseUrl+'/io/subscriber/getData/?BMS_REQ_TK='
                             + baseObject.users_details[0].bmsToken +'&type=getSAMSubscriberList&offset=0&searchTag='
                             +value+'&orderBy=lastActivityDate&ukey='+baseObject.users_details[0].userKey
                             +'&isMobileLogin=Y&userId='+baseObject.users_details[0].userId;
           }else{
             var searchUrl = baseObject.baseUrl+'/io/subscriber/getData/?BMS_REQ_TK='
                             + baseObject.users_details[0].bmsToken +'&type=getSAMSubscriberList&offset=0&searchValue='
                             +value+'&orderBy=lastActivityDate&ukey='+baseObject.users_details[0].userKey
                             +'&isMobileLogin=Y&userId='+baseObject.users_details[0].userId;
           }
           commonModule.showLoadingMask({message:"Search contact...",container : '.searchBar'});
           $.ajax({
                 url:searchUrl,
                 type:"GET",
                 success: function(data){
                   try{
                     var result = JSON.parse(data)
                     $('.searched_results_wrap .total-count-head .total-count').html(result.totalCount);
                     $('.searched_results_wrap .total-count-head .total-text').html(`Contacts found containing text '`+value+`'`);
                     $('.search_results_single_value').html('');
                     $.each(result.subscriberList[0],function(key,value){

                       $('.search_results_single_value').append(`<div class="contact_found ripple">
                         <div class="cf_silhouette">
                           <div class="cf_silhouette_text c_txt_s">
                             <p>`+value[0].email.charAt(0)+`</p>
                           </div>
                           </div>
                           <div class="cf_email_wrap">
                             <div class="cf_email">
                               <p>`+value[0].email+`</p>
                               <span class="ckvwicon"></span>
                             </div>
                           </div>
                           <div class="clr"></div>
                         </div>`);
                       // console.log(value['subscriber'+(key+1)][0])
                     });
                     commonModule.hideLoadingMask();
                     $('.searched_results_wrap').show();
                   }catch(e){
                     $("#error").html('Search Ajax Wrong');
                   }


                 }
               });
         }
         var switchContactsTags = function(){
           $('.toggletags').on("click",function(){
                $('.toggletags').removeClass('active');
                $(this).addClass('active');
                $('.mksSearchEmail').val('');
                $('.searched_results_wrap').hide();
                $('.searched_results_wrap .search_results_single_value').html('');
           });
         }

         var searchEmailInMks = function(email){

           $('.mks_createContact_ .scf_email p').html(email);
           $('.create_slider .scf_email span').html(email);
           $('.mks_createContact_ .scf_silhouette_text p,.create_slider .scf_silhouette_text p').html(email.charAt(0));

           var searchUrl = baseObject.baseUrl
                           +'/io/subscriber/getData/?BMS_REQ_TK='
                           +  baseObject.users_details[0].bmsToken +'&type=getSAMSubscriberList&offset=0&searchValue='
                           +email+'&orderBy=lastActivityDate&ukey='+baseObject.users_details[0].userKey
                           +'&isMobileLogin=Y&userId='+baseObject.users_details[0].userId;


          commonModule.getDataRequest(searchUrl,SubscriberModule.extractSubscriberDetails);
          //$('.debugDiv').html(responseData.totalCount)
         }
         return {
           attachedSearchMks : attachedSearchMks,
           switchContactsTags : switchContactsTags,
           searchEmailInMks : searchEmailInMks
         };
       })();
       /*----- Subscriber Module ----*/
       var SubscriberModule = (function () {
                          var extractSubscriberDetails = function (resObj) {

                              if(parseInt(resObj.totalCount)==0){
                                $('.mks_wrap_step3,.new_contact_true,.create_new_contact_card').removeClass('hide');
                                $('.mks_wrap_step2').addClass('hide');
                                init()
                              }else{
                                $('.debugDiv').html(resObj.subscriberList[0].subscriber1[0].subNum);
                                $('.mks_wrap_step2').addClass('hide');
                                $('.mks_wrap_step3').removeClass('hide');
                                baseObject['subNum'] = resObj.subscriberList[0].subscriber1[0].subNum;
                                getSubscriberDetails();
                              }
                          };

                          var init = function (text) {
                                // Unbind Events

                                $('.mks_wrap_step3 .createNewBtn,.mks_wrap_step3 .scfe_save_t,.mks_wrap_step3 .mksph_create_contact,.mks_wrap_step3 .cfe_add_customField,.scfe_add_newcf_dom').unbind('click');

                                $('.mks_wrap_step3 .createNewBtn,.mks_wrap_step3 .mksph_create_contact').on('click', function(event){
                                  $('.mks_createContact_').show();
                                  $('.create_slider,.create_new_contact_card').hide();
                                  init();
                                });

                                $('.scfe_close_basic_top_wrap').on('click',function(){
                                  $('.mks_createContact_').hide();
                                  $('.create_slider,.create_new_contact_card').show();
                                });

                                $('.mks_wrap_step3 .scfe_save_wrap .saveNewContact').on('click',function(event){
                                  event.preventDefault();
                                  var searlizeBasicObj = {};
                                  $.each($('.s_contact_found_edit input'),function(key,value){
                                     searlizeBasicObj[$(value).attr('name')] = $(value).val();
                                  });
                                  searlizeBasicObj['email']  = $('.mks_createContact_ .scf_email p').text();
                                  searlizeBasicObj['listNum']  = baseObject.users_details[0].listObj['listNum'];
                                  searlizeBasicObj['isMobileLogin']='Y';
                                  searlizeBasicObj['userId']=baseObject.users_details[0].userId;
                                  // Add custom fields values
                                  if($('.new_cf_added_dom').length > 0){
                                    $.each($('.new_cf_added_dom'),function(key,val){
                                          searlizeBasicObj['frmFld_'+commonModule.encodeHTML($(val).find('.mksph_contact_title').text().trim())] = commonModule.encodeHTML($(val).find('.mksph_contact_value').text())
                                    });
                                  }

                                  var url = baseObject.baseUrl+'/io/subscriber/setData/?BMS_REQ_TK='+baseObject.users_details[0].bmsToken+'&type=addSubscriber';
                                 commonModule.showLoadingMask({message:"Saving contact...",container : '.new_contact_true'});
                                 commonModule.saveData(url,searlizeBasicObj,createNewSubscriber)

                                 $('.debugDiv').html(JSON.stringify(searlizeBasicObj))
                                 event.stopPropagation();

                                });

                                $('.mks_wrap_step3 .cfe_add_customField').on('click',function(event){
                                  event.preventDefault();
                                  $('.debugDiv').html('Add CF');
                                  $('.addBox_wrapper_container_dialog').show();
                                  $('.addBox_wrapper_container_dialog input').removeClass('hasError');
                                  //$('.addBox_wrapper_container_dialog input').val('');
                                  init();
                                  event.stopPropagation();
                                });

                                $('.scfe_add_newcf_dom').on('click',function(event){
                                  $('.debugDiv').html('Save CF to Dom');
                                  if(!$('.addBox_wrapper_container_dialog input.requiredInput').val()){
                                    $('.addBox_wrapper_container_dialog input.requiredInput').addClass('hasError');
                                    return;
                                  }
                                  $('.new_custom_field_wraps').append(`
                                      <div class="new_cf_added_dom">
                                      <span class="mksph_contact_title">
                                      `+$('.addBox_wrapper_container_dialog input#input1').val()+`</span>:

                                      <span class="mksph_contact_value undefined">`+$('.addBox_wrapper_container_dialog input#input2').val()+`</span><i>delete</i></div>
                                    `);
                                    $('.addBox_wrapper_container_dialog').hide();
                                    $('.new_custom_field_wraps i').on('click',function(){
                                      $(this).parents('.new_custom_field_wraps').remove();
                                    });
                                    $('.addBox_wrapper_container_dialog input').val('');
                                    event.stopPropagation();
                                });

                                $('.scfe_close_newcf_dom').on('click',function(event){
                                    $('.addBox_wrapper_container_dialog').hide();
                                    $('.addBox_wrapper_container_dialog input').val('');
                                })
                          };

                          var getSubscriberDetails = function(){


                            var searchUrl = baseObject.baseUrl
                                            +'/io/subscriber/getData/?BMS_REQ_TK='
                                            + baseObject.users_details[0].bmsToken +'&type=getSubscriber&subNum='
                                            +baseObject.subNum+'&ukey='+baseObject.users_details[0].userKey
                                            +'&isMobileLogin=Y&userId='+baseObject.users_details[0].userId;

                              $('.debugDiv').html(searchUrl);
                              commonModule.getDataRequest(searchUrl,generateBasicCustomFields)
                          }
                          var generateBasicCustomFields = function(data){
                            $('.debugDiv').html(data.firstName);
                            $('.new_contact_false').removeClass('hide');
                            if(data.firstName){$('.edit_top_slider_title .scf_email span').eq(0).html(data.firstName)}
                            if(data.lastName){$('.edit_top_slider_title .scf_email span').eq(1).html(data.lastName)}
                            $('.edit_top_slider_title .scf_email span').eq(2).html(data.email)

                            $.each($('.mkb_basicField_wrap .mksph_contact_data'),function(key,val){
                              $(val).find('.mksph_contact_value').html(data[$(val).find('input').attr('name')]);
                              $(val).find('input').val(data[$(val).find('input').attr('name')]);
                            });
                            $('.customFields_ul').html('');
                            $.each(data.cusFldList[0],function(key,value){
                              $('ul.customFields_ul').append(`<li>
                                <div>
                                  <span class="mksph_contact_title">`+Object.keys(value[0])[0]+` </span>:
                                  <span class="mksph_contact_value show">`+value[0][Object.keys(value[0])[0]]+`</span>
                                  <input class="hide" value="`+value[0][Object.keys(value[0])[0]]+`">
                                </div>
                              </li>`);
                            });

                            attachSubscriberEvents()
                          }
                          var saveBasicAdvanceFields = function(){
                            $('.debugDiv').html('Time to update all the fields of basic and adv')
                          }
                          var attachSubscriberEvents = function(){
                              $('.mkb_basicField_wrap .mkb_basic_edit').on('click',function(event){
                                var parentDiv = $(this).parent();
                                $(this).addClass('hide');
                                parentDiv.find('.mkb_basic_cancel').removeClass('hide');
                                parentDiv.find('.mkb_basic_done').removeClass('hide');
                                parentDiv.find('.mksph_contact_data .mksph_contact_value').addClass('hide');
                                parentDiv.find('.mksph_contact_data input').removeClass('hide');
                              });

                              $('.mkb_basicField_wrap .mkb_basic_cancel').on('click',function(event){
                                  var parentDiv = $(this).parent();
                                  $(this).addClass('hide');
                                  parentDiv.find('.mkb_basic_edit').removeClass('hide');
                                  parentDiv.find('.mkb_basic_done').addClass('hide');
                                  parentDiv.find('.mksph_contact_data .mksph_contact_value').removeClass('hide');
                                  parentDiv.find('.mksph_contact_data input').addClass('hide');
                              });

                              $('.mkb_basicField_wrap .mkb_basic_done,.mkb_done').on('click',function(event){
                                saveBasicAdvanceFields();
                              });

                              $('.mkb_cf_edit_btn').on('click',function(event){
                                var parentDiv = $(this).parent();
                                $(this).addClass('hide');
                                parentDiv.find('.addCF').addClass('hide');
                                parentDiv.find('.mkb_cf_cancel_btn').removeClass('hide');
                                parentDiv.find('.mkb_done').removeClass('hide');
                                parentDiv.find('ul.customFields_ul li .mksph_contact_value').addClass('hide');
                                parentDiv.find('ul.customFields_ul li input').removeClass('hide');
                              })
                              $('.mkb_cf_cancel_btn').on('click',function(event){
                                var parentDiv = $(this).parent();
                                $(this).addClass('hide');
                                parentDiv.find('.addCF').removeClass('hide');
                                parentDiv.find('.mkb_cf_edit_btn').removeClass('hide');
                                parentDiv.find('.mkb_done').addClass('hide');
                                parentDiv.find('ul.customFields_ul li .mksph_contact_value').removeClass('hide');
                                parentDiv.find('ul.customFields_ul li input').addClass('hide');
                              })

                          }
                          return {
                            init: init,
                            extractSubscriberDetails : extractSubscriberDetails,
                            getSubscriberDetails   : getSubscriberDetails,
                            generateBasicCustomFields : generateBasicCustomFields
                          };

                        })();
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
                                              }else{
                                                //Just show Alert message
                                              }
                                            }
                                          }catch(e){
                                            $("#error").html(e.message);
                                          }
                                        }
                                      });
                                }

                              var saveData = function(url,data,callBack){

                                  $.ajax({
                                        url:url,
                                        type:"POST",
                                        data:data,
                                        contentType:"application/x-www-form-urlencoded",
                                        dataType:"json",
                                        success: function(data){
                                          try{
                                            $('.debugDiv').html(data)
                                            if(data.errorDetail){
                                              //call alert
                                              commonModule.hideLoadingMask();
                                              return;
                                            }
                                            commonModule.hideLoadingMask();
                                            $('debugDiv').html('Created The ACCount')
                                            //var jsonResponse = JSON.parse(data);
                                            callBack(data);
                                          }catch(e){
                                            $('debugDiv').html(e.message);
                                          }

                                        }
                                      });
                                }
                                return {
                                  showLoadingMask: showLoadingMask,
                                  hideLoadingMask: hideLoadingMask,
                                  getDataRequest : getDataRequest,
                                  saveData : saveData,
                                  encodeHTML : encodeHTML,
                                  decodeHTML : decodeHTML
                                };
                           })();
       /*----- Login Module ----*/
       var LoginModule = (function () {
                          var loginAjaxCall = function (reqObj) {
                            var request = {
                              userId : reqObj.username,
                              password : reqObj.password
                            }

                            $.ajax({
                                  url:reqObj.url+"/mobile/mobileService/mobileLogin",
                                  type:"POST",
                                  data:request,
                                  contentType:"application/x-www-form-urlencoded",
                                  dataType:"json",
                                  success: function(data){
                                    if(data.errorDetail){
                                      //call alert
                                      commonModule.hideLoadingMask();
                                      return;
                                    }
                                    commonModule.hideLoadingMask();
                                    _settings.set("cookie", Date());
                                    $('.login-wrap').hide();
                                    $('.ms-welcome__main').show();
                                    $('.mks_wrap_step2').removeClass('hide');

                                    baseObject.users_details.push(data);
                                    //localStorage.setItem('pmks_userpass', this.state.username+'__'+this.state.password);
                                    attachedEvents.attachedSearchMks();
                                    attachedEvents.switchContactsTags();
                                    checkSubscriberList();
                                  }
                                });

                          };

                          var createNewList = function(){

                            var userDetails = baseObject.users_details[0];
                            var userName    = userDetails.userId.split('@')[0];

                            $.ajax({
                                  url:baseObject.baseUrl+"/io/list/saveListData/",
                                  type:"POST",
                                  data:{
                                            BMS_REQ_TK: userDetails.bmsToken
                                           ,type:'create'
                                           ,listName: 'PROS_'+userName+'_OUTLOOK'
                                           ,ukey:userDetails.userKey
                                           ,isMobileLogin:'Y'
                                           ,userId:userDetails.userId
                                         },
                                  contentType:"application/x-www-form-urlencoded",
                                  dataType:"json",
                                  success: function(data){
                                    if(data.errorDetail){
                                      //call alert
                                      commonModule.hideLoadingMask();
                                      return;
                                    }
                                    commonModule.hideLoadingMask();
                                    var jsonResponse = data;
                                    baseObject.users_details[0]['listObj']={listNum:jsonResponse[1],listChecksum:jsonResponse[2]};

                                  }
                                });
                          }
                          var checkSubscriberList = function(){

                            var userDetails = baseObject.users_details[0];

                            var userName    = userDetails.userId.split('@')[0];

                            var searchUrl   = baseObject.baseUrl
                                              +'/io/list/getListData/?BMS_REQ_TK='
                                              +userDetails.bmsToken
                                              +'&searchText=PROS_'+userName+'_OUTLOOK&type=batches&orderBy=name&order=asc&ukey='
                                              +userDetails.userKey
                                              +'&isMobileLogin=Y&userId='+userDetails.userId
                            $('.debugLoginDiv').html(searchUrl);
                            $.ajax({
                                  url:searchUrl,
                                  type:"GET",
                                  success: function(data){
                                    try{

                                      if(data[0]!='err'){
                                        var jsonResponse = JSON.parse(data);
                                        if(parseInt(jsonResponse.totalCount)==0){

                                          createNewList();
                                          //this.getUserSFStats();
                                      }else{

                                          console.log(jsonResponse.totalCount)
                                          baseObject.users_details[0]['listObj']={
                                                                              listNum:jsonResponse.lists[0].list1[0]['listNumber.encode']
                                                                              ,listChecksum:jsonResponse.lists[0].list1[0]['listNumber.checksum']
                                                                            }
                                          //this.getUserSFStats();

                                      }
                                      }else{
                                        if(data[1]=='SESSION_EXPIRED'){
                                          // Show Alert and logout
                                        }else{
                                          //Just show Alert message
                                        }
                                      }

                                    }catch(e){
                                      $("#error").html(e.message);
                                    }


                                  }
                                });

                          }

                          var init = function (text) {
                            //loginAjaxCall(text);

                            $('#submitForm').click(function(event){

                              var username = $('#username').val();
                              var password = $('#password').val();
                              if(username && password){
                                  commonModule.showLoadingMask({message:"Logging user...",container : '.mksph_login_wrap'});
                                  loginAjaxCall({url:baseObject.baseUrl,username:username,password:password});
                                }

                            });

                            $('#usernae,#password').keypress(function(event){
                              if(event.which==13){
                                commonModule.showLoadingMask({message:"Logging user...",container : '.mksph_login_wrap'});
                                var username = $('#username').val();
                                var password = $('#password').val();
                                if(username && password)
                                  loginAjaxCall({url:baseObject.baseUrl,username:username,password:password});
                              }
                            })
                          };

                          return {
                            init: init
                          };

                        })();
      //console.log(LoginModule);
      LoginModule.init('Hello!');


       }
       catch(e){
         $("#error").html(e);
       }
    });
  };

  function run() {


    /**
     * Insert your Outlook code here
     */

  }

})();
