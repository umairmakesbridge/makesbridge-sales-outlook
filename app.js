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

      var value = Office.context.roamingSettings.get('BMS_REQ_TK');
      $('.debugDivL').html(value);
      if(value){
        $('.ms-welcome__main').show();
        $('.mks_wrap_step2').removeClass('hide');
      }else{
        $('.login-wrap').show();
      }
      // $('.debugDivL').html(document.cookie);
      // Get the current value of the 'myKey' setting

      /*=======Append Emails to Body after grabbing======*/
      function appendArray(uniqueAr){
        var emailsHTML = "";
        $('.debugDiv').html(uniqueAr.toString());

        $.each(uniqueAr,function(key,value){
          emailsHTML += `<div class="contact_found click_pointer ripple">
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

       $('.mksicon-logout').on('click',function(){
         $('.debugDiv').html('Logout Button Press');
         $('.login-wrap').show();
         $('.new_contact_true,.create_new_contact_card').addClass('hide');
         $('.ms-welcome__main').hide();

         // Update the value of the 'myKey' setting
         Office.context.roamingSettings.set('BMS_REQ_TK', '');
         Office.context.roamingSettings.set('userId', '');
         Office.context.roamingSettings.set('userKey', '');
         // Persist the change
         Office.context.roamingSettings.saveAsync();
       });

      }
      /*=======End : Append Emails to Body after grabbing======*/

      var _mailbox = Office.context.mailbox;
      var _settings = Office.context.roamingSettings;

       // Obtains the current item.
       $("#error").html("mail box");
       try {
         // parent.window.style.width = "400px";
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
            baseUrl   : 'https://mks.bridgemailsystem.com/pms',
            users_details    : [],
            gmail_email_list : [],
            subNum : ""
       }
       var value = Office.context.roamingSettings.get('BMS_REQ_TK');
       if(value){
         var userObj = {
           "bmsToken" : Office.context.roamingSettings.get('BMS_REQ_TK'),
           "userKey"  : Office.context.roamingSettings.get('userKey'),
           "userId"  : Office.context.roamingSettings.get('userId')
         }
         baseObject.users_details.push(userObj);
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
           $('.mksicon-logout').unbind('click');
           $('.mksicon-logout').on('click',function(){
             $('.debugDiv').html('Logout Button Press');
             $('.login-wrap').show();
             $('.new_contact_true,.create_new_contact_card').addClass('hide');
             $('.ms-welcome__main').hide();

             // Update the value of the 'myKey' setting
             Office.context.roamingSettings.set('BMS_REQ_TK', '');
             Office.context.roamingSettings.set('userId', '');
             Office.context.roamingSettings.set('userKey', '');
             // Persist the change
             Office.context.roamingSettings.saveAsync();
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

           // var searchedEmail = function(email){
           //   searchEmailInMks
           // }
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

                       $('.search_results_single_value').append(`<div class="contact_found searched_email_mks click_pointer ripple">
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
                     $('.searched_email_mks').on('click',function(event){
                       var email = $(this).find('.cf_email p').text();
                       searchEmailInMks(email);
                     })
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
           commonModule.showLoadingMask({message:"Loading subscriber details..",container : '.mks_wrap_step2'});
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
                                  $('.new_contact_false').addClass('hide');
                                init()
                              }else{
                                $('.debugDiv').html(resObj.subscriberList[0].subscriber1[0].subNum);
                                $('.mks_wrap_step2').addClass('hide');
                                $('.mksph_back').removeClass('hide');
                                $('.mks_wrap_step3').removeClass('hide');
                                baseObject['subNum'] = resObj.subscriberList[0].subscriber1[0].subNum;
                                commonModule.showLoadingMask({message:"Loading subscriber details..",container : '.mks_wrap_step2'});
                                getSubscriberDetails();
                              }
                          };

                          var init = function (text) {
                                // Unbind Events

                                $('.mks_wrap_step3 .createNewBtn,.mks_wrap_step3 .scfe_save_t,.mks_wrap_step3 .mksph_create_contact,.mks_wrap_step3 .cfe_add_customField,.scfe_add_newcf_dom,.mks_expandable_new').unbind('click');

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
                                  $('.debugDiv').html(JSON.stringify(searlizeBasicObj))
                                  var url = baseObject.baseUrl+'/io/subscriber/setData/?BMS_REQ_TK='+baseObject.users_details[0].bmsToken+'&type=addSubscriber';
                                 commonModule.showLoadingMask({message:"Saving contact...",container : '.new_contact_true'});
                                 commonModule.saveData(url,searlizeBasicObj,NewSubscriberCreated);
                                 //$('.debugDiv').html(JSON.stringify(searlizeBasicObj))
                                 //event.stopPropagation();

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
                                });

                                $('.mks_expandable_new').on('click',function(event){
                                  $('.debugDiv').html('Create New  : '+$(this).hasClass('expand'));
                                  if($(this).hasClass('expand')){
                                    $('.new_basic_expand_height').addClass('heighAuto');
                                  }else{
                                    $('.new_basic_expand_height').removeClass('heighAuto');
                                  }
                                  if($(this).hasClass('expand')){
                                    $(this).removeClass('expand');
                                    $(this).addClass('collapse');
                                  }else{
                                    $(this).addClass('expand');
                                    $(this).removeClass('collapse');
                                  }
                                });

                          };

                          var NewSubscriberCreated = function(data){
                            commonModule.SuccessAlert({message :'Subscriber created successfully.'});
                            $('.debugDiv').html('This function will hit after successs'+ data.toString());
                            baseObject.subNum = data[1];
                            $('.new_contact_true,.create_new_contact_card').addClass('hide');
                            $('.new_contact_false').removeClass('hide');
                            getSubscriberDetails();
                          }

                          var getSubscriberDetails = function(){
                            commonModule.showLoadingMask({message:"Loading contact details...",container : '.mkb_basicField_wrap'});
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

                            $('.score-value').html(data.score);
                            $.each($('.mkb_basicField_wrap .mksph_contact_data'),function(key,val){
                              $(val).find('.mksph_contact_value').html(data[$(val).find('input').attr('name')]);
                              $(val).find('input').val(commonModule.decodeHTML(data[$(val).find('input').attr('name')]));
                            });
                            $('.customFields_ul').html('');
                            if(data.cusFldList){
                              $.each(data.cusFldList[0],function(key,value){
                                $('ul.customFields_ul').append(`<li>
                                  <div>
                                    <span class="mksph_contact_title">`+Object.keys(value[0])[0]+` </span>:
                                    <span class="mksph_contact_value show mkb_elipsis">`+value[0][Object.keys(value[0])[0]]+`</span>
                                    <input class="hide" value="`+commonModule.decodeHTML(value[0][Object.keys(value[0])[0]])+`">
                                  </div>
                                </li>`);
                              });
                            }

                            if(data.tags){
                              $('.mks_tag_ul').html('')
                              $('.tags-not-found').hide();
                              $('.tags_content').removeClass('hide');
                              var tags = "";
                              $.each(data.tags.split(','),function(key,val){
                                  tags +=`<li>
                                    <a class="tag">
                                      <span>`+val+`</span>
                                      <i class="icon cross"></i>
                                    </a>
                                  </li>`;
                              });
                              $('.mks_tag_ul').append(tags);
                            }
                            commonModule.hideLoadingMask();
                            attachSubscriberEvents()
                          }
                          var saveBasicAdvanceFields = function(){
                            var searlizeBasicObj = {};
                            $.each($('.mkb_basicField_wrap input'),function(key,value){
                               searlizeBasicObj[$(value).attr('name')] = $(value).val();
                            });
                            searlizeBasicObj['email']  = $('.mks_createContact_ .scf_email p').text();
                            searlizeBasicObj['listNum']  = baseObject.users_details[0].listObj['listNum'];
                            searlizeBasicObj['isMobileLogin']='Y';
                            searlizeBasicObj['userId']=baseObject.users_details[0].userId;
                            searlizeBasicObj['subNum']=baseObject.subNum;
                            // Add custom fields values
                            if($('ul.customFields_ul li').length > 0){
                              $.each($('ul.customFields_ul li'),function(key,val){
                                    searlizeBasicObj['frmFld_'+commonModule.encodeHTML($(val).find('.mksph_contact_title').text().trim())] = commonModule.encodeHTML($(val).find('input').val())
                              });
                            }

                            var url = baseObject.baseUrl+'/io/subscriber/setData/?BMS_REQ_TK='+baseObject.users_details[0].bmsToken+'&type=editProfile';
                            commonModule.saveData(url,searlizeBasicObj,updatedBasicAdvField)
                            $('.debugDiv').html(JSON.stringify(searlizeBasicObj));
                            commonModule.showLoadingMask({message:"Updating contact...",container : '.mkb_basicField_wrap'});
                          }
                          var updatedBasicAdvField = function(data){
                            $('.debugDiv').html('Hit After Updating');
                            $('.mkb_basic_cancel').trigger('click');
                            $('.mkb_cf_cancel_btn').trigger('click');
                            commonModule.SuccessAlert({message :'Subscriber fields updated successfully.'})
                            $('.dialogBox').remove();
                            $('.OverLay').remove();
                            getSubscriberDetails();
                          }
                          var attachSubscriberEvents = function(){
                              $('.mkb_basicField_wrap .mkb_basic_edit').on('click',function(event){
                                var parentDiv = $(this).parent();
                                $(this).addClass('hide');
                                parentDiv.find('.mkb_basic_cancel').removeClass('hide');
                                parentDiv.find('.mkb_basic_done').removeClass('hide');
                                parentDiv.find('.mksph_contact_data .mksph_contact_value').addClass('hide');
                                parentDiv.find('.mksph_contact_data input').removeClass('hide');
                                setTimeout("$('.mkb_basicField_wrap .focusThis').focus()",500);
                                $('.basic_expand').trigger('click');
                              });

                              $('.mkb_basicField_wrap .mkb_basic_cancel').on('click',function(event){
                                  var parentDiv = $(this).parent();
                                  $(this).addClass('hide');
                                  parentDiv.find('.mkb_basic_edit').removeClass('hide');
                                  parentDiv.find('.mkb_basic_done').addClass('hide');
                                  parentDiv.find('.mksph_contact_data .mksph_contact_value').removeClass('hide');
                                  parentDiv.find('.mksph_contact_data input').addClass('hide');
                                  $('.basic_expand').trigger('click');
                              });

                              $('.mkb_basicField_wrap .mkb_basic_done,.mkb_done').on('click',function(event){
                                if($(event.currentTarget).hasClass('mkb_basic_done')){
                                    $('.basic_expand').trigger('click');
                                }
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
                              });
                              $('.edit_top_slider').on('click',function(event){
                                $('.debugDiv').html('Edit Basic Fields ');
                                $('.mkb_basicField_wrap .mkb_basic_edit,.basic_expand').trigger('click');
                              })
                              $('.addCF').unbind('click');
                              $('.addCF').on('click',function(event){
                                var bodyHtml = `<input type="text" name="ckey" value="" id="input1" class="focusThis requiredInput" data-required="required" placeholder="Enter field name *">
                                                <input type="text" name="cvlaue" value="" id="input2" class="" placeholder="Enter Value">`;
                                dialogModule.dialogView({showTitle:'Add Custom Field',childrenView : bodyHtml, additionalClass : '',container : '.customField_ul_wraps',saveCallBack : addNewCF });
                                event.stopPropagation();
                              });
                              $('.mks_expandable').unbind('click');
                              $('.mks_expandable').on('click',function(event){
                                  $('.debugDiv').html('collapse clicked')

                                  /*-- Adding height --*/
                                  if($(this).hasClass('basic_expand')){

                                    if($(this).hasClass('expand')){
                                      $(this).find('span').eq(0).text('Click to collapse')
                                      $('.basic_expand_height').addClass('heighAuto');
                                    }else{
                                        $(this).find('span').eq(0).text('Click to expand')
                                      $('.basic_expand_height').removeClass('heighAuto');
                                    }

                                  }else if($(this).hasClass('cf_expand')){

                                    if($(this).hasClass('expand')){
                                      $(this).find('span').eq(0).text('Click to collapse')
                                      $('.cf_expand_height').addClass('heighAuto');
                                    }else{
                                      $(this).find('span').eq(0).text('Click to expand');
                                        $('.cf_expand_height').removeClass('heighAuto');
                                    }

                                  }

                                  if($(this).hasClass('expand')){
                                    $(this).removeClass('expand');
                                    $(this).addClass('collapse');
                                  }else{
                                    $(this).removeClass('collapse');
                                    $(this).addClass('expand');
                                  }
                              });

                              $('.addTag').on('click',function(event){
                                  $(this).hide();
                                  $('.addTagWrapper').show();
                                  setTimeout("$('.addTagWrapper .focusThis').focus()",500);
                              });
                              $('.tag__input_mks').keypress(function(event){
                                 if(event.which == 13){
                                   $('.addTagWrapper .scfe_save_wrap .scfe_ach').trigger('click');
                                 }
                              });
                              $('.addTagWrapper .scfe_close_wrap').on('click',function(){
                                  $(this).parents('.addTagWrapper').hide();
                                  $('.addTag').show();
                              });

                              $('ul.mks_tag_ul .icon.cross').on('click',function(){

                                var tagName = $(this).parent().find('span').text();

                                deleteTags(tagName);
                              });

                              $('.addTagWrapper .scfe_save_wrap .scfe_ach').on('click',function(){
                                  var url = baseObject.baseUrl+'/io/subscriber/setData/?BMS_REQ_TK='+baseObject.users_details[0].bmsToken;
                                  var addTag = {
                                            type: 'addTag'
                                           ,tags:''
                                           ,subNum: baseObject.subNum
                                           ,tag: commonModule.encodeHTML($('#addTagName').val())
                                           ,ukey:baseObject.users_details[0].userKey
                                           ,isMobileLogin:'Y'
                                           ,userId:baseObject.users_details[0].userId
                                         };
                                      $('.debugDiv').html(JSON.stringify(addTag));
                                    commonModule.showLoadingMask({message:"Adding Tag...",container : '.addTagWrapper'});
                                    commonModule.saveData(url,addTag,generateAddedTag);
                              });

                                $('.mksph_back').on('click',function(event){
                                    $(this).addClass('hide');
                                    $('.mks_wrap_step2').removeClass('hide');
                                    $('.mks_wrap_step3').addClass('hide');
                                });
                          };

                          var addNewCF  = function(){
                              //$('.debugDiv').html($('.dialogBox .addBox_input_wrappers').serialize());

                              if(!$('.dialogBox input.requiredInput').val()){
                                $('.dialogBox input.requiredInput').addClass('hasError');
                                return;
                              }

                              $('ul.customFields_ul').append(`<li class="click_pointer">
                                <div>
                                  <span class="mksph_contact_title">`+$('.dialogBox input#input1').val()+` </span>:
                                  <span class="mksph_contact_value show mkb_elipsis">`+$('.dialogBox input#input2').val()+`</span>
                                  <input class="hide" value="`+$('.dialogBox input#input2').val()+`">
                                </div>
                              </li>`);
                              saveBasicAdvanceFields();

                          }
                          var deleteTags = function(tagName){
                            var url = baseObject.baseUrl+'/io/subscriber/setData/?BMS_REQ_TK='+baseObject.users_details[0].bmsToken

                            var tag = {
                                      type: 'deleteTag'
                                     ,subNum: baseObject.subNum
                                     ,tag: tagName
                                     ,ukey:baseObject.users_details[0].userKey
                                     ,isMobileLogin:'Y'
                                     ,userId:baseObject.users_details[0].userId
                                   }
                                   $('.debugDiv').html(tagName);
                                   commonModule.showLoadingMask({message:"Deleting tag "+tagName+"...",container : '#Tags'});
                                   commonModule.saveData(url,tag,deletedTag)
                          }
                          var deletedTag = function(data){
                              $('.debugDiv').html('Tag Deleted');
                              commonModule.SuccessAlert({message :'Tag deleted successfully.'})
                              getSubscriberDetails()
                          };

                          var generateAddedTag = function(data){
                              $('.debugDiv').html('At Generated Tag');
                              commonModule.SuccessAlert({message :'Tag created successfully.'})
                            var dataA = `<li>
                              <a class="tag">
                                <span>`+commonModule.decodeHTML($('#addTagName').val())+`</span>
                                <i class="icon cross"></i>
                              </a>
                            </li>`;
                            $('.addTagWrapper').hide();
                            $('.mks_tag_ul').parent().removeClass('hide');
                            $('.mks_tag_ul').append(dataA);

                            $('.addTagWrapper input').val('');
                            // Reattach delete event for new tag
                            $('ul.mks_tag_ul .icon.cross').unbind('click');
                            $('ul.mks_tag_ul .icon.cross').on('click',function(){

                              var tagName = $(this).parent().find('span').text();

                              deleteTags(tagName);
                            });
                          }

                          return {
                            init: init,
                            extractSubscriberDetails : extractSubscriberDetails,
                            getSubscriberDetails   : getSubscriberDetails,
                            generateBasicCustomFields : generateBasicCustomFields
                          };

                        })();

       /*----- Dialog Module ----*/
       var dialogModule = (function(){

                            var init = function(reqObj){
                              var callBackEvent = reqObj.saveCallBack;
                              $('.dialogBox_close_btn').on('click',function(){
                                  handleCancel();
                              })
                              $('.dialogBox_save_btn').on('click',function(){
                                  $('.dialogBox').hide();
                                  handleSave(callBackEvent);
                              });
                              $('.dialogBox input').keypress(function(event){
                                if(event.which==13){
                                  if($('.dialogBox input.requiredInput').val()){
                                    handleSave(callBackEvent)
                                  }else{
                                    $('.requiredInput').addClass('hasError')
                                  }
                                }
                              });
                            setTimeout("$('.dialogBox .focusThis').focus()",500);
                            }

                            var dialogView = function(reqObj){
                              var dialogHtml = `<div class="dialogBox addBox_wrapper_container scfe_field `+reqObj.additionalClass+`">

                                <h2>`+reqObj.showTitle+`</h2>
                                <div class="addBox_input_wrappers">
                                  `+reqObj.childrenView+`
                                  <div class="scfe_control_option">
                                      <div class="scfe_close_wrap dialogBox_close_btn">
                                          <a class="scfe_c_ach" href="#">
                                              <div class="scfe_close_t">
                                                  <span>Close</span>
                                              </div>
                                              <div class="scfe_close_i_md">
                                                  <div class="scfe_close_i" aria-hidden="true" data-icon="&#xe915;"></div>
                                              </div>
                                          </a>
                                      </div>
                                      <div class="scfe_save_wrap dialogBox_save_btn disable_">
                                          <a class="scfe_ach" href="#">
                                              <div class="scfe_save_t">
                                                  <span>Save</span>
                                              </div>
                                              <div class="scfe_save_i_md">
                                                  <div class="scfe_save_i" aria-hidden="true" data-icon="&#xe905;"></div>
                                              </div>
                                          </a>
                                      </div>
                                      <div class="clr"></div>
                                    </div>
                                </div>


                              </div>
                              <div class="OverLay" style="height: `+$('.ms-welcome').height()+`px;"></div>
                              `;

                              $(reqObj.container).append(dialogHtml);
                              init(reqObj);
                            }
                            var handleCancel = function(reqObj){

                              $('.dialogBox').remove();
                              $('.OverLay').remove();
                              $('.debugDiv').html('Dialog Cancel has been click' + event.currentTarget);
                            }

                            var handleSave = function(callback){
                              callback();
                            }
                             return {
                               init : init,
                               dialogView : dialogView
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
                                      commonModule.ErrorAlert({message:data.errorDetail})
                                      return;
                                    }

                                    // Update the value of the 'myKey' setting
                                    Office.context.roamingSettings.set('BMS_REQ_TK', data.bmsToken);
                                    Office.context.roamingSettings.set('userId', data.userId);
                                    Office.context.roamingSettings.set('userKey', data.userKey);
                                    // Persist the change
                                    Office.context.roamingSettings.saveAsync();

                                    $('.login-wrap').hide();
                                    $('.ms-welcome__main').show();
                                    $('.mks_wrap_step2').removeClass('hide');
                                    //document.cookie = "username=John Doe";


                                    commonModule.hideLoadingMask();
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
                                      commonModule.ErrorAlert({message:data.errorDetail})
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
                                          $('.mksicon-logout').trigger('click');
                                          commonModule.ErrorAlert({message:data[1]})
                                        }else{
                                          //Just show Alert message
                                          commonModule.ErrorAlert({message:data[1]})
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
                            });


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
