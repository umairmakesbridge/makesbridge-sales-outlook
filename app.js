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

      /*var value = Office.context.roamingSettings.get('BMS_REQ_TK');
      $('.debugDivL').html(value);
      if(value){
        $('.ms-welcome__main').show();
        $('.mks_wrap_step2').removeClass('hide');
      }else{*/
        //$('.login-wrap').show();
      //}

      // $('.debugDivL').html(document.cookie);
      // Get the current value of the 'myKey' setting

      /*=======Append Emails to Body after grabbing======*/
      function appendArray(uniqueAr){
        var emailsHTML = "";
        $('.debugDiv').html(uniqueAr.toString());

        $.each(uniqueAr,function(key,value){
          emailsHTML += '<div class="contact_found click_pointer ripple" title="'+value+'">';
          emailsHTML += '<div class="cf_silhouette"><div class="cf_silhouette_text c_txt_s"><p>'+value.charAt(0)+'</p></div>';
         emailsHTML  += '</div>';
         emailsHTML  += '<div class="cf_email_wrap">';
         emailsHTML  += '<div class="cf_email">';
         emailsHTML  += '<p>'+value+'</p>';
          emailsHTML  += '</div>';
          emailsHTML  += '</div>';
         emailsHTML  += '</div>';
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
         /*Office.context.roamingSettings.set('BMS_REQ_TK', '');
         Office.context.roamingSettings.set('userId', '');
         Office.context.roamingSettings.set('userKey', '');
         // Persist the change
         Office.context.roamingSettings.saveAsync();*/
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
          emailCount = emailCount + 1;
       }

       var ccEmail = item.cc;
       for (var i=0;i <ccEmail.length;i++){
         allMsgEmails.push(ccEmail[i].emailAddress);
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
                                    /*Office.context.roamingSettings.set('BMS_REQ_TK', data.bmsToken);
                                    Office.context.roamingSettings.set('userId', data.userId);
                                    Office.context.roamingSettings.set('userKey', data.userKey);
                                    // Persist the change
                                    Office.context.roamingSettings.saveAsync();*/
                                    //commonModule.setCookie("BMS_REQ_TK", data.bmsToken, 30);
                                    $('.login-wrap').hide();
                                    $('.ms-welcome__main').show();
                                    $('.mks_wrap_step2').removeClass('hide');
                                    // document.cookie = "username="+data.userId;
                                    // document.cookie = "password="+data.password;
                                    $.cookie('userId',data.userId, { expires: 365 });
                                    $.cookie('password',data.password, { expires: 365 });

                                    commonModule.hideLoadingMask();
                                    baseObject.users_details.splice(0,1);
                                    baseObject.users_details.push(data);
                                    getUserSFStats();
                                    //localStorage.setItem('pmks_userpass', this.state.username+'__'+this.state.password);
                                    attachedEvents.attachedSearchMks();
                                    attachedEvents.switchContactsTags();
                                    tasksModule.toggleTasks();
                                    tasksModule.selectPriorityTask();
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
                            $('.debugDivC').html('subscriber list')
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
                                          getClickerVisitors();
                                          //this.getUserSFStats();
                                      }else{

                                          console.log(jsonResponse.totalCount)
                                          baseObject.users_details[0]['listObj']={
                                                                              listNum:jsonResponse.lists[0].list1[0]['listNumber.encode']
                                                                              ,listChecksum:jsonResponse.lists[0].list1[0]['listNumber.checksum']
                                                                            }
                                           getClickerVisitors();
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
                          var getUserSFStats =  function(){
                            var userDetails = baseObject.users_details[0];
                            var searchUrl = baseObject.baseUrl
                                            +'/io/salesforce/getData/?BMS_REQ_TK='
                                            + userDetails.bmsToken +'&type=status&ukey='+userDetails.userKey
                                            +'&isMobileLogin=Y&userId='+userDetails.userId;
                            
                            commonModule.getDataRequest(searchUrl,function(data){
                              baseObject['isSalesforceUser'] = data.isSalesforceUser;
                            });

                          }
                          var getClickerVisitors =  function(){
                          //https://test.bridgemailsystem.com/pms/io/subscriber/getData/?
                          //BMS_REQ_TK=e1plTH3CifVtWdJkWeu6NnQ0xT3LYe&type=getSAMSubscriberStats&ukey=25YIXbbb&isMobileLogin=Y&userId=umair
                          //
                          var url = baseObject.baseUrl+"/io/subscriber/getData/?BMS_REQ_TK="
                          +baseObject.users_details[0].bmsToken
                          +'&type=getSAMSubscriberStats&ukey='
                          +baseObject.users_details[0].userKey
                          +'&isMobileLogin=Y&userId='+baseObject.users_details[0].userId;
                          $('.debugDiv').html('get visitors & clickers');
                          commonModule.getDataRequest(url,generateVisitorsClickers);

                        }
                        var generateVisitorsClickers = function(data){
                              //$('.debugDiv').html('clicks : ' + data.clickCount);
                              //$('.debugDiv').html('visits : ' + data.visitCount);
                              $('.clickers span').text(data.clickCount);
                              $('.visitors span').text(data.visitCount);

                              $('.last24 li').on('click',function(event){
                                $('.last24 li').removeClass('active');
                                $(this).addClass('active');
                                if($(this).hasClass('clickers')){
                                  $('.debugDiv').html('Clickers need to be called');
                                  //https://mks.bridgemailsystem.com/pms
                                  // /io/subscriber/getData/?BMS_REQ_TK=VumjeXzS5vATnYv4AoJWFzXabDUejf&
                                  //type=getSAMSubscriberList&offset=0&filterBy=WV&lastXDays=1&ukey=ccaY49Wc&isMobileLogin=Y&userId=jayadams
                                  $('.visitors_wraps').addClass('hide');
                                  $('.clicker_wraps').removeClass('hide');
                                  var url = baseObject.baseUrl+"/io/subscriber/getData/?BMS_REQ_TK="
                                  +baseObject.users_details[0].bmsToken
                                  +'&type=getSAMSubscriberList&offset=0&filterBy=CK&lastXDays=1&ukey='
                                  +baseObject.users_details[0].userKey
                                  +'&isMobileLogin=Y&userId='+baseObject.users_details[0].userId;

                                  commonModule.getDataRequest(url,generateEmailsOfCK);
                                }else{
                                  $('.debugDiv').html('Visitors need to be called');
                                  $('.clicker_wraps').addClass('hide');
                                  $('.visitors_wraps').removeClass('hide');
                                  var url = baseObject.baseUrl+"/io/subscriber/getData/?BMS_REQ_TK="
                                  +baseObject.users_details[0].bmsToken
                                  +'&type=getSAMSubscriberList&offset=0&filterBy=WV&lastXDays=1&ukey='
                                  +baseObject.users_details[0].userKey
                                  +'&isMobileLogin=Y&userId='+baseObject.users_details[0].userId;

                                  commonModule.getDataRequest(url,generateEmailsOfWV);
                                }
                              })

                          }
                          var generateEmailsOfWV = function(data){
                            var wvEmails = "";
                            jQuery.each(data.subscriberList[0],function(key,val){
                                //console.log(val[0]);
                                $('.debugDiv').html(val[0].email);
                                    wvEmails += '<div class="contact_found searched_email_mks click_pointer ripple">';
                                    wvEmails +='<div class="cf_silhouette">'
                                    wvEmails +=  '<div class="cf_silhouette_text c_txt_s">'
                                    wvEmails +=   '<p>'+val[0].email.charAt(0)+'</p>';
                                    wvEmails += '</div>';
                                    wvEmails += '</div>';
                                    wvEmails += '<div class="cf_email_wrap">'
                                    wvEmails += '<div class="cf_email">'
                                    wvEmails += '<p>'+val[0].email+'</p>'
                                    wvEmails += '<span class="ckvwicon">'
                                    wvEmails += '<span class="mksicon-act_pageview" ck=""></span>'
                                    wvEmails += 'Web Visit - 6 hrs ago';
                                    wvEmails += '</span>';
                                    wvEmails += '</div>'
                                    wvEmails += '</div>'
                                    wvEmails += '<div class="clr"></div>'
                                    wvEmails += '</div>'
                                  $('.visitors_wraps').append(wvEmails);
                            });
                            $('.visitors_wraps .contact_found').on("click",function(event){
                             var email = $(this).find('.cf_email p').text();
                             attachedEvents.searchEmailInMks(email);
                           });
                          }
                          var generateEmailsOfCK = function(data){
                            $('.clicker_wraps').html('');
                            var ckEmails = "";
                            jQuery.each(data.subscriberList[0],function(key,val){
                                //console.log(val[0]);
                                $('.debugDiv').html(val[0].email);
                                  ckEmails += '<div class="contact_found searched_email_mks click_pointer ripple">';
                                  ckEmails += '<div class="cf_silhouette">'
                                   ckEmails += '<div class="cf_silhouette_text c_txt_s">'
                                   ckEmails +=  '<p>'+val[0].email.charAt(0)+'</p>'
                                   ckEmails +=    '</div>'
                                    ckEmails +=   '</div>'
                                    ckEmails +=   '<div class="cf_email_wrap">'
                                    ckEmails +=     '<div class="cf_email">'
                                    ckEmails +=      '<p>'+val[0].email+'</p>'
                                    ckEmails +=       '<span class="ckvwicon">'
                                    ckEmails +=         '<span class="mksicon-act_click" ck=""></span>'
                                    ckEmails +=         'Email Click - 6 hrs ago'
                                    ckEmails +=      '</span>'
                                    ckEmails +=     '</div>';
                                     ckEmails += '</div>'
                                    ckEmails +=  '<div class="clr"></div>'
                                    ckEmails += '</div>';
                                  $('.clicker_wraps').append(ckEmails);
                            });

                            //$('.visitors_wraps').addClass('hide');
                            $('.clicker_wraps .contact_found').on("click",function(event){
                             var email = $(this).find('.cf_email p').text();
                             attachedEvents.searchEmailInMks(email);
                           });

                          }
                          var init = function (text) {
                            //loginAjaxCall(text);
                            if($.cookie('userId') && $.cookie('password')){
                              $('.autoLoading').show();
                              var username = $.cookie('userId');
                              var password = $.cookie('password');
                              setTimeout(function(){
                                commonModule.showLoadingMask({message:"Loading user...",container : '.autoLoading'});
                                loginAjaxCall({url:baseObject.baseUrl,username:username,password:password});
                              },500);
                              
                            }else{
                              $('.login-wrap').show();
                            }
                            
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
                            init: init,
                            checkSubscriberList : checkSubscriberList
                          };

                        })();
      //console.log(LoginModule);
      LoginModule.init('Hello!');
      /*----- Dialog Module ----*/
       var dialogModule = (function(){

                            var init = function(reqObj){
                              var callBackEvent = reqObj.saveCallBack;
                              $('.dialogBox_close_btn').on('click',function(){
                                  handleCancel();
                              })
                              $('.dialogBox_save_btn').on('click',function(){
                                  
                                  handleSave(callBackEvent);
                              });
                              $('.dialogBox input').keypress(function(event){
                                if(event.which==13){
                                  if($('.dialogBox input.requiredInput').val()){
                                    $('.dialogBox,.OverLay').hide();
                                    handleSave(callBackEvent)
                                  }else{
                                    $('.requiredInput').addClass('hasError')
                                  }
                                }
                              });
                            setTimeout("$('.dialogBox .focusThis').focus()",500);

                              if(reqObj.initCallBack){
                                reqObj.initCallBack();
                              }
                            }

                            var dialogView = function(reqObj){
                              var dialogHtml = "";
                              var btn = (reqObj.buttonText) ? reqObj.buttonText : "Save";
                                dialogHtml += '<div class="dialogBox addBox_wrapper_container scfe_field '+reqObj.additionalClass+'">'

                               dialogHtml += '<h2>'+reqObj.showTitle+'</h2>'
                                dialogHtml +='<div class="addBox_input_wrappers"><div class="addBox_body">'+reqObj.childrenView+'</div>';
                                 dialogHtml += '<div class="scfe_control_option">'
                                 dialogHtml +=   '<div class="scfe_close_wrap dialogBox_close_btn">'
                                 dialogHtml +=    '<a class="scfe_c_ach" href="#">'
                                 dialogHtml +=     '<div class="scfe_close_t">'
                                 dialogHtml +=      '<span>Close</span>'
                                 dialogHtml +=       '</div>';
                                 dialogHtml +=       '<div class="scfe_close_i_md">'
                                 dialogHtml +=       '<div class="scfe_close_i" aria-hidden="true" data-icon="&#xe915;"></div>'
                                 dialogHtml +=        '</div>'
                                 dialogHtml +=         '</a>'
                                 dialogHtml +=     '</div>'
                                 dialogHtml +=     '<div class="scfe_save_wrap dialogBox_save_btn disable_">'
                                 dialogHtml +=         '<a class="scfe_ach" href="#">'
                                 dialogHtml +=            ' <div class="scfe_save_t">'
                                 dialogHtml +=              '<span>'+btn+'</span>'
                                 dialogHtml +=            '</div>'
                                 dialogHtml +=            '<div class="scfe_save_i_md">'
                                 dialogHtml +=                 '<div class="scfe_save_i" aria-hidden="true" data-icon="&#xe905;"></div>'                                              
                                 dialogHtml +='</div>'
                                 dialogHtml +=         '</a>'
                                 dialogHtml +=    '</div>'
                                 dialogHtml +=     '<div class="clr"></div>'
                                 dialogHtml +=  '</div>'
                                dialogHtml +='</div>'

                                dialogHtml +='</div>'
                              dialogHtml +='<div class="OverLay" style="height: '+$('.ms-welcome').height()+'px;"></div>';

                              $(reqObj.container).append(dialogHtml);
                              init(reqObj);
                            }
                            var handleCancel = function(reqObj){

                              $('.dialogBox').remove();
                              $('.OverLay').remove();
                              //$('.debugDiv').html('Dialog Cancel has been click' + event.currentTarget);
                            }

                            var handleSave = function(callback){
                              callback();
                            }
                            var hideDialog = function(){
                              handleCancel();
                              //$('.dialogBox,.OverLay').hide();
                            }
                             return {
                               init : init,
                               dialogView : dialogView,
                               hideDialog : hideDialog
                             };
                          })();
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
           
           $('.show_tasks_list').on('click',function(){
             $('.toggleTask').removeClass('active');
             $('.toggleTask.today').addClass('active');
              tasksModule.getTasksDashBoard();
              $('.tasks_wrapper_dashboard').removeClass('hide');
              $('.mks_task_lists_dash_wrapper .not-found.task-loading-nof').remove()
              $('.tasks_wrapper_dashboard .mks_task_lists_dash_wrapper .content-wrapper').before('<p class="not-found task-loading-nof">Loading tasks...</p>')
           });
           //Create New Contact form Dashboard
           $('.add_new_btn').on('click',function(){
             $('.mks_add_new_contact_wrap').parent().show();
             setTimeout("$('.mks_add_new_contact_wrap .focusThis').focus()",500);
           });

           $('.mks_add_new_contact_wrap .scfe_close_wrap').on('click',function(){
            $('.mks_add_new_contact_wrap').parent().hide();
            $('#cemail,#cfname,#clname').val('')
           });
           $('.mks_add_new_contact_wrap .scfe_save_wrap').on('click',function(){
             contactModule.createNewContact();
           })

           $('.mksicon-logout').unbind('click');
           $('.mksicon-logout').on('click',function(){
            $('.mksph_back').trigger('click');
            $('.mksicon-Close').trigger('click');
            $('ul.last24 li span.badge').text('0');
             $('.debugDiv').html('Logout Button Press');
             $('.login-wrap').show();
             $('.new_contact_true,.create_new_contact_card').addClass('hide');
             $('.ms-welcome__main').hide();
             
             $.removeCookie('userId');
             $.removeCookie('password');
             // Update the value of the 'myKey' setting
             /*Office.context.roamingSettings.set('BMS_REQ_TK', '');
             Office.context.roamingSettings.set('userId', '');
             Office.context.roamingSettings.set('userKey', '');
             // Persist the change
             Office.context.roamingSettings.saveAsync();*/
           });
         }

         var searchContact = function(value){
           if($('.toggletags.active').text().toLowerCase().trim()=="tags"){
             var searchUrl = baseObject.baseUrl+'/io/subscriber/getData/?BMS_REQ_TK='
                             + baseObject.users_details[0].bmsToken +'&type=getSAMSubscriberList&offset=0&searchTag='
                             +value+'&orderBy=lastActivityDate&ukey='+baseObject.users_details[0].userKey
                             +'&isMobileLogin=Y&userId='+baseObject.users_details[0].userId;
           }else{
             var searchUrl = baseObject.baseUrl+'/io/subscriber/getData/?BMS_REQ_TK='
                             + baseObject.users_details[0].bmsToken +'&type=getSAMSubscriberList&offset=0&searchValue='
                             +value+'&orderBy=lastActivityDate&ukey='+baseObject.users_details[0].userKey
                             +'&isMobileLogin=Y&isShareSearch='+$('.selectSharedContact').val()+'&userId='+baseObject.users_details[0].userId;
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
                     var result = JSON.parse(data);
                     if(parseInt(result.totalCount)==0){
                      commonModule.hideLoadingMask();
                      $('.searched_results_wrap .total-count-head').hide();
                      $('.searched_results_wrap').show();
                      $('.search_results_single_value .searched_email_mks').remove();
                      $('.search_results_single_value').append('<p>No contact found.</p>');
                      return false;
                     }
                     $('.searched_results_wrap .total-count-head').show();
                     $('.searched_results_wrap .total-count-head .total-count').html(result.totalCount);
                     $('.searched_results_wrap .total-count-head .total-text').html('Contacts found containing text '+value);
                     $('.search_results_single_value').html('');
                     var searchResultLi = "";
                     $.each(result.subscriberList[0],function(key,value){
                      searchResultLi+= '<div class="contact_found searched_email_mks click_pointer ripple">'
                      searchResultLi+=  '<div class="cf_silhouette">'
                      searchResultLi+=   '<div class="cf_silhouette_text c_txt_s">'
                      searchResultLi+=      '<p>'+value[0].email.charAt(0)+'</p>'
                      searchResultLi+=     '</div>'
                      searchResultLi+=     '</div>'
                      searchResultLi+=     '<div class="cf_email_wrap">'
                      searchResultLi+=      '<div class="cf_email">'
                      searchResultLi+=       '<p>'+value[0].email+'</p>'
                      searchResultLi+=        '<span class="ckvwicon"></span>'
                       searchResultLi+=      '</div>'
                      searchResultLi+=     '</div>'
                      searchResultLi+=     '<div class="clr"></div>'
                       searchResultLi+=  '</div>'
                      
                       // console.log(value['subscriber'+(key+1)][0])
                     });
                      $('.search_results_single_value').append(searchResultLi);
                     commonModule.hideLoadingMask();
                     $('.searched_results_wrap').show();
                     $('.searched_email_mks').on('click',function(event){
                       var email = $(this).find('.cf_email p').text();
                       $('.tasks_wrapper_dashboard').addClass('hide');
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

         var searchEmailInMks = function(email,isShared){
           commonModule.showLoadingMask({message:"Loading subscriber details..",container : '.mks_wrap_step2'});
           $('.mks_createContact_ .scf_email p').html(email);
           $('.create_slider .scf_email span').html(email);
           $('.mks_createContact_ .scf_silhouette_text p,.create_slider .scf_silhouette_text p').html(email.charAt(0));
           var searchUrl = '';
           if(isShared && isShared=="Y"){
            searchUrl = baseObject.baseUrl
            +'/io/subscriber/getData/?BMS_REQ_TK='
            +  baseObject.users_details[0].bmsToken +'&type=getSAMSubscriberList&offset=0&searchValue='
            +email+'&orderBy=lastActivityDate&ukey='+baseObject.users_details[0].userKey
            +'&isMobileLogin=Y&userId='+baseObject.users_details[0].userId+'&isShareSearch='+isShared;

           }else{
            searchUrl = baseObject.baseUrl
                           +'/io/subscriber/getData/?BMS_REQ_TK='
                           +  baseObject.users_details[0].bmsToken +'&type=getSAMSubscriberList&offset=0&searchValue='
                           +email+'&orderBy=lastActivityDate&ukey='+baseObject.users_details[0].userKey
                           +'&isMobileLogin=Y&userId='+baseObject.users_details[0].userId+'&isShareSearch='+$('.selectSharedContact').val();

           }
           

          commonModule.getDataRequest(searchUrl,SubscriberModule.extractSubscriberDetails);
          //$('.debugDiv').html(responseData.totalCount)
         }
         return {
           attachedSearchMks : attachedSearchMks,
           switchContactsTags : switchContactsTags,
           searchEmailInMks : searchEmailInMks
         };
       })();
        /*----- contact new Module ----*/
        var contactModule = (function(){
          var createNewContact = function(){
            var isvalid = true;
            if($('#cemail').val()==""){
              $('#cemail').addClass('hasError');
              isvalid=false;
            }else{
              $('#cemail').removeClass('hasError');
            }
            if(isvalid){
              
              var reqObj = {};
              reqObj['email']= $('#cemail').val();
              reqObj['ukey']=baseObject.users_details[0].userKey
              reqObj['firstName']=commonModule.encodeHTML( $('#cfirstname').val());
              reqObj['lastName'] = commonModule.encodeHTML($('#clastname').val());
              reqObj['company'] = ""
              reqObj['telephone'] =""
              reqObj['city']= ""
              reqObj['state']= ""
              reqObj['address1']= ""
              reqObj['jobStatus']= ""
              reqObj['salesRep']= ""
              reqObj['salesStatus']= ""
              reqObj['birthDate']= ""
              reqObj['areaCode']= ""
              reqObj['country']= ""
              reqObj['zip']= ""
              reqObj['address2']= ""
              reqObj['industry']= ""
              reqObj['source']= ""
              reqObj['occupation']= ""
              reqObj['listNum']  =baseObject.users_details[0].listObj['listNum']
              reqObj['isMobileLogin']='Y'
              reqObj['userId']=baseObject.users_details[0].userId;
             var url = baseObject.baseUrl+'/io/subscriber/setData/?BMS_REQ_TK='+baseObject.users_details[0].bmsToken+'&type=addSubscriber';
              commonModule.showLoadingMask({message : 'Creating new contact...', container: '.mks_add_new_contact_wrap'})
             commonModule.saveData(url,reqObj,function(response){
              var email = $('#cemail').val();
              commonModule.hideLoadingMask();
              $('.mks_add_new_contact_wrap .scfe_close_wrap').trigger('click')
              attachedEvents.searchEmailInMks(email);
              debugger;
             })
            }
          }
          return {
            createNewContact : createNewContact
          }
        })();
        /*----- Subscriber Module ----*/
       var SubscriberModule = (function () {
                          var extractSubscriberDetails = function (resObj) {

                              if(parseInt(resObj.totalCount)==0){
                                $('.mks_wrap_step3,.new_contact_true,.create_new_contact_card').removeClass('hide');
                                $('.mks_wrap_step2').addClass('hide');
                                $('.mksph_back').removeClass('hide');
                                  $('.new_contact_false').addClass('hide');
                                init()
                              }else{
                                $('.debugDiv').html(resObj.subscriberList[0].subscriber1[0].subNum);
                                $('.mks_wrap_step2').addClass('hide');
                                $('.mksph_back').removeClass('hide');
                                $('.mks_wrap_step3').removeClass('hide');
                                $('.new_contact_true').addClass('hide');
                                baseObject['subNum'] = resObj.subscriberList[0].subscriber1[0].subNum;
                                baseObject['creationDate'] = resObj.subscriberList[0].subscriber1[0].creationDate;
                                baseObject['email'] = resObj.subscriberList[0].subscriber1[0].email;
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
                                  $('.new_custom_field_wraps').append('<div class="new_cf_added_dom"><span class="mksph_contact_title">'+$('.addBox_wrapper_container_dialog input#input1').val()+'</span>:<span class="mksph_contact_value undefined">'+$('.addBox_wrapper_container_dialog input#input2').val()+'</span><i>delete</i></div>');
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
                                $('.mksph_back').on('click',function(event){
                                    $(this).addClass('hide');
                                    $('.mks_wrap_step2').removeClass('hide');
                                    $('.mks_wrap_step3').addClass('hide');
                                    $('.activityLoading').removeClass('hide');
                                    //$('#mks_tab_activity .not-found').removeClass('red_color_mks')
                                    $('#mks_tab_activity .not-found').text('Loading Activtiy...')
                                    $('#Activity .act_row_body_wrap').html('');
                                     commonModule.hideLoadingMask();
                                });

                               
                          };

                          var NewSubscriberCreated = function(data){
                            commonModule.SuccessAlert({message :'Subscriber created successfully.'});
                            $('.debugDiv').html('This function will hit after successs'+ data.toString());
                            baseObject.subNum = data[1];
                            $('.new_contact_true input').val('');
                            $('.new_cf_added_dom').remove();
                            $('.new_contact_true,.create_new_contact_card').addClass('hide');
                            $('.new_contact_false').removeClass('hide');
                            getSubscriberDetails();
                          }

                          var getSubscriberDetails = function(){
                            $('.ms-welcome__main').removeClass('mks_suppresContact');
                            commonModule.showLoadingMask({message:"Loading contact details...",container : '.mkb_basicField_wrap'});
                            var searchUrl = baseObject.baseUrl
                                            +'/io/subscriber/getData/?BMS_REQ_TK='
                                            + baseObject.users_details[0].bmsToken +'&type=getSubscriber&subNum='
                                            +baseObject.subNum+'&ukey='+baseObject.users_details[0].userKey
                                            +'&isMobileLogin=Y&userId='+baseObject.users_details[0].userId;

                              $('.debugDiv').html(searchUrl);
                              commonModule.getDataRequest(searchUrl,generateBasicCustomFields)
                              getAllTags(); // Get all tagss
                             
                          }
                          var generateBasicCustomFields = function(data){
                            
                            /*--- Calling User Timeline---*/
                            $('.activityLoading .not-found').text('Loading Timeline...')
                            activityModule.getUserTimeLine(0);
                            activityModule.getServerTime();
                            tasksModule.getTasks();
                            notesModule.getNotes();
                            if(baseObject.taskdash){
                              baseObject['taskdash'] = false;
                              setTimeout(function(){
                                $('.makesbridge_plugin').animate({
                                  scrollTop: $("#tasks").offset().top - 50
                              }, 800);
                            },1000)
                            }
                            
                            /*------Setting up User SF---------*/ 
                            console.log(baseObject);
                            baseObject['customFields'] = data.cusFldList;
                            baseObject['subscriberDetails'] =  data

                            if(baseObject.isSalesforceUser == "Y"){
                              $('.top_manager_ul_wraps').addClass('six');
                              $('.top_manager_ul_wraps').removeClass('five');
                              if(data.sfUrl){
                                $('.addSf').addClass('hide');
                                $('.jumpSf').removeClass('hide');
                                $('#SalesForce').removeClass('hide');
                              }else{
                                $('.addSf').removeClass('hide');
                                $('.jumpSf').addClass('hide');
                                $('#SalesForce').addClass('hide');
                              }
                            }
                            /*---------------*/ 
                            $('.debugDiv').html(data.firstName);
                            $('.new_contact_false').removeClass('hide');
                            if(data.firstName){$('.edit_top_slider_title .scf_email span').eq(0).html(data.firstName)}
                            if(data.lastName){$('.edit_top_slider_title .scf_email span').eq(1).html(data.lastName)}
                            $('.edit_top_slider_title .scf_email span').eq(2).html(data.email)
                            $('.new_contact_false .scf_silhouette_text p').html(data.email.charAt(0));

                            $('.score-value').html(data.score);
                            $.each($('.mkb_basicField_wrap .mksph_contact_data'),function(key,val){
                              $(val).find('.mksph_contact_value').html(data[$(val).find('input').attr('name')]);
                              $(val).find('input').val(commonModule.decodeHTML(data[$(val).find('input').attr('name')]));
                            });
                            $('.customFields_ul').html('');
                            if(data.cusFldList){
                              var custFieldLi = "";
                              $.each(data.cusFldList[0],function(key,value){
                               custFieldLi +='<li>';
                               custFieldLi += '<div>';
                               custFieldLi +=  '<span class="mksph_contact_title">'+Object.keys(value[0])[0]+' </span>:';
                               custFieldLi +=  '<span class="mksph_contact_value show mkb_elipsis">'+value[0][Object.keys(value[0])[0]]+'</span>';
                               custFieldLi +=   '<input class="hide" value="'+commonModule.decodeHTML(value[0][Object.keys(value[0])[0]])+'">';
                               custFieldLi +=   '</div>'
                               custFieldLi += '</li>'
                                
                              });
                              $('ul.customFields_ul').append(custFieldLi);
                            }
                            $('.mks_tag_ul').html('')
                            if(data.tags){
                              
                              $('.tags-not-found').hide();
                              $('.tags_content').removeClass('hide');
                              var tags = "";
                              $.each(data.tags.split(','),function(key,val){
                                  tags +='<li>'
                                  tags +='<a class="tag">'
                                  tags +='<span>'+val+'</span>'
                                  tags +='<i class="icon cross"></i>'
                                  tags += '</a>'
                                  tags += '</li>';
                              });
                              $('.mks_tag_ul').append(tags);
                            }else{
                              $('.tags-not-found').show();
                              $('.tags_content').addClass('hide');
                            }
                            if(data.supress == "S")
                            {
                              $('.ms-welcome__main').addClass('mks_suppresContact');
                            }
                            commonModule.hideLoadingMask();
                            attachSubscriberEvents()
                          }
                          var saveBasicAdvanceFields = function(sfType){
                            var searlizeBasicObj = {};
                            $('.debugDiv').html('Save Basic Adv Function Called');
                            var sfUrl = (sfType == 'SF') ? '&updateAtSF=y' : '';

                            $.each($('.mkb_basicField_wrap input'),function(key,value){
                               searlizeBasicObj[$(value).attr('name')] = $(value).val();
                            });
                            searlizeBasicObj['email']  = $('.mks_createContact_ .scf_email p').text();

                            searlizeBasicObj['listNum']  = baseObject.users_details[0].listObj['listNum'];
                            $('.debugDiv').html(JSON.stringify(searlizeBasicObj));
                            searlizeBasicObj['isMobileLogin']='Y';
                            searlizeBasicObj['userId']=baseObject.users_details[0].userId;
                            searlizeBasicObj['subNum']=baseObject.subNum;
                            debugger;
                            if(sfUrl){
                              searlizeBasicObj["conLeadId"] = baseObject.subscriberDetails.conLeadId;
                              searlizeBasicObj["owner"] =  baseObject.subscriberDetails.salesRep;
                            }
                            // Add custom fields values
                            if($('ul.customFields_ul li').length > 0){
                              $.each($('ul.customFields_ul li'),function(key,val){
                                    searlizeBasicObj['frmFld_'+commonModule.encodeHTML($(val).find('.mksph_contact_title').text().trim())] = commonModule.encodeHTML($(val).find('input').val())
                              });
                            }

                            var url = baseObject.baseUrl+'/io/subscriber/setData/?BMS_REQ_TK='+baseObject.users_details[0].bmsToken+'&type=editProfile'+sfUrl;
                            if(sfUrl){
                              commonModule.showLoadingMask({message:"Updating contact to salesforce...",container : '.new_contact_false'});
                              commonModule.saveData(url,searlizeBasicObj,function(){
                                commonModule.SuccessAlert({message :'Contact updated successfully on salesforce.'});
                                commonModule.hideLoadingMask()
                              });
                            }else{
                              commonModule.saveData(url,searlizeBasicObj,updatedBasicAdvField)
                              commonModule.showLoadingMask({message:"Updating contact...",container : '.new_contact_false'});
                            }
                           
                            
                          }
                          var updatedBasicAdvField = function(data){
                            $('.debugDiv').html('Hit After Updating');
                          //  $('.mkb_basic_cancel').trigger('click');
                          //  $('.mkb_cf_cancel_btn').trigger('click');
                            commonModule.SuccessAlert({message :'Subscriber fields updated successfully.'})
                            $('.dialogBox').remove();
                            $('.OverLay').remove();
                            $('.mkb_basic_cancel').trigger('click')
                            $('.basic_expand').trigger('click');
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
                                $('.mkb_basicField_wrap .mks_expandable').trigger('click');
                              });

                              $('.mkb_basicField_wrap .mkb_basic_cancel').on('click',function(event){
                                  var parentDiv = $(this).parent();
                                  $(this).addClass('hide');
                                  parentDiv.find('.mkb_basic_edit').removeClass('hide');
                                  parentDiv.find('.mkb_basic_done').addClass('hide');
                                  parentDiv.find('.mksph_contact_data .mksph_contact_value').removeClass('hide');
                                  parentDiv.find('.mksph_contact_data input').addClass('hide');
                                  $('.mkb_basicField_wrap .mks_expandable').trigger('click');
                              });

                              $('.mkb_basicField_wrap .mkb_basic_done,.mkb_done').on('click',function(event){
                                if($(event.currentTarget).hasClass('mkb_basic_done')){
                                    $('.mkb_basicField_wrap .mks_expandable').trigger('click');
                                }
                                saveBasicAdvanceFields();
                              });
                              $('.mkb_cf_done').on('click',function(event){
                                var parentDiv = $(this).parent();
                                $('.cf_expand').trigger('click');
                                parentDiv.find('.mkb_cf_cancel_btn').addClass('hide');
                                parentDiv.find('.mkb_cf_done').addClass('hide');
                                parentDiv.find('.mkb_cf_edit_btn').removeClass('hide');
                                parentDiv.find('.addCF').removeClass('hide');
                                saveBasicAdvanceFields();
                              });

                              $('.mkb_cf_edit_btn').on('click',function(event){
                                var parentDiv = $(this).parent();
                                $(this).addClass('hide');
                                parentDiv.find('.addCF').addClass('hide');
                                parentDiv.find('.mkb_cf_cancel_btn').removeClass('hide');
                                parentDiv.find('.mkb_cf_done').removeClass('hide');
                                parentDiv.find('ul.customFields_ul li .mksph_contact_value').addClass('hide');
                                parentDiv.find('ul.customFields_ul li input').removeClass('hide');
                                $('.cf_expand').trigger('click');
                              })
                              $('.mkb_cf_cancel_btn').on('click',function(event){
                                var parentDiv = $(this).parent();
                                $(this).addClass('hide');
                                parentDiv.find('.addCF').removeClass('hide');
                                parentDiv.find('.mkb_cf_edit_btn').removeClass('hide');
                                parentDiv.find('.mkb_cf_done').addClass('hide');
                                parentDiv.find('ul.customFields_ul li .mksph_contact_value').removeClass('hide');
                                parentDiv.find('ul.customFields_ul li input').addClass('hide');
                                  $('.cf_expand').trigger('click');
                              });
                              $('.edit_top_slider').on('click',function(event){
                                $('.debugDiv').html('Edit Basic Fields ');
                                $('.mkb_basicField_wrap .mkb_basic_edit').trigger('click');
                              })
                              $('.addCF').unbind('click');
                              $('.addCF').on('click',function(event){
                                var bodyHtml = '<input type="text" name="ckey" value="" id="input1" class="focusThis requiredInput" data-required="required" placeholder="Enter field name *"><input type="text" name="cvlaue" value="" id="input2" class="" placeholder="Enter Value">';
                                dialogModule.dialogView({showTitle:'Add Custom Field',childrenView : bodyHtml, additionalClass : '',container : '.customField_ul_wraps',saveCallBack : addNewCF });
                                event.stopPropagation();
                              });

                              $('.addTasks').unbind('click');
                              $('.addTasks').on('click',function(event){
                                tasksModule.showTasksDialog();
                                event.stopPropagation();
                              });

                              $('.tasks_sort_by select').unbind('change');
                              $('.tasks_sort_by select').on('change',function(event){
                                if($(this).val() != "-1"){
                                  if($(this.options[this.selectedIndex]).closest('optgroup').prop('label') == "Tasks Types"){
                                    tasksModule.getTasksByTask($(this).val());
                                  }else{
                                    tasksModule.getTasksByPT($(this).val())
                                  }
                                }else{
                                  tasksModule.getTasks();
                                }
                                event.stopPropagation();
                              });

                              $('.mkb_notes-save').unbind('click');
                              $('.mkb_notes-save').on('click',function(event){
                                //tasksModule.showTasksDialog();
                                notesModule.saveNotes();
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
                                 
                                  
                                  setTimeout(function(){$('.addTagWrapper .focusThis').focus();
                                  try{
                                    jQuery('#addTagName').autocomplete({
                                      source: baseObject.allTags
                                    });
                                  }catch(e){
                                    console.log(e.message);
                                  }
                                },500);
                              });
                              $('.tag__input_mks').keypress(function(event){
                                 if(event.which == 13){
                                   $('.addTagWrapper .scfe_save_wrap .scfe_ach').trigger('click');
                                 }
                                
                                 event.stopPropagation()
                              });
                              $('.addTagWrapper .scfe_close_wrap').on('click',function(){
                                  $(this).parents('.addTagWrapper').hide();
                                  $('.addTag').show();
                              });
                              $('.scfe_save_wrap').on('click',function(){
                                debugger;
                                SubscriberModule.saveBasicAdvanceFields('SF')
                              })
                              $('ul.mks_tag_ul .icon.cross').on('click',function(){

                                var tagName = $(this).parent().find('span').text();

                                deleteTags(tagName);
                              });
                              $('.addTagWrapper .scfe_save_wrap .scfe_ach').unbind('click');
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
                                    $('.tablinks').eq(0).click();
                                    $('#mks_tab_activity #Activity').addClass('hide');
                                    $('#mks_tab_activity .activityLoading').removeClass('hide');
                                    // $('#mks_tab_activity .not-found').removeClass('red_color_mks')
                                    $('#mks_tab_activity .not-found').text('Loading Activtiy...')
                                    $('#Activity .act_row_body_wrap').html('');
                                });
                                // Attach Events for Action bar
                                $('.mks_wrap_step3 ul.top_manager_ul_wraps li').unbind('click');
                                $('.mks_wrap_step3 ul.top_manager_ul_wraps li').on('click',function(event){
                                  console.log($(this).attr('data-tip'));
                                  if($(this).attr('data-tip') == 'Add to Sequence'){
                                    workFlow.getWorkflowLists();
                                  }else if($(this).attr('data-tip') == 'Manage list subscription'){
                                    manageList.getallLists();
                                  }else if($(this).attr('data-tip') == 'Add to list'){
                                    subsList.getallLists();
                                  }
                                  else if($(this).attr('data-tip') == 'Suppress contact'){
                                    compressSubs.init();
                                  }else if($(this).attr('data-tip') == 'Add to Salesforce'){
                                    salesForceModule.showAddToSF()
                                  }else if($(this).attr('data-tip') == 'Jump Salesforce'){
                                    console.log(baseObject)
                                    debugger;
                                    var url = baseObject.subscriberDetails.sfUrl;
                                    window.open(commonModule.decodeHTML(url), 'newwindow', 'scrollbars=yes,resizable=yes');
                                  }
                                });

                                /*
                               Tabs Clicks
                               */
                              $('.scf_tab_wrap .tablinks').unbind('click');
                               $('.scf_tab_wrap .tablinks').on('click',function(){
                                $('.tablinks').removeClass('active');
                                $(this).addClass('active');
                                $('.tabs_content').hide();
                                $('#mks_tab_'+$(this).text().toLowerCase()).show();
                                /*if($(this).text().toLowerCase()=="activity"){
                                  $('#mks_tab_'+$(this).text().toLowerCase()).find('.not-found').html('Loading activity timeline...');
                                 
                                }*/
                              })
                          };
                          
                          var addNewCF  = function(){


                              if(!$('.dialogBox input.requiredInput').val()){
                                $('.dialogBox input.requiredInput').addClass('hasError');
                                return;
                              }

                              $('ul.customFields_ul').append('<li class="click_pointer"><div><span class="mksph_contact_title">'+$('.dialogBox input#input1').val()+' </span>:<span class="mksph_contact_value show mkb_elipsis">'+$('.dialogBox input#input2').val()+'</span><input class="hide" value="'+$('.dialogBox input#input2').val()+'"></div></li>');
                              $('.debugDiv').html('CF new add called');
                              saveBasicAdvanceFields();
                              dialogModule.hideDialog();
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
                            if(data[0]=="err"){
                                return false;
                            }
                            $('.debugDiv').html('At Generated Tag');
                            commonModule.SuccessAlert({message :'Tag created successfully.'});
                            var dataA = '<li><a class="tag"><span>'+commonModule.decodeHTML($('#addTagName').val())+'</span><i class="icon cross"></i></a></li>';
                            $('.addTagWrapper').hide();
                            $('.addTag').show();
                            $('.mks_tag_ul').parent().removeClass('hide');
                            $('.mks_tag_ul').append(dataA);

                            $('.addTagWrapper input').val('');
                            // Reattach delete event for new tag
                            $('ul.mks_tag_ul .icon.cross').unbind('click');
                            $('.tags-not-found').hide();
                            $('ul.mks_tag_ul .icon.cross').on('click',function(){

                              var tagName = $(this).parent().find('span').text();

                              deleteTags(tagName);
                            });
                          }
                          var getAllTags = function(){
                            
                            var searchUrl = baseObject.baseUrl
                            + '/io/user/getData/?BMS_REQ_TK='
                            + baseObject.users_details[0].bmsToken +'&type=allSubscriberTags&ukey='+baseObject.users_details[0].userKey
                            + '&isMobileLogin=Y&userId='+baseObject.users_details[0].userId;
                            commonModule.getDataRequest(searchUrl,function(data){
                              var allTagsArray = [];
                              jQuery.each(data.tags[0],function(key,val){
                                allTagsArray.push(commonModule.decodeHTML(val[0].tag));
                              });
                              baseObject['allTags'] = allTagsArray
                              console.log(allTagsArray);
                              
                            });
                           
                          }
                          return {
                            init: init,
                            extractSubscriberDetails : extractSubscriberDetails,
                            getSubscriberDetails   : getSubscriberDetails,
                            generateBasicCustomFields : generateBasicCustomFields,
                            getAllTags : getAllTags,
                            saveBasicAdvanceFields : saveBasicAdvanceFields
                          };

                        })();


       /*----- Tasks Module ----*/
       var tasksModule = (function(){
        var mapicons = {
          "lunch" : "mksicon-Lunch",
          "discovery" : "mksicon-Discovery",
          "call" : "mksicon-Phone",
          "email" : "mksicon-Mail",
          "breakfast" : "mksicon-Breakfast",
          "meeting" : "mksicon-Meeting",
          "proposal" : "mksicon-Proposal",
          "demo"  : "mksicon-Demo",
          "first_touch":"mksicon-First-Touch"
        }
        var priorityIcons = {
          "low" : {"topClass":"mks_priority_low pclr9","icon" : "mksicon-Triangle_Down"},
          "high" : {"topClass":"mks_priority_high pclr12","icon" : "mksicon-Triangle_Up"},
          "medium" : {"topClass":"mks_priority_medium pclr19","icon" : "mksicon-More"}
        }
        var taskId = '';
        var TaskObj = null;
        var selectedTask = '';
        var showTasksDialog = function(type){
          var bodyHtml = ''
          bodyHtml += '<ul class="mks_ecc_wrap">';
          bodyHtml += '<span><li class="mks_ecc_first_touch tooltips" data-tip="First Touch" data-value="first_touch" currentitem="false"><div class="mksicon-First-Touch"></div><span>First Touch</span></li></span>';
          bodyHtml += '<span><li class="mks_ecc_demo tooltips" data-tip="Demo" data-value="demo" currentitem="false"><div class="mksicon-Demo"></div><span>Demo</span></li></span>';
          bodyHtml += '<span><li class="mks_ecc_discovery tooltips" data-tip="Discovery" data-value="discovery" currentitem="false"><div class="mksicon-Discovery"></div><span>Discovery</span></li></span>';
          bodyHtml += '<span><li class="mks_ecc_call active tooltips" data-tip="Call" data-value="call" currentitem="false"><div class="mksicon-Phone"></div><span>Call</span></li></span>';
          bodyHtml += '<span><li class="mks_ecc_email tooltips" data-tip="Email" data-value="email" currentitem="false"><div class="mksicon-Mail"></div><span>Email</span></li></span>';
          bodyHtml += '<span><li class="mks_ecc_lunch tooltips" data-tip="Lunch" data-value="lunch" currentitem="false"><div class="mksicon-Lunch"></div><span>Lunch</span></li></span>';
          bodyHtml += '<span><li class="mks_ecc_breakfast tooltips" data-tip="Breakfast" data-value="breakfast" currentitem="false"><div class="mksicon-Breakfast"></div><span>Breakfast</span></li></span>';
          bodyHtml += '<span><li class="mks_ecc_meeting tooltips" data-tip="Meeting" data-value="meeting" currentitem="false"><div class="mksicon-Meeting"></div><span>Meeting</span></li></span>';
          bodyHtml += '<span><li class="mks_ecc_proposal tooltips" data-tip="Proposal" data-value="proposal" currentitem="false"><div class="mksicon-Proposal"></div><span>Proposal</span></li></span>';
          bodyHtml += '</ul>'
          bodyHtml += '<input type="text" name="ckey" value="Call" id="input2" class="focusThis" data-required="required" placeholder="Enter task name *">'
          bodyHtml +='<span class="date_wrapper__mks"><input type="text" id="datepicker"></span>'
          bodyHtml +='<span class="timePicker_wrap"><input type="text" class="timepicker"/></span>'
          bodyHtml +='<ul class="mks_priorty_wrap"><li class="mks_priotiry_low">Low</li><li class="mks_priotiry_medium active">Medium</li><li class="mks_priotiry_high">High</li></ul>'
          bodyHtml +='<textarea placeholder="Add notes about your task here" id="notes"></textarea>'
        
          dialogModule.dialogView({showTitle: (type=='edit') ? 'Edit Task' : 'Add Task',childrenView : bodyHtml, additionalClass : 'taks_dialog_wrapper',container : '.customField_ul_wraps',saveCallBack : (type=='edit') ? updateTask :tasksModule.addNewTasks,initCallBack : tasksModule.attachTasksEvents });
        } 

        var attachTasksEvents = function(){
          $( ".taks_dialog_wrapper #datepicker" ).datepicker();
          $( ".taks_dialog_wrapper #datepicker" ).datepicker( "setDate", new Date());
          $('.taks_dialog_wrapper input.timepicker').timepicker({ 'scrollDefault': 'now'});
          $('.taks_dialog_wrapper input.timepicker').timepicker('setTime', new Date());

          $('.taks_dialog_wrapper .mks_ecc_wrap li').on('click',function(){
            if($(this).parents('.mks_ecc_wrap').find('li.active').attr('data-tip') == $('.taks_dialog_wrapper #input2').val().trim()){
              $('.taks_dialog_wrapper #input2').val($(this).attr('data-tip'))
            }
            $(this).parents('.mks_ecc_wrap').find('li').removeClass('active');
            
            $(this).addClass('active');
          });
          $('.taks_dialog_wrapper .mks_priorty_wrap li').on('click',function(){
            $(this).parent().find('li').removeClass('active');
            $(this).addClass('active');
          });

          $('.msk_collapse_tasks').unbind('click');
          $('.msk_collapse_tasks').on('click',function(event){
              $('.debugDiv').html('collapse clicked')

              /*-- Adding height --*/
                if($(this).hasClass('expand')){
                  $(this).find('span').eq(0).text('Click to collapse')
                  $('.task_expand_height').addClass('heighAuto');
                }else{
                  $(this).find('span').eq(0).text('Click to expand');
                    $('.task_expand_height').removeClass('heighAuto');
                }

              if($(this).hasClass('expand')){
                $(this).removeClass('expand');
                $(this).addClass('collapse');
              }else{
                $(this).removeClass('collapse');
                $(this).addClass('expand');
              }
          });
          $('.mks_task_edit_delete_wrap').unbind('click');
          $('.mks_task_edit_delete_wrap').on('click',function(){
            if($(this).hasClass('_mks_task_delete_task')){
              deleteTasks($(this).attr('dat-id'))
            }else{
              editTasks($(this).attr('dat-id'))
            }
          });
          $('.mkb_task_compBtn').unbind('click');
          $('.mkb_task_compBtn').on('click',function(){
            var taskId = $(this).attr('dat-id');
            commonModule.showLoadingMask({message : 'Marking task completed...',container : '.mks_outlook_tasks_wrapper'});
            updateTask(true,taskId)
          });
        }
        
        var addNewTasks = function(){
          var tasktype = $('.taks_dialog_wrapper .mks_ecc_wrap li.active').attr('data-value');
          var taskName = $('.taks_dialog_wrapper #input2').val();
          var taskDate = $('.taks_dialog_wrapper #datepicker').val();
          var taskTime = $('.taks_dialog_wrapper .timepicker').val();
          var taskPriorty = $('.taks_dialog_wrapper .mks_priorty_wrap li.active').text().toLowerCase();
          var taskNotes =  $('.taks_dialog_wrapper #notes').val();
          var _date = moment(taskDate, 'MM-DD-YYYY')
          var newtaskDate = _date.format("MM-DD-YYYY");
          var timeDate = newtaskDate + " " + moment(taskTime, ["h:mm A"]).format("HH:mm")+":00";
          // type: "add";
        
          var reqObj = {
            type: "add",
            subNum:  baseObject.subNum,
            tasktype: tasktype,
            name: taskName,
            taskDate: timeDate,
            priority: taskPriorty,
            notes: taskNotes,
            ukey: baseObject.users_details[0].userKey,
            isMobileLogin:'Y',
            userId:baseObject.users_details[0].userId
          }
          commonModule.showLoadingMask({message:"Saving task...",container : '.taks_dialog_wrapper'})
          var url = baseObject.baseUrl+'/io/subscriber/subscriberTasks/?BMS_REQ_TK='+baseObject.users_details[0].bmsToken;
          commonModule.saveData(url,reqObj,function(response){
            commonModule.hideLoadingMask();
            if(response[0]=="err"){
              commonModule.ErrorAlert({message :response[1]});
              return false;
            }
            commonModule.SuccessAlert({message :response.success});
            dialogModule.hideDialog();
            getTasks();
          });
        }
        var getTasks = function(url){
          if(url){
            commonModule.getDataRequest(url,function(data){
              if(parseInt(data.totalCount) > 0){
                TaskObj = data.taskList;
                $('.mks_outlook_tasks_wrapper').html('');
                $.each(data.taskList,function(key,val){
                  if(key > 2){
                    $('.msk_collapse_tasks').removeClass('hide');
                  }else{
                    $('.msk_collapse_tasks').addClass('hide');
                  }
                  $('.mks_outlook_tasks_wrapper').append(generateTask(val))
                });
              }else{
                $('.mks_outlook_tasks_wrapper').html('<p class="not-found">No tasks found.</p>')
                $('.msk_collapse_tasks').addClass('hide');
              }
              attachTasksEvents();
            })
          }else{
            var reqObj = {
              type: "getTasks",
              subNum: baseObject.subNum,
              fromDate: "03-01-2018", //"2018-04-01",
              toDate: moment().add('days', 30).format('MM-DD-YYYY'),
              orderBy : "updationTime",
              order: "desc",
              offset : 0,
              bucket : 20,
              ukey:baseObject.users_details[0].userKey,
              isMobileLogin:'Y',
              userId:baseObject.users_details[0].userId
            };
            var url = baseObject.baseUrl+'/io/subscriber/subscriberTasks/?BMS_REQ_TK='+baseObject.users_details[0].bmsToken;
            commonModule.saveData(url,reqObj,function(data){
                $('.mks_outlook_tasks_wrapper').html('')
                if(parseInt(data.totalCount) > 0){
                  TaskObj = data.taskList;
                  $.each(data.taskList,function(key,val){
                    if(key > 2){
                      $('.msk_collapse_tasks').removeClass('hide');
                    }else{
                      $('.msk_collapse_tasks').addClass('hide');
                    }
                    $('.mks_outlook_tasks_wrapper').append(generateTask(val))
                  });
                }else{
                  $('.mks_outlook_tasks_wrapper').html('<p class="not-found">No tasks found.</p>')
                  $('.msk_collapse_tasks').addClass('hide');
                }
                attachTasksEvents();
            });
          }
         
        }
        var editTasks = function(taskid){
          console.log(taskid);
          $.each(TaskObj,function(key,values){
            if(values['taskId.encode']==taskid){
              selectedTask = values;
              showTaskDialogEdit(values)
              debugger;
            }
          });
          return false;
        }
        var updateTask = function(isComplete,taskId){
          var tasktype = $('.taks_dialog_wrapper .mks_ecc_wrap li.active').attr('data-value');
          var taskName = $('.taks_dialog_wrapper #input2').val();
          var taskDate = $('.taks_dialog_wrapper #datepicker').val();
          var taskTime = $('.taks_dialog_wrapper .timepicker').val();
          var taskPriorty = $('.taks_dialog_wrapper .mks_priorty_wrap li.active').text().toLowerCase();
          var taskNotes =  $('.taks_dialog_wrapper #notes').val();
          var _date = moment(taskDate, 'MM-DD-YYYY')
          var newtaskDate = _date.format("MM-DD-YYYY");
          var timeDate = newtaskDate + " " + moment(taskTime, ["h:mm A"]).format("HH:mm")+":00";
          
          var reqObj = {
            type: (isComplete) ? "complete" : "update",
            subNum:  baseObject.subNum,
            tasktype: (isComplete) ? "" :  tasktype,
            name: (isComplete) ? "" :taskName,
            taskDate: (isComplete) ? "" :timeDate,
            priority: (isComplete) ? "" : taskPriorty,
            notes: (isComplete) ? "" : taskNotes,
            ukey: baseObject.users_details[0].userKey,
            isMobileLogin:'Y',
            userId:baseObject.users_details[0].userId,
            taskId : (taskId) ? taskId : selectedTask['taskId.encode'],
          }
          var url = baseObject.baseUrl+'/io/subscriber/subscriberTasks/?BMS_REQ_TK='+baseObject.users_details[0].bmsToken
          if(isComplete){
            commonModule.showLoadingMask({message:"Completing task...",container : '.taks_dialog_wrapper'})
          }else{
            commonModule.showLoadingMask({message:"Updating task...",container : '.taks_dialog_wrapper'})
          }
          console.log(selectedTask);
          commonModule.saveData(url,reqObj,function(response){
            getTasks();
            commonModule.hideLoadingMask();
            dialogModule.hideDialog();
            if(isComplete){
              commonModule.SuccessAlert({message : 'Task mark as completed'})
            }else{
              commonModule.SuccessAlert({message : 'Task updated successfully'})
            }
            
          })
        }
        var showTaskDialogEdit = function(task){
          showTasksDialog('edit');
          $('.taks_dialog_wrapper #input2').val(task.taskName);
          $('.taks_dialog_wrapper .mks_ecc_wrap li,.taks_dialog_wrapper .mks_priorty_wrap li').removeClass('active');
          $('.taks_dialog_wrapper .mks_ecc_wrap li.mks_ecc_'+task.taskType).addClass('active');

          var _date = moment(task.taskDate, 'YYYY-MM-DD hh:mm') //2018-05-14  00:30:00
          var newtaskDate = _date.format('MM/DD/YYYY');
          var timeNow = _date.format("hh:mm A")
          $('.taks_dialog_wrapper #datepicker').val(newtaskDate);
          $('.taks_dialog_wrapper .mks_ecc_wrap li.mks_ecc_'+task.taskType);
          $('.taks_dialog_wrapper .timepicker').val(timeNow);
          $('.taks_dialog_wrapper .mks_priorty_wrap li.mks_priotiry_'+task.priority).addClass('active');
          $('.taks_dialog_wrapper .notes').val(task.notes)
        }
        var generateTask = function(data){
          var htmlObj = '';
          var dateObj = generateDateObj(data.taskDate); 
          var user = (data.taskAddedBy == baseObject.users_details[0].userId) ? "You" : data.taskAddedBy;
          htmlObj += '<div class="contact_found mks_tasks_lists_user task_status_'+data.status+'" style="padding: 10px 12px;">'
          htmlObj += '<div class="cf_silhouette">'
          htmlObj += '<div class="cf_silhouette_text c_txt_s c_txt_s_blue">'
          htmlObj += '<i class="'+mapicons[data.taskType]+' mks-task-icons"></i>'
          htmlObj += '</div>'
          htmlObj += '</div>'
          htmlObj += '<div class="cf_email_wrap">'
          htmlObj += '<div class="cf_email">'
          htmlObj += '<p class="mkb_elipsis mkb_text_break" title="'+data.taskName+'" style="width: 145px;">'+data.taskName+'</p>'
          htmlObj += '<span class="ckvwicon">at '+dateObj.time +', '+dateObj.date+' | created by <strong>'+user +'</strong></span>'
          htmlObj += '</div>'
          htmlObj += '<div class="cf_task_right">'
          htmlObj += '<span data-tip="'+data.priority+'" class="mks_priority_icon '+priorityIcons[data.priority]["topClass"]+'" currentitem="false">'
          htmlObj += '<i class="'+priorityIcons[data.priority]["icon"]+'"></i>'
          htmlObj += '<div class="__react_component_tooltip place-top type-dark " data-id="tooltip"></div>'
          htmlObj += '</span>'
          htmlObj += '<span class="mkb_btn mkb_cf_btn pull-right mkb_greenbtn addCF show mkb_task_compBtn" dat-id="'+data['taskId.encode']+'" style="top: 5px; right: 0px;padding:6px 8px;">'
          htmlObj += '<i class="mksicon-Check"></i>Complete</span>'
          htmlObj += '<span class="mkb_tast_completed_btn mkb_btn mkb_cf_btn pull-right mkb_greenbtn addCF mkb_task_compBtn" style="top: 13px; right: 0px;">Completed</span>'
          htmlObj += '</div>'
          htmlObj += '</div>'
          htmlObj += '<div class="mks_task_edit_delete_wrap" dat-id="'+data['taskId.encode']+'">'
          htmlObj += '<div class="cf_silhouette">'
          htmlObj += '<div class="cf_silhouette_text c_txt_s c_txt_s_blue">'
          htmlObj += '<i class="mksicon-Edit mks-task-icons"></i>'
          htmlObj += '</div>'
          htmlObj += '</div>'
          htmlObj += '</div>'
          htmlObj += '<div class="mks_task_edit_delete_wrap _mks_task_delete_task" style="left: 37px; width: 8%; background: transparent;" dat-id="'+data['taskId.encode']+'">'
          htmlObj += '<div class="cf_silhouette">'
          htmlObj += '<div class="cf_silhouette_text c_txt_s c_txt_s_blue">'
          htmlObj += '<i class="mksicon-Delete mks-task-icons"></i>'
          htmlObj += '</div>'
          htmlObj += '</div>'
          htmlObj += '</div>'
          htmlObj += '</div>';
          return htmlObj;
        }
        var generateDateObj = function(dateString){
          var _date = moment(commonModule.decodeHTML(dateString),'YYYY-M-D H:m');
          var format = {date: _date.format("DD MMM YYYY"), time: _date.format("hh:mm A")};
          return format;
        }
        var generateDate = function(dateString){
          var _date = moment(commonModule.decodeHTML(dateString),'YYYY-M-D H:m');
          var format = {date: _date.format("DD MMM YYYY"), time: _date.format("hh:mm A")};
          return format.date +" "+ format.time;
        }
        var generateTimeOnly = function(dateString){
          var _date = moment(commonModule.decodeHTML(dateString),'YYYY-M-D H:m');
          var format = {date: _date.format("DD MMM YYYY"), time: _date.format("hh:mm A")};
          return format.time;
        }
        var deleteTasks = function(taskID){
          taskId = taskID
          var bodyHtml = '<p>Are you sure you want to delete the task?</p>';
          dialogModule.dialogView({showTitle:'Delete Task',childrenView : bodyHtml, additionalClass : 'addToSuppressWrapper',container : '.top_managerLists_wrappers',saveCallBack : taskDeleteOps,buttonText:'Delete' })
        }
        var taskDeleteOps = function(){
          console.log(taskId);
          var reqObj = {
            type: "delete",
            subNum: baseObject.subNum,
            taskId : taskId,
            ukey:baseObject.users_details[0].userKey,
            isMobileLogin:'Y',
            userId:baseObject.users_details[0].userId
          }
          commonModule.showLoadingMask({message:"Deleting task...",container : '.dialogBox'})
          var url = baseObject.baseUrl+'/io/subscriber/subscriberTasks/?BMS_REQ_TK='+baseObject.users_details[0].bmsToken;
          commonModule.saveData(url,reqObj,function(response){
            
            if(response.success){
              commonModule.hideLoadingMask();
              commonModule.SuccessAlert({message :response.success})
              dialogModule.hideDialog();
              getTasks()
            }
          })
          debugger;
        }
        var getTasksDashBoard = function(obj){
          if(obj && obj.hasClass('all')){
            //https://test.bridgemailsystem.com/pms/io/subscriber/subscriberTasks/?BMS_REQ_TK=6A5xqkpTtBrOTsOFdx6t3Q0keSVXZ1&type=getAllTask&orderBy=creationTime&order=asc&offset=0&bucket=20
            var url = baseObject.baseUrl+'/io/subscriber/subscriberTasks/?BMS_REQ_TK='+baseObject.users_details[0].bmsToken+'&type=getAllTask&orderBy=updationTime&order=asc&offset=0&bucket=20&ukey='+baseObject.users_details[0].userKey+'&isMobileLogin=Y&userId='+baseObject.users_details[0].userId;
            commonModule.getDataRequest(url,generateDashTasks)
          }else{
            var reqObj = {
              type: "getAllTask",
              fromDate: moment().format("MM-DD-YYYY"),
              toDate: moment().format("MM-DD-YYYY"), // Day +1
              orderBy : "updationTime",
              order: "desc",
              offset : 0,
              bucket : 20,
              ukey:baseObject.users_details[0].userKey,
              isMobileLogin:'Y',
              userId:baseObject.users_details[0].userId
            };
            var url = baseObject.baseUrl+'/io/subscriber/subscriberTasks/?BMS_REQ_TK='+baseObject.users_details[0].bmsToken;
            commonModule.saveData(url,reqObj,generateDashTasks)
          }
          
        }
        var getTasksDashBoradByPT = function(option){
          debugger;
         var fromDate= moment().format("MM-DD-YYYY");
         var toDate= moment().format("MM-DD-YYYY");
          
          if($('.toggleTask.active').hasClass('all')){
            //https://test.bridgemailsystem.com/pms/io/subscriber/subscriberTasks/?BMS_REQ_TK=El0915vN5rOLp8t4MmWdC72pT9jWoQ&type=getAllTask&orderBy=updationTime&offset=0&bucket=20&sortType=priority&sortOrderBy=desc&sortBy=low
            var url = baseObject.baseUrl+'/io/subscriber/subscriberTasks/?BMS_REQ_TK='+baseObject.users_details[0].bmsToken+'&type=getAllTask&orderBy=updationTime&offset=0&bucket=20&sortType=prioritySingle&sortOrderBy=desc&sortBy='+option+'&ukey='+baseObject.users_details[0].userKey+'&isMobileLogin=Y&userId='+baseObject.users_details[0].userId;
          }else{
            // https://test.bridgemailsystem.com/pms/io/subscriber/subscriberTasks/?BMS_REQ_TK=6A5xqkpTtBrOTsOFdx6t3Q0keSVXZ1&type=getAllTask&orderBy=creationTime&offset=0&bucket=20&sortType=prioritySingle&sortOrderBy=desc&fromDate=04-25-2018&toDate=04-28-2018&sortBy=medium
            var url = baseObject.baseUrl+'/io/subscriber/subscriberTasks/?BMS_REQ_TK='+baseObject.users_details[0].bmsToken+'&type=getAllTask&orderBy=updationTime&offset=0&bucket=20&sortType=prioritySingle&sortOrderBy=desc&fromDate='+fromDate+'&toDate='+toDate+'&sortBy='+option+'&ukey='+baseObject.users_details[0].userKey+'&isMobileLogin=Y&userId='+baseObject.users_details[0].userId;
          }
          commonModule.showLoadingMask({message : 'filtering tasks as '+option, container: '.mks_task_lists_dash_wrapper'})
          commonModule.getDataRequest(url,generateDashTasks)
        }
        var getTasksByTask = function(option){
          var url = baseObject.baseUrl+'/io/subscriber/subscriberTasks/?BMS_REQ_TK='+baseObject.users_details[0].bmsToken+'&type=getAllTask&orderBy=updationTime&offset=0&bucket=20&sortType=taskTypeSingle&sortOrderBy=desc&sortBy='+option+'&ukey='+baseObject.users_details[0].userKey+'&isMobileLogin=Y&userId='+baseObject.users_details[0].userId;
          getTasks(url);
        }
        var getTasksByPT = function(option){
          var url = baseObject.baseUrl+'/io/subscriber/subscriberTasks/?BMS_REQ_TK='+baseObject.users_details[0].bmsToken+'&type=getAllTask&orderBy=updationTime&offset=0&bucket=20&sortType=prioritySingle&sortOrderBy=desc&sortBy='+option+'&ukey='+baseObject.users_details[0].userKey+'&isMobileLogin=Y&userId='+baseObject.users_details[0].userId;
          getTasks(url);
        }
        var getTasksDashBoardByTask = function(option){
          //https://test.bridgemailsystem.com/pms/io/subscriber/subscriberTasks/?BMS_REQ_TK=El0915vN5rOLp8t4MmWdC72pT9jWoQ&type=getAllTask&orderBy=updationTime&offset=0&bucket=20&sortType=taskTypeSingle&sortOrderBy=desc&sortBy=email
          var fromDate= moment().format("MM-DD-YYYY");
         var toDate= moment().format("MM-DD-YYYY");
          
          if($('.toggleTask.active').hasClass('all')){
            var url = baseObject.baseUrl+'/io/subscriber/subscriberTasks/?BMS_REQ_TK='+baseObject.users_details[0].bmsToken+'&type=getAllTask&orderBy=updationTime&offset=0&bucket=20&sortType=taskTypeSingle&sortOrderBy=desc&sortBy='+option+'&ukey='+baseObject.users_details[0].userKey+'&isMobileLogin=Y&userId='+baseObject.users_details[0].userId;
          }else{
            //https://test.bridgemailsystem.com/pms/io/subscriber/subscriberTasks/?BMS_REQ_TK=6A5xqkpTtBrOTsOFdx6t3Q0keSVXZ1&type=getAllTask&orderBy=creationTime&order=asc&offset=0&bucket=20&fromDate=04-25-2018&toDate=04-25-2018&sortType=taskTypeSingle&sortBy=demo
            var url = baseObject.baseUrl+'/io/subscriber/subscriberTasks/?BMS_REQ_TK='+baseObject.users_details[0].bmsToken+'&type=getAllTask&orderBy=updationTime&offset=0&bucket=20&sortType=taskTypeSingle&sortOrderBy=desc&fromDate='+fromDate+'&toDate='+toDate+'&sortBy='+option+'&ukey='+baseObject.users_details[0].userKey+'&isMobileLogin=Y&userId='+baseObject.users_details[0].userId;
          }
          commonModule.showLoadingMask({message : 'filtering tasks as '+option, container: '.mks_task_lists_dash_wrapper'})
          debugger;
          commonModule.getDataRequest(url,generateDashTasks);
        }
        var generateDashTasks = function(data){
          var pendinTask='';
          var completeTask ='';
          var compArray = [];
          var pendArray = [];
          commonModule.hideLoadingMask();
          if(parseInt(data.totalCount) > 0){
            $('.task-loading-nof').addClass('hide');
            
            $.each(data.taskList,function(key,value){
              console.log(value);
              if(value.status=="C"){
                compArray.push(value)
                completeTask += generateCompleteTaskD(value);
              }else{
                pendArray.push(value)
                pendinTask += generatePendingTaskD(value);
              }
            });
            $('.mks_task_lists_dash_wrapper .total-pending').html(pendArray.length)
            $('.mks_task_lists_dash_wrapper .total-complete').html(compArray.length)
        
            $('.mks_task_lists_dash_wrapper .searchBar').removeClass('hide');
            $('.tasks_wrapper_dashboard .mks_task_lists_dash_wrapper .content-wrapper').removeClass('hide');
            
            $('._mks_completed_tasks .total-count-head').removeClass('hide');
            $('.mks_task_lists_dash_wrapper .task_status_P_wrapper .task_status_P').remove();
            $('.mks_task_lists_dash_wrapper .task_status_P_wrapper').append(pendinTask);
            if(pendArray.length > 2){
              $('.msk_collapse_tasks_P').removeClass('hide');
            }else{
              $('.msk_collapse_tasks_P').addClass('hide');
            }
            $('.mks_task_lists_dash_wrapper .contact_found._mks_lists_tasks._mks_complete_tasks').remove();
            debugger;
            $('.mks_task_lists_dash_wrapper ._mks_completed_tasks').append(completeTask);
            
            if(completeTask.length > 0){
              $('.mks_task_lists_dash_wrapper ._mks_completed_tasks').removeClass('hide');
            }
            commonModule.hideLoadingMask();

            /*==Attaching events===*/
            $('.c_txt_s_mark_complete').unbind('click');
            $('.c_txt_s_mark_complete').on('click',function(){
              debugger;
              var reqObj = {
                type: "complete",
                subNum: $(this).attr('subs-id'),
                taskId :  $(this).attr('data-id'),
                ukey:baseObject.users_details[0].userKey,
                isMobileLogin:'Y',
                userId:baseObject.users_details[0].userId
              };
              commonModule.showLoadingMask({message : 'Marking task completed',container :'.tasks_wrapper_dashboard'})
              var url = baseObject.baseUrl+'/io/subscriber/subscriberTasks/?BMS_REQ_TK='+baseObject.users_details[0].bmsToken;
              commonModule.saveData(url,reqObj,function(response){
                getTasksDashBoard();
                commonModule.showLoadingMask({message : 'Loading tasks..',container :'.tasks_wrapper_dashboard'});

              })
            })
            $('.msk_collapse_tasks_P').unbind('click');
          $('.msk_collapse_tasks_P').on('click',function(event){
              $('.debugDiv').html('collapse clicked')

              /*-- Adding height --*/
                if($(this).hasClass('expand')){
                  $(this).find('span').eq(0).text('Click to collapse')
                  $('.task_status_P_wrapper').addClass('heighAuto');
                }else{
                  $(this).find('span').eq(0).text('Click to expand');
                    $('.task_status_P_wrapper').removeClass('heighAuto');
                }

              if($(this).hasClass('expand')){
                $(this).removeClass('expand');
                $(this).addClass('collapse');
              }else{
                $(this).removeClass('collapse');
                $(this).addClass('expand');
              }
          });
          $('.task_status_P').unbind('click');
          $('.task_status_P').on('click',function(){
            var subEmail = $(this).attr('data-subs');
            var isShared = $(this).attr('data-ushared');
            $('.tasks_wrapper_dashboard').addClass('hide');
            baseObject['taskdash'] = true;
            $('.toggleTask.today').click()
            attachedEvents.searchEmailInMks(subEmail,isShared);
           
          })
            /*===========*/
          }else{
            //No task found section
            debugger;
            $('.msk_collapse_tasks_P').addClass('hide');
            $('._mks_completed_tasks').addClass('hide');
            $('.mks_task_lists_dash_wrapper .contact_found._mks_lists_tasks._mks_complete_tasks').remove();
            $('.tasks_wrapper_dashboard .mks_task_lists_dash_wrapper .content-wrapper .task_status_P_wrapper').html('<p class="not-found task-loading-nof hide">No tasks found for today.</p>');
            $('.tasks_wrapper_dashboard .mks_task_lists_dash_wrapper .content-wrapper .total-pending,._mks_completed_tasks .total-complete').text('0');
            $('._mks_lists_tasks .cf_email_wrap').remove();
            $('.task-loading-nof').text('No tasks found for today.')
          }
        }
        var generateCompleteTaskD = function(data){
          var html = '';
          html +='  <div class="contact_found _mks_lists_tasks _mks_complete_tasks" style="padding: 5px 0px;"><div class="cf_email_wrap" style="padding-left: 0px; width: 277px;">'
          html +='<div class="cf_email cf_email_taskdash">'
          html +='<div class="cf_silhouette mks_tasks_lists_empty_icon" style="margin-right:14px;">'
          html +='<div class="cf_silhouette_text c_txt_s c_txt_s_blue c_txt_s_completed ">'
          html +='<i class="mksicon-Check mks-tasklists-icons"></i>'
          html +='</div>'
          html +='</div>'
          html +='<p class="mkb_elipsis mkb_text_break">'+data.taskName+'</p>'
          if($('.toggleTask.active').hasClass('all')){
            html +=' <span class="ckvwicon mks_task_time" style="display: inline; position: absolute; top: 22px;left: 34px">'+generateDate(data.taskDate)+'</span>'
            html +=' <span class="ckvwicon" style="position: absolute; top: 22px; display: inherit; left: 148px;">'+data.subscriberInfo['firstName']+" "+data.subscriberInfo['lastName'] +'</span>'
          }else{
            html +=' <span class="ckvwicon mks_task_time" style="display: inline; position: absolute; top: 22px;left: 34px">'+generateTimeOnly(data.taskDate)+'</span>'
            html +=' <span class="ckvwicon" style="position: absolute; top: 22px; display: inherit; left: 88px;">'+data.subscriberInfo['firstName']+" "+data.subscriberInfo['lastName'] +'</span>'
          }
          html +='</div>'
          html +='<div class="cf_task_right">'
          html +='<span style="top:-18px;right:35px;" class="mks_priority_icon '+priorityIcons[data.priority]["topClass"]+'">'
          html +='<i class="'+priorityIcons[data.priority]["icon"]+'"></i>'
          html +='</span>'
          html +='<div class="cf_silhouette" style="position:relative;left:9px;">'
          html +='<div class="cf_silhouette_text c_txt_s c_txt_s_blue _mks_task-lists_silhouette_text _mks_task_dash_board_icon_silhouette">'
          html +='<i class="'+mapicons[data.taskType]+' mks-tasklists-icons"></i>'
          html +='</div>'
          html +='</div>'
          html +='</div>'
          html +='</div>'
          html +='<div class="clr"></div></div>';
          return html;
        }
        var generatePendingTaskD = function(data){
          var html = '';
          var userShared = (data.subscriberInfo['userId'] != baseObject.users_details[0].userId) ? "Y" : "N";
          html +=' <div class="contact_found _mks_lists_tasks  task_status_P" data-subs='+data.subscriberInfo['email']+' data-ushared="'+userShared+'"  style="padding: 5px 8px;"><div class="cf_email_wrap" style="padding-left: 0px; width: 277px;">'
          html +=' <div class="cf_email cf_email_taskdash">'
          html +=' <div data-tip="Click to complete" class="cf_silhouette mks_tasks_lists_empty_icon" currentitem="false">'
          html +=' <div subs-id="'+data.subscriberInfo['subscriberNumber.encode']+'" data-id="'+data['taskId.encode']+'" class="cf_silhouette_text c_txt_s c_txt_s_blue c_txt_s_empty c_txt_s_mark_complete">'
          html +=' <i class="mksicon-Check mks-tasklists-icons" style="display: none;"></i>'
          html +=' </div>'
          html +=' </div>'
          html +=' <div class="__react_component_tooltip place-top type-dark " data-id="tooltip"></div>'
          html +=' <p title="'+data.taskName+'" class="mkb_elipsis mkb_text_break">'+data.taskName+'</p>'
          if($('.toggleTask.active').hasClass('all')){
            html +=' <span class="ckvwicon mks_task_time" style="display: inline; position: absolute; top: 22px;left: 26px">'+generateDate(data.taskDate)+'</span>'
            html +=' <span class="ckvwicon" style="position: absolute; top: 22px; display: inherit; left: 140px;">'+data.subscriberInfo['firstName']+" "+data.subscriberInfo['lastName'] +'</span>'
          }else{
            html +=' <span class="ckvwicon mks_task_time" style="display: inline; position: absolute; top: 22px;left: 26px">'+generateTimeOnly(data.taskDate)+'</span>'
            html +=' <span class="ckvwicon" style="position: absolute; top: 22px; display: inherit; left: 80px;">'+data.subscriberInfo['firstName']+" "+data.subscriberInfo['lastName'] +'</span>'
          }
          html +=' </div>'
          html +=' <div class="cf_task_right">'
          html +=' <span data-tip="'+data.priority+'" class="mks_priority_icon '+priorityIcons[data.priority]["topClass"]+'" currentitem="false">'
          html +=' <i class="'+priorityIcons[data.priority]["icon"]+'"></i>';
          html +=' <div class="__react_component_tooltip place-top type-dark " data-id="tooltip"></div>'
          html +=' </span>'
          html +=' <div class="cf_silhouette" style="top: -2px;position: relative;">'
          html +='<div data-tip="'+data.taskName+'" class="cf_silhouette_text c_txt_s c_txt_s_blue _mks_task-lists_silhouette_text _mks_task_dash_board_icon_silhouette" currentitem="false">'
          html +='<i class="'+mapicons[data.taskType]+' mks-tasklists-icons"></i>'
          html +='<div class="__react_component_tooltip place-top type-dark " data-id="tooltip"></div>'
          html +='</div>'
          html +='</div>'
          html +='</div>'
          html +='</div>'
          html +=' <div class="clr"></div></div>';
          return html;
        }
        var toggleTasks = function(){
          $('.toggleTask').on('click',function(){
            $(this).parent().find('a').removeClass('active');
            $(this).addClass('active');
            if($(this).hasClass('all')){
              $('.mks_task_lists_dash_wrapper .total-text').addClass('gap-created')
              $('.mks_task_lists_dash_wrapper .total-text').text('tasks')
              $('._mks_completed_tasks .total-text').text('completed')
            }else{
              $('.mks_task_lists_dash_wrapper .total-text').removeClass('gap-created')
              $('.mks_task_lists_dash_wrapper .total-text').text('task(s) for today')
            }
            $('.contacts-select-by select').find('option[value="-1"]').attr("selected",true);
            getTasksDashBoard($(this))
          })
        }
        var selectPriorityTask = function(){
          $('.contacts-select-by select').on('change',function(){
            if($(this).val() != "-1"){
              debugger;
              if($(this.options[this.selectedIndex]).closest('optgroup').prop('label') == "Tasks Types"){
                getTasksDashBoardByTask($(this).val());
              }else{
                getTasksDashBoradByPT($(this).val())
              }
            }else{
              getTasksDashBoard();
            }
          })
        }
        return {
          attachTasksEvents : attachTasksEvents,
          addNewTasks : addNewTasks,
          getTasks:getTasks,
          showTasksDialog : showTasksDialog,
          getTasksDashBoard : getTasksDashBoard,
          toggleTasks : toggleTasks,
          selectPriorityTask : selectPriorityTask,
          getTasksByTask : getTasksByTask,
          getTasksByPT : getTasksByPT
        }
       })();
       /*----- Notes Module ----*/
       var notesModule = (function(){
        var noteID = null;
        var notesArry = [];
        var noteObj = '';
          var saveNotes = function(){
            if($('#note_textarea').val()==""){
              return;
            }
            commonModule.showLoadingMask({message : 'Saving new note...', container:'._mks_NotesWrap'})
            var url = baseObject.baseUrl+'/io/subscriber/comments/?BMS_REQ_TK='+baseObject.users_details[0].bmsToken+'&type=add';
            var reqObj = {
                            subNum: baseObject.subNum
                          ,comments: commonModule.encodeHTML($('#note_textarea').val())
                          ,ukey: baseObject.users_details[0].userKey
                          ,isMobileLogin:'Y'
                          ,userId:baseObject.users_details[0].userId
                        }
            commonModule.saveData(url,reqObj,function(response){
              $('#note_textarea').val('');
              getNotes()
              commonModule.hideLoadingMask();
            })
          }
          var getNotes = function(){
            var Url = baseObject.baseUrl
                            +'/io/subscriber/comments/?BMS_REQ_TK='
                            + baseObject.users_details[0].bmsToken +'&type=getComments&subNum='+baseObject.subNum+'&ukey='+baseObject.users_details[0].userKey
                            +'&isMobileLogin=Y&orderBy=updationTime&order=desc&userId='+baseObject.users_details[0].userId;
            commonModule.getDataRequest(Url,generateNotes);
          }
          var generateNotes = function(data){
            if(parseInt(data.totalCount) > 0){
              var htmlObj = '';
              $('.notes_lists_wrap').find('.not-found').remove();
              $.each(data.comments[0],function(key,value){
                notesArry.push(value[0])
                var _date = moment(commonModule.decodeHTML(value[0].updationDate),'YYYY-M-D H:m');
                var user = (value[0].commentAddedBy == baseObject.users_details[0].userId) ? "You" : value[0].userId;
                var format = {date: _date.format("DD MMM YYYY"), time: _date.format("hh:mm A")};
                htmlObj += '<li class="_mks_item">'
                htmlObj += '<div class="cf_silhouette">'
                htmlObj += '<div data-id="'+value[0]['commentId.encode']+'" class="mks-notestEdit-wrap cf_silhouette_text c_txt_s pclr8 hide">'
                htmlObj += '<i class="mksicon-Edit mks-task-icons"></i>'
                htmlObj += '</div>'
                htmlObj += '<div data-id="'+value[0]['commentId.encode']+'" class="mks-notestDel-wrap cf_silhouette_text c_txt_s pclr12 hide">'
                htmlObj += '<i class="mksicon-Delete mks-task-icons"></i>'
                htmlObj += '</div>'
                htmlObj += '<div class="mks-notestNote-wrap cf_silhouette_text c_txt_s pclr15">'
                htmlObj += '<i class="mksicon-Notepad mks-task-icons"></i>'
                htmlObj += '</div>'
                htmlObj += '</div>'
                htmlObj += '<div class="cf_email_wrap">'
                htmlObj += '<div class="cf_email">'
                htmlObj += '<span class="mkb_text_break" title="'+commonModule.decodeHTML(value[0].comment,true)+'">'+commonModule.decodeHTML(value[0].comment,true)+'</span>'
                htmlObj += '<p>'
                htmlObj += '<strong>'+user+' </strong> made a note at '+format.time+', '+format.date+'</p>'
                htmlObj += '</div>'
                htmlObj += '</div>'
                htmlObj += '</li>' 
              })
              $('.notes_lists_wrap ul').html(htmlObj);
              $('.notes_lists_wrap ul').removeClass('hide');
              //show/hide collapsable
              var heightofNotes = 0;
              $.each($('._mks_item'),function(key,val){
                heightofNotes = heightofNotes + $(val).outerHeight();
              })
              if(heightofNotes > 140){
                $('.notes_collapse').removeClass('hide');
              }else{
                $('.notes_collapse').addClass('hide')
              }
            }else{
              $('.notes_lists_wrap ul').addClass('hide');
              $('.notes_lists_wrap .not-found').remove();
              $('.notes_lists_wrap').append('<p class="not-found">No tasks found.</p>')
                $('.notes_collapse').addClass('hide');
            }
            attachEvents()
          }
          var attachEvents = function(){
            $('.mkb_notes-close').unbind('click');
            $('.mkb_notes-close').on('click',function(){
             $(this).addClass('hide');
             $('.mkb_notes-save').removeClass('hide');
             $('.mkb_notes-update').addClass('hide');
             $('#note_textarea').val('');
            })

            //Delete 
            $('.mks-notestDel-wrap').unbind('click');
            $('.mks-notestDel-wrap').on('click',function(){
              noteID = $(this).attr('data-id');
                var bodyHtml = '<p>Are you sure you want to delete this note?</p>';
              dialogModule.dialogView({showTitle:'Delete Note',childrenView : bodyHtml, additionalClass : 'addToSuppressWrapper',container : '.top_managerLists_wrappers',saveCallBack : deleteNotes,buttonText:'Delete' })
            });
            // Edit 
            $('.mks-notestEdit-wrap').unbind('click');
            $('.mks-notestEdit-wrap').on('click',function(){
              noteID = $(this).attr('data-id');
              
              $.each(notesArry,function(key,value){
                if(value['commentId.encode'] == noteID){
                  noteObj = value;
                }
              });
              console.log(noteObj);
              $('#note_textarea').val(commonModule.decodeHTML(noteObj.comment,true));
              $('.mkb_notes-close').removeClass('hide');
              $('.mkb_notes-save').addClass('hide');
              $('.mkb_notes-update').removeClass('hide');
              
            });
            // Update
            $('.mkb_notes-update').unbind('click');
            $('.mkb_notes-update').on('click',function(){
                var note = $('#note_textarea').val();
                var url = baseObject.baseUrl+'/io/subscriber/comments/?BMS_REQ_TK='+baseObject.users_details[0].bmsToken+'&type=update';
                var reqObj = {
                  subNum: baseObject.subNum
                  ,updatedComment:commonModule.encodeHTML(note)
                  ,commentId:noteID
                  ,ukey:baseObject.users_details[0].userKey
                  ,isMobileLogin:'Y'
                  ,userId:baseObject.users_details[0].userId
                }
                commonModule.showLoadingMask({message:'Updating Note....',container : '._mks_NotesWrap'});
                commonModule.saveData(url,reqObj,function(response){
                if(response.success){
                    commonModule.hideLoadingMask();
                    $('.mkb_notes-close').click();
                    commonModule.SuccessAlert({message :'Task Updated Successfully.'});
                    getNotes()
                }
              })
            });
            // collapse 
            $('.notes_collapse').unbind('click');
            $('.notes_collapse').on('click',function(event){
                $('.debugDiv').html('collapse clicked')

                /*-- Adding height --*/
                  if($(this).hasClass('expand')){
                    $(this).find('span').eq(0).text('Click to collapse')
                    $('.notes_lists_wrap').addClass('heighAuto');
                  }else{
                    $(this).find('span').eq(0).text('Click to expand');
                      $('.notes_lists_wrap').removeClass('heighAuto');
                  }

                if($(this).hasClass('expand')){
                  $(this).removeClass('expand');
                  $(this).addClass('collapse');
                }else{
                  $(this).removeClass('collapse');
                  $(this).addClass('expand');
                }
            });
          }
          var deleteNotes = function(){
            console.log(noteID);
            var url = baseObject.baseUrl+'/io/subscriber/comments/?BMS_REQ_TK='+baseObject.users_details[0].bmsToken+'&type=delete';
            commonModule.showLoadingMask({message:'Deleting Note....',container : '.addToSuppressWrapper'});
            var reqObj = {
              subNum: baseObject.subNum
              ,commentIds:noteID
              ,ukey:baseObject.users_details[0].userKey
              ,isMobileLogin:'Y'
              ,userId:baseObject.users_details[0].userId
            }
            commonModule.saveData(url,reqObj,function(response){
              if(response.success){
                commonModule.hideLoadingMask();
                commonModule.SuccessAlert({message :'Task Deleted Successfully.'});
                dialogModule.hideDialog();
                getNotes();
              }
            })
          }

          var editNotes = function(){

          }
          return {
            saveNotes : saveNotes,
            getNotes : getNotes,
           
          }
       })();
       /*----- Salesforce Module ----*/
       var salesForceModule = (function(){
         var addToSalesForceObj = {};
         var salesReps ="";
         var saveObject = {
          addAsVal : 'lead'
         };
         var addToSF = function(){
           console.log(baseObject);
          if(saveObject.ruleVal == 1 && saveObject.ruleIdVal == -1){
            commonModule.ErrorAlert({message:'Assign rule must be selected'});
            return false;
            }
            if(saveObject.ruleVal == 2 && saveObject.salesRepVal == -1){
              commonModule.ErrorAlert({message:'Sales Rep must be selected'});
                return false;
            }
      
            if(!baseObject.subscriberDetails.lastName){
              commonModule.ErrorAlert({message:'Please update contact Last name.'});
              return false;
            }
            else if(saveObject.addAsVal == "lead" && !baseObject.subscriberDetails.company){
              commonModule.ErrorAlert({message:'Please update contact Company name.'});
              return false;
            }
           var requestObj = {}
           var basicAr = [];
           commonModule.showLoadingMask({message:"Saving subscriber to salesforce...",container : '.mkssf_wrap_rendering'})
           $.each ($('.sf_basic_div_wrap input'),function(key,val){
            if(val.checked){
              basicAr.push(val.value)
            }
           });

           // get Custom fields
           if($('.sf_lead_custom_fields').css('display')=='block'){
            $.each($('.sf_lead_custom_fields input:checkbox:checked'),function(key,val){
              requestObj['LCust_'+key] = $(this).val();
              requestObj['SF_LCust_'+key] = $(this).parent().find('select').val();
            });
           }else{
            $.each($('.sf_contact_contact_fields input:checkbox:checked'),function(key,val){
              requestObj['CCust_'+key] = $(this).val();
              requestObj['SF_CCust_'+key] = $(this).parent().find('select').val();
            });
           }

          requestObj['BasicField'] = basicAr.toString();
          requestObj['salesStatus'] =  saveObject.addAsVal;
          requestObj['source'] = saveObject.source;
          requestObj['rule'] = saveObject['ruleVal'] 
          requestObj['ruleId']= saveObject['ruleIdVal']
          requestObj['salesRep'] = saveObject.salesRep;
          requestObj['type']   = 'addToSf';
          requestObj['subNum'] = baseObject.subNum;
          requestObj['act'] = 'add';
          requestObj['isMobileLogin']= 'Y';
          requestObj['userId'] = baseObject.users_details[0].userId
          requestObj['ukey'] = baseObject.users_details[0].userKey
          console.log(saveObject,requestObj);
          var Url = baseObject.baseUrl
          +'/io/salesforce/setData/?BMS_REQ_TK='
          + baseObject.users_details[0].bmsToken;
          commonModule.saveData(Url,requestObj,function(response){
            if(response[0]=="err"){
              commonModule.ErrorAlert({message :response[1]});
            }
            commonModule.SuccessAlert({message :response[1]});
                commonModule.hideLoadingMask();
                dialogModule.hideDialog();
          }) 
         }
         
         var showAddToSF = function(){
          var bodyHtml = ''
          bodyHtml += ' <div class="Rendering mkssf_wrap_rendering">';
          bodyHtml += ' <h4>Add as </h4>'
          bodyHtml += ' <select name="salesStatus" class="twoHunderWidth" id="first_wf_drop_down">'
          bodyHtml += ' <option value="lead">Lead</option>'
          bodyHtml += ' <option value="contact">Contact</option>'
          bodyHtml += ' </select>'
          bodyHtml += ' <h4>Source </h4>'
          bodyHtml += ' <select class="mks_sf_source source twoHunderWidth">'
          bodyHtml += ' <option value="-1">Select Source...</option>'
          bodyHtml += ' </select>'
          bodyHtml += ' <div class="sf_leads_owner show">'
          bodyHtml += ' <h4 class="mskLogog_bluetext">Lead\'s Owner</h4>'
          bodyHtml += ' <div class="sf_lead_owner_div_wrap">'
          bodyHtml += ' <input type="radio" name="lowner" value="0"><span>Do not Assign</span>'
          bodyHtml += ' </div>'
          bodyHtml += ' <div class="sf_lead_owner_div_wrap">'
          bodyHtml += ' <input type="radio" name="lowner" value="3">'
          bodyHtml += ' <span>Use SalesForce Default Assignment Rule</span>'
          bodyHtml += ' </div>'
          bodyHtml += ' <div class="sf_lead_owner_div_wrap">'
          bodyHtml += ' <input type="radio" name="lowner" value="1">'
          bodyHtml += ' <span>Use SalesForce Assignment Rule</span>'
          bodyHtml += ' <select class="hide mkssf_lead_rule">'
          bodyHtml += ' <option value="-1">Select Rule</option>'
          bodyHtml += ' </select>'
          bodyHtml += ' </div>'
          bodyHtml += ' <div class="sf_lead_owner_div_wrap">'
          bodyHtml += ' <input type="radio" name="lowner" value="2">'
          bodyHtml += ' <span>Assign To</span>'
          bodyHtml += ' <select class="hide mkssf_sales_rule" style="width: 200px;">'
          bodyHtml += ' <option value="-1">Select Salesrep</option>'
          bodyHtml += ' </select>'
          bodyHtml += ' </div>'
          bodyHtml += ' </div>'
          bodyHtml += ' <div class="sf_contacts_owner hide">'
          bodyHtml += ' <h4 class="mskLogog_bluetext">Contact Owner</h4>'
          bodyHtml += ' <div class="sf_cont_owner_div_wrap">'
          bodyHtml += ' <input type="radio" name="cowner" value="0"><span>Do not Assign</span>'
          bodyHtml += ' </div>'
          bodyHtml += ' <div class="sf_cont_owner_div_wrap">'
          bodyHtml += ' <input type="radio" name="cowner" value="2"><span>Assign To</span>'
          bodyHtml += ' <select class="hide mkssf_sales_rule">'
          bodyHtml += ' <option value="-1">Select Salesrep</option>'
          bodyHtml += ' </select>'
          bodyHtml += ' </div>'
          bodyHtml += ' </div>'
          bodyHtml += ' <div class="sf_basic_fields">'
          bodyHtml += ' <h4 class="mskLogog_bluetext">Tell Us What Fields To Include </h4>'
          bodyHtml += ' <div class="sf_basic_div_wrap"><input type="checkbox" name="firstName" value="firstName"><span>First Name</span></div>'
          bodyHtml += ' <div class="sf_basic_div_wrap"><input type="checkbox" disabled="" checked="checked" name="lastName" value="lastName"><span>Last Name</span></div>'
          bodyHtml += ' <div class="sf_basic_div_wrap"><input type="checkbox" disabled="" checked="checked" name="email" value="email"><span>Email</span></div>'
          bodyHtml += ' <div class="sf_basic_div_wrap show"><input type="checkbox" disabled="" checked="checked" name="company" value="company"><span>Company</span></div>'
          bodyHtml += ' <div class="sf_basic_div_wrap"><input type="checkbox" name="title" value="title"><span>Title</span></div>'
          bodyHtml += ' <div class="sf_basic_div_wrap"><input type="checkbox" name="telephone" value="telephone"><span>Telephone</span></div>'
          bodyHtml += ' <div class="sf_basic_div_wrap"><input type="checkbox" name="address1" value="address1"><span>Address 1</span></div>'
          bodyHtml += ' <div class="sf_basic_div_wrap"><input type="checkbox" name="city" value="city"><span>City</span></div>'
          bodyHtml += ' <div class="sf_basic_div_wrap"><input type="checkbox" name="state" value="state"><span>State</span></div>'
          bodyHtml += ' <div class="sf_basic_div_wrap"><input type="checkbox" name="industry" value="industry"><span>Industry</span></div>'
          bodyHtml += ' <div class="sf_basic_div_wrap"><input type="checkbox" name="zip" value="zip"><span>Zip Code</span></div>'
          bodyHtml += ' <div class="sf_basic_div_wrap"><input type="checkbox" name="country" value="country"><span>Country</span></div>'
          bodyHtml += ' </div>'
          bodyHtml += ' <div class="sf_lead_custom_fields show">'
          bodyHtml += ' <h4 class="mskLogog_bluetext">Custom Field(s)</h4></div>'
          bodyHtml += ' <div class="sf_contact_contact_fields hide"><h4 class="mskLogog_bluetext">Custom Field(s)</h4>'
          bodyHtml += ' </div></div>';
          
          dialogModule.dialogView({showTitle:'Add to salesfroce',childrenView : bodyHtml, additionalClass : 'increase_dialog_size_sf',container : '.top_managerLists_wrappers',saveCallBack : addToSF,initCallBack : initApiCalls });
          event.stopPropagation();
         }
         var generateLeadCustomFields = function(){
          if(!baseObject.customFields){
            return;
          }
          var customFieldsArr = [];
          $.each(baseObject.customFields[0],function(key,value){
              customFieldsArr.push(value[0]);
          });
          
          console.log(customFieldsArr);

          var cfhtml='';
          // Lead Custom Fields 
          $('.sf_lead_custom_fields .sf_cf_div_wrap').remove();
          $.each(customFieldsArr,function(key,val){
            cfhtml += '<div class="sf_cf_div_wrap">'
            cfhtml += '<input type="checkbox" id="LCust_'+key+'" value="'+val[Object.keys(val)[0]]+'">'
            cfhtml += '<span class="sf_cus_span1">'+Object.keys(val)[0]+'</span>'
            cfhtml += '<span class="sf_cus_span2 hide" id="SF_LCust_0_label">Add at Salesforce as</span>'
            cfhtml += '<select id="SF_LCust_'+key+'" class="hide">'
            $.each(addToSalesForceObj.sfLeadCustomFields,function(key,values){
              cfhtml += '<option value="'+values.value+'">'+values.name+'</option>';
            });
            cfhtml += '</select>';
            cfhtml += '</div>';
          
          });
          $('.sf_lead_custom_fields').append(cfhtml);
          // Contact Custom Fields 
          
          $('.sf_contact_contact_fields').append(cfhtml);

          // Attached event with custom fields
          $('.sf_lead_custom_fields .sf_cf_div_wrap  input:checkbox,.sf_contact_contact_fields .sf_cf_div_wrap input:checkbox').on('change',function(event){
            console.log('cf input checkbox clicked');
            event.preventDefault();
            if($(this).prop("checked")){
              $(this).parent().find('.sf_cus_span2').removeClass('hide');
              $(this).parent().find('select').removeClass('hide');

            }else{
              $(this).parent().find('.sf_cus_span2').addClass('hide');
              $(this).parent().find('select').addClass('hide');
            }
            
            event.stopPropagation();
            return false;
          })

        } 
         var initApiCalls = function(){
          commonModule.showLoadingMask({message:"Loading...",container : '.mkssf_wrap_rendering'})
          getSalesforceData();
          
          initAttachEvents();
         } 
         var initAttachEvents = function(){
           console.log("Time to attach events");
           $('.sf_lead_owner_div_wrap').eq(0).click();
           // Change first wf  
           $('#first_wf_drop_down').on('change',function(event){
            if(event.currentTarget.value == "contact"){
              $('.sf_leads_owner').addClass('hide');
              $('.sf_contacts_owner').removeClass('hide');
              $('.sf_contact_contact_fields').removeClass('hide');
              $('.sf_lead_custom_fields').addClass('hide');
              saveObject['addAsVal'] = 'contact';
              $('.sf_cont_owner_div_wrap').eq(0).click()
            }else{
              $('.sf_leads_owner').removeClass('hide');
              $('.sf_contacts_owner').addClass('hide');
              $('.sf_contact_contact_fields').addClass('hide');
              $('.sf_lead_custom_fields').removeClass('hide');
              $('.sf_lead_owner_div_wrap').eq(0).click()
            }
           });
           // On click of radio buttons for leads
           $('.sf_leads_owner div.sf_lead_owner_div_wrap,.sf_contacts_owner div.sf_cont_owner_div_wrap').on('click',function(event){
   
            $('.sf_leads_owner div.sf_lead_owner_div_wrap select,.sf_contacts_owner div.sf_cont_owner_div_wrap select').addClass('hide');
             var $e = $(event.currentTarget);
             $e.find('input').prop("checked", true);
             saveObject['ruleVal'] = $e.find('input').val();
             saveObject['ruleIdVal'] = -1;
             if($e.find('select').length > 0){
               $e.find('select').removeClass('hide');
             }
             event.stopPropagation();
           });
           // Change of mkssf_sales_rule
           $('.mkssf_sales_rule').on('change',function(event){
             event.preventDefault();
             saveObject['salesRep'] = $(this).val(); 
           })
           $('.mkssf_lead_rule').on('change',function(event){
             event.preventDefault();
             saveObject['ruleIdVal'] = $(this).val(); 
           });
           $('.mks_sf_source').on('change',function(event){
            saveObject['source'] = $(this).val(); 
           });

          
         }
        
         var getSalesforceData = function(){
          var Url = baseObject.baseUrl
                    +'/io/salesforce/getData/?BMS_REQ_TK='
                    + baseObject.users_details[0].bmsToken +'&type=addToSfData&subNum='+baseObject.subNum
                    +'&isMobileLogin=Y&userId='+baseObject.users_details[0].userId+'&ukey='+baseObject.users_details[0].userKey;
            commonModule.getDataRequest(Url,function(res){
              if(res){
                var jsonResponse =  res;
                
                if(jsonResponse.sfContactCustomFields.length > 0 || jsonResponse.sfLeadCustomFields.length > 0 || jsonResponse.source.length > 0){
                  addToSalesForceObj['sfContactCustomFields'] =  (jsonResponse.sfContactCustomFields.length > 0) ? jsonResponse.sfContactCustomFields : []
                  addToSalesForceObj['sfLeadCustomFields'] =  (jsonResponse.sfLeadCustomFields.length > 0) ? jsonResponse.sfLeadCustomFields : [],
                  addToSalesForceObj['source'] = (jsonResponse.source.length > 0) ? jsonResponse.source : [],
                  addToSalesForceObj['rules'] = (jsonResponse.rules.length > 0) ? jsonResponse.rules : []
                }
                generateLeadCustomFields();
                commonModule.hideLoadingMask()
                getSalesrep()
              }
              
            });
            var getSalesrep = function(){
              var salesRepsArray =[];
              var Url = baseObject.baseUrl
                        +'/io/user/getSalesrepData/?BMS_REQ_TK='
                        + baseObject.users_details[0].bmsToken +'&type=allSalesreps&offset=0&bucket=1000&isMobileLogin=Y&userId='+baseObject.users_details[0].userId
                        commonModule.getDataRequest(Url,function(res){
                          var jsonResponse = res;
                          if(parseInt(jsonResponse.count) > 0){
                            console.log('Sales Reps : ',jsonResponse);
                            $.each(jsonResponse.salesreps[0],function(key,value){
                                salesRepsArray.push(value[0]);
                            });
              
                            console.log(salesRepsArray);
              
                              salesReps = salesRepsArray
                              generatesSFDropDowns();
                             
                          }
                        })
            }
            
           var generatesSFDropDowns = function(){
              $.each(addToSalesForceObj.source, function(key,value){
                $('.mkssf_wrap_rendering .mks_sf_source').append('<option value="'+value+'">'+value+'</option>');
              });
              $.each(addToSalesForceObj.rules,function(key,val){
                $('.mkssf_wrap_rendering .mkssf_lead_rule').append('<option value="'+val.value+'">'+val.name+'</option>')
              });
              $.each(salesReps,function(k,v){
                $('.mkssf_wrap_rendering .mkssf_sales_rule').append('<option value="'+v.name+'">'+v.name+'</option>');
              })
           }
         }
         return {
          addToSF : addToSF,
          showAddToSF : showAddToSF
         }
       })()
       /*----- Timeline Module ----*/
       var activityModule = (function(){
          var flag = false;
          var mapping = {
                          "SU": {"name": "Signed Up", "action": "Form", "cssClass": "form",'icon':'mksicon-act_form','color':'blue'}
                        , "SC": {"name": "Score Changed", "action": "Score", "cssClass": "score",'color':'green','icon':'mksicon-act_score'}
                        , "A":  {"name": "Alert", "action": "Autobot", "cssClass": "alert","color":"red",'icon' : 'mksicon-act_alert'}
                        , "W":  {"name": "Workflow Wait", "action": "Workflow", "cssClass": "wait", "color":"red", 'icon':'mksicon-act_alert'}
                        , "CS": {"name": "Sent", "action": "Campaign", "cssClass": "sent","color":"green",'icon':'mksicon-ActSent'}
                        , "OP": {"name": "Opened", "action": "Campaign", "cssClass": "open","color":"blue",'icon':'mksicon-OpenMail'}
                        , "CK": {"name": "Clicked", "action": "Campaign", "cssClass": "click","color":"blue",'icon' : 'mksicon-act_click'}
                        , "WV": {"name": "Page Viewed", "action": "Web", "cssClass": "pageview","color":"blue",'icon':'mksicon-act_pageview'}
                        , "CT": {"name": "Converted", "action": "Campaign", "cssClass": "conversion","color":"red",'icon':'mksicon-act_conversion'}
                        , "TF": {"name": "Tell a friend", "action": "Campaign", "cssClass": "tellfriend",'color':'blue','icon':'mksicon-act_tellfriend'}
                        , "UN": {"name": "Unsubscribed", "action": "Campaign", "cssClass": "unsubscribe","color":"red",'icon':'mksicon-act_unsubscribe'}
                        , "SP": {"name": "Suppressed", "action": "Campaign", "cssClass": "suppress",'color':'red' ,'icon':'mksicon-act_suppress'}
                        , "CB": {"name": "Bounced", "action": "Email", "cssClass": "bounce",'color':'red','icon':'mksicon-act_bounce'}
                        , "MT": {"name": "Sent", "action": "Email", "cssClass": "sent",'color':'blue','icon':'mksicon-ActSent'}//
                        , "MC": {"name": "Clicked", "action": "Email", "cssClass": "click","color":"blue",'icon':'mksicon-act_click'}
                        , "MO": {"name": "Opened", "action": "Email", "cssClass": "open",'color':'blue','icon':'mksicon-OpenMail'}
                        , "MS": {"name": "Surpressed", "action": "Email", "cssClass": "suppress",'color':'red','icon':'mksicon-act_suppress'}//
                        , "WA": {"name": "Alert", "action": "Workflow", "cssClass": "alert",'color':'red','icon':'mksicon-act_alert'}//
                        , "WM": {"name": "Workflow Trigger Mail", "action": "Workflow", "cssClass": "wtmail",'color':'green','icon':'mksicon-act_workflow'}//
                        , "MM": {"name": "Trigger Mail Sent", "action": "Workflow", "cssClass": "wtmail",'color':'green','icon':'mksicon-act_wtmail'}//
                        , "N": {"name": "Workflow Do Nothing", "action": "Workflow", "cssClass": "alert",'color':'blue','icon':'mksicon-act_alert'}//
                    }
          var init = function(){
            $('.LoadMore').unbind('click');
            $('.LoadMore').on('click',function(){
              var offset = $(this).attr('data-nextoffset');
              $('.timeline_loading_mask').removeClass('hide');
              console.log('loadMore');
              flag = true;
              $(this).parent().addClass('hide');
              getUserTimeLine(offset);
            })
          }
          var getUserTimeLine = function(nextOffset){
            //var offset = (nextOffset) ? nextOffset : $('.act_row_wrapper .act_row:last-child').attr('next-offset');
  
              var searchUrl = baseObject.baseUrl
                  + '/io/subscriber/getData/?BMS_REQ_TK='
                  + baseObject.users_details[0].bmsToken +'&type=timeline&isFuture=N&offset='+nextOffset+'&subNum='
                  + baseObject.subNum+'&ukey='+baseObject.users_details[0].userKey
                  + '&isMobileLogin=Y&userId='+baseObject.users_details[0].userId;
                  commonModule.getDataRequest(searchUrl,generateTimeLine);
          }
          var generateTimeLine = function(data){
            console.log(baseObject);
            console.log('Flag is  ' + flag);
             if(parseInt(data.totalCount) == 0){
              //$('#mks_tab_activity .not-found').addClass('red_color_mks');
               $('#mks_tab_activity .not-found').text('No activity found.')
               return false;
             }
             $('#Activity .act_total_count').html(data.totalCount);
             if(!flag){
              $('#Activity .act_row_body_wrap').html('');
             }
             

             $.each(data.activities[0],function(kye,activity){
              if(activity[0].campaignType == "N" || activity[0].activityType == "WV"){
                CampaignCard(mapping[activity[0].activityType],activity[0]);
              }else if(activity[0].activityType == "SU"){
                  SignupCard(mapping[activity[0].activityType],activity[0]);
              }else if(activity[0].campaignType == "T"){
                  NurturetrackCard(mapping[activity[0].activityType],activity[0]);          
              }else if(activity[0].campaignType =="W"){
                  WorkflowCard(mapping[activity[0].activityType],activity[0]);
              }else if (typeof (activity[0]['singleMessageId.encode']) !== "undefined") {
                if(activity[0].activityType=="MT"){
                  mapping[activity[0].activityType]['color'] =  'green';
                }
                CampaignCard(mapping[activity[0].activityType],activity[0]);
             }else if(activity[0].activityType == "SC"){
                ScoreCard(mapping[activity[0].activityType],activity[0]) 
             }else if(activity[0].botActionType == "A"){
                AlertCard(mapping[activity[0].activityType],activity[0])
             }else if(activity[0].campaignType == "B" || typeof(activity[0]["botId.encode"])!=="undefined"){
                AlertCard(mapping[activity[0].activityType],activity[0])
            }else if( activity[0].activityType == "MM" || activity[0].activityType == "A"){
              if(typeof(activity[0]["botId.encode"]) !== "undefined"){
                                  //triggerType = {name: "Autobot", cssClass: ""};
                                  console.log('Need to handle');
                              }
                              else{
                                WorkflowCard(mapping[activity[0].activityType],activity[0])
                              }
            }else if(typeof(activity[0]["botId.encode"])!=="undefined"){
              AlertCard(mapping[activity[0].activityType],activity[0])
            }
            
            });
            var _date = moment(commonModule.decodeHTML(baseObject.creationDate), 'YYYY-M-D H:m');
            var _formatedDate = {date: _date.format("DD MMM YYYY"), time: _date.format("hh:mm A")};
            $('.show_signup').html('<span class="icon mksicon-startflag"></span>Joined on '+_formatedDate.date+','+_formatedDate.time);
            $('#Activity').removeClass('hide');
            $('.timeline_loading_mask').addClass('hide');
            $('.activityLoading').addClass('hide');
            if(data.nextOffset != "-1"){
              $('.LoadMore').removeClass('hide')
              $('.LoadMore').attr('data-nextoffset', data.nextOffset)
              init();
            }
            else{
              $('.LoadMore').parent().hide();
              $('.show_signup').removeClass('hide');
            }
            
            
          }

          var CampaignCard = function(mapping,activity,type){
              var campHTML="";
              var displayicon = (mapping.icon) ? mapping.icon : 'mksicon-Mail';
              var _hide = (activity.pageTitle) ? "hide" : "";
              var _date = moment(commonModule.decodeHTML(activity.logTime), 'M/D/YYYY h:m a');
              var _formatedDate = {date: _date.format("DD MMM YYYY"), time: _date.format("hh:mm A")};
              campHTML += '<div class="act_row '+mapping.color+'">';
              campHTML += '<span class="icon '+displayicon+'"></span>';
              campHTML += '<h5>'
              campHTML += '<a>'+( (activity.campaignName) ? commonModule.decodeHTML(activity.campaignName) : (activity.pageTitle) ? commonModule.decodeHTML(activity.pageTitle)  : commonModule.decodeHTML(activity.subject) ) +'</a></h5>';
              campHTML += '<div class="info-p">'
              campHTML += '<div class="infotxt '+_hide+'">'
              campHTML += '<strong>Subject</strong>'
              campHTML += '<a>'+commonModule.decodeHTML(activity.subject)+'</a>';
              campHTML +=  '</div>';
              if(activity.pageTitle){
              campHTML +=  '<div class="infotxt mkb_elipsis mkb_text_break">'
              campHTML +=  '<a style="color:#5c9bb5;" href="'+commonModule.decodeHTML(activity.pageURL)+'" target="_blank">'+commonModule.decodeHTML(activity.pageURL)+'</a>';
              campHTML +=   '</div>'
              }
              campHTML += '</div>'
              campHTML +=  '<div class="btm-bar ">'
              campHTML +=  '<div class="datetime">'
              campHTML +=  ' <span class="this-event-type showtooltip" style="cursor: pointer" data-original-title="Click to view this event type only">'
              campHTML +=  mapping.name;
              campHTML +=  '</span> at '+_formatedDate.time+', '+_formatedDate.date;
              campHTML +=  '</div>'
              campHTML +=  '<div class="camp_type">'
              campHTML +=  '<span class="showtooltip all-timelineFilter '+_hide+'" style="cursor: pointer" data-original-title="Click to view all Campaigns activities">'
              campHTML +=  '<i class="icon camp"></i>'
              campHTML +=  (type) ? type : "Campaign";
              campHTML +=  '</span></div>'
              campHTML +=  '</div>'
              campHTML +='</div>';
              $('.act_row_wrapper .act_row_body_wrap').append(campHTML);
          }
          var ScoreCard = function(mapping,activity){
            console.log('Score Card');
            var scoreHTML = "";
            var displayicon = (mapping.icon) ? mapping.icon : 'mksicon-Mail';
            var _subject = (activity.pageType);
            var _subjecLabel = (parseInt(activity.score)==0 ) ? "hide"  : "";
            var _score = (parseInt(activity.score) > 0) ? "+"+activity.score : (parseInt(activity.score) == 0) ? activity.score : "-"+activity.score;
            var _date = moment(commonModule.decodeHTML(activity.logTime), 'M/D/YYYY h:m a');
            var _formatedDate = {date: _date.format("DD MMM YYYY"), time: _date.format("hh:mm A")};
            if(parseInt(activity.score) < 0){
              mapping['color'] = 'red';
            }

            scoreHTML += '<div class="act_row '+mapping.color+" "+_subjecLabel+'">'
            scoreHTML += '<span class="icon '+displayicon+'"></span>'
            scoreHTML += '<h5><a>'+_score+'</a></h5>'
            scoreHTML += '<div class="info-p">'
            if(!activity.botActionType){
            scoreHTML += '<div>'
            scoreHTML += '<div class="infotxt">'
            scoreHTML +=            '<strong class="'+_subjecLabel+'">Page Type</strong>';
            scoreHTML +=           '<a>'+commonModule.decodeHTML(_subject,true)+'</a>';
            scoreHTML +=         '</div>'
            scoreHTML +=         '<div class="infotxt">'
            scoreHTML +=             '<strong class="'+_subjecLabel+'">Page URL</strong>'
            scoreHTML +=             '<a>'+commonModule.decodeHTML(activity.pageURL,true)+'</a>';
            scoreHTML +=         '</div>'
            scoreHTML +=         '</div>'
            }
             if(activity.botActionType) {
            scoreHTML += '<div class="infotxt">'
            scoreHTML += '<strong class="'+_subjecLabel+'">Bot Name</strong>'
            scoreHTML += '<a>'+commonModule.decodeHTML(activity.botLabel,true)+'</a>';
            scoreHTML += '</div> ';
            }
            scoreHTML +=  '</div>'
            scoreHTML +=  '<div class="btm-bar ">'
            scoreHTML +=  '<div class="datetime">'
            scoreHTML +=  '<span class="this-event-type showtooltip" style="cursor: pointer" data-original-title="Click to view this event type only">'
            scoreHTML +=   mapping.name;
            scoreHTML +=   '</span> at '+_formatedDate.time+','+_formatedDate.date;
            scoreHTML +=   '</div> '
            scoreHTML +=   '</div>'
            scoreHTML +=   '</div>'
       
          $('.act_row_wrapper .act_row_body_wrap').append(scoreHTML);
          }
          var NurturetrackCard = function(mapping,activity){
            var displayicon = (mapping.icon) ? mapping.icon : 'mksicon-Mail';
            var _date = moment(commonModule.decodeHTML(activity.logTime), 'M/D/YYYY h:m a');
            var _formatedDate = {date: _date.format("DD MMM YYYY"), time: _date.format("hh:mm A")};
            var ntHTML = "";
            ntHTML += '<div class="act_row '+mapping.color+'">'
            ntHTML +='<span class="icon '+displayicon+'"></span>'
            ntHTML +='<h5><a>'+commonModule.decodeHTML(activity.trackName)+'</a></h5>'
            ntHTML += '<div class="info-p">'
            ntHTML +=     ' <div class="infotxt">'
            ntHTML +=       '   <strong>Subject</strong>'
            ntHTML +=   '      <a>'+commonModule.decodeHTML(activity.subject)+'</a>'
            ntHTML +=  '    </div>'
            ntHTML += ' </div>'
            ntHTML +=' <div class="btm-bar ">'
            ntHTML +=  '   <div class="datetime">'
            ntHTML +=    '      <span class="this-event-type showtooltip" style="cursor: pointer" data-original-title="Click to view this event type only">'
            ntHTML +=  mapping.name
            ntHTML +=    '</span> at '+_formatedDate.time+','+ _formatedDate.date
            ntHTML +=  ' </div>'
            ntHTML +=    '<div class="camp_type">'
            ntHTML +=     '      <span class="showtooltip all-timelineFilter" style="cursor: pointer" data-original-title="Click to view all Campaigns activities">'
            ntHTML +=     '       Nurture Track</span>'
            ntHTML +=    '</div>'
            ntHTML += '</div>'
            ntHTML += '</div>';
             $('.act_row_wrapper .act_row_body_wrap').append(ntHTML);
          }
          var SignupCard = function(mapping,activity){
            console.log(activity);
            var displayicon = (mapping.icon) ? mapping.icon : 'mksicon-Mail';
            var _date = moment(commonModule.decodeHTML(activity.logTime), 'M/D/YYYY h:m a');
            var _formatedDate = {date: _date.format("DD MMM YYYY"), time: _date.format("hh:mm A")};
            var _subject = (activity.formName);
            var _subjecLabel = "";
            var signHTML = "";

            signHTML +='<div class="act_row '+mapping.color+'">'
            signHTML +='<span class="icon '+displayicon+'"></span>'
            signHTML +='<h5><a>'+commonModule.decodeHTML(activity.formName)+'</a></h5>'
            signHTML +='<div class="info-p">'
            signHTML +='<div class="infotxt mkb_elipsis mkb_text_break" >'
            signHTML +='<a style="color:#5c9bb5" href="'+commonModule.decodeHTML(activity.formPreviewURL,true)+'" target="_blank">'+commonModule.decodeHTML(activity.formPreviewURL,true)+'</a>';
            signHTML +='       </div>'
            signHTML +='  </div>'
            signHTML +=' <div class="btm-bar ">'
            signHTML +='     <div class="datetime">'
            signHTML +='           <span class="this-event-type showtooltip" style="cursor: pointer" data-original-title="Click to view this event type only">'
            signHTML +=mapping.name;
            signHTML +='</span> at '+_formatedDate.time+','+ _formatedDate.date;
            signHTML +='</div>'
            signHTML +='</div>'
            signHTML +='</div>'
          }

          var WorkflowCard = function(mapping,activity){
            var displayicon = (mapping.icon) ? mapping.icon : 'mksicon-Mail';
            var _date = moment(commonModule.decodeHTML(activity.logTime), 'M/D/YYYY h:m a');
            var _formatedDate = {date: _date.format("DD MMM YYYY"), time: _date.format("hh:mm A")};
            var wfHTML = "";
            wfHTML += '<div class="act_row '+mapping.color+'">'
            wfHTML += '<span class="icon '+displayicon+'"></span>'
            wfHTML += '<h5>'
            wfHTML += ' <a style="float:left;">'+commonModule.decodeHTML(activity.workflowName)+'</a>'
            if(activity.triggerOrder) {
             wfHTML += '   <span class="camp_type" style="float: unset">'
             wfHTML += '     <span class="showtooltip all-timelineFilter" style="cursor : pointer,right : 0px,position : relative,float : unset,font-weight: 100">Step '+activity.triggerOrder+'</span></span>'
              }
             if(activity.optionNumber){
              wfHTML += '  <span class="camp_type" style="float: unset">'
              wfHTML += '     <span class="showtooltip all-timelineFilter" style="cursor : pointer,right : 0px,position : relative,float : unset,font-weight: 100">Option '+activity.optionNumber+'</span></span>'
               }
              wfHTML += '</h5>'
              wfHTML += '<div class="info-p">'
               if (activity.alertComments){
                wfHTML += '    <div class="infotxt">'
                wfHTML += '   <a>'+commonModule.decodeHTML(activity.alertComments)+'</a>'
                wfHTML += '  </div>'
                 }
                if(activity.subject){
                  wfHTML += '    <div class="infotxt">'
                  wfHTML += '       <strong>Subject</strong>'
                  wfHTML += '        <a>'+commonModule.decodeHTML(activity.subject)+'</a>'
                  wfHTML += '   </div>'
                  }
                  wfHTML += '</div>'
                  wfHTML += ' <div class="btm-bar ">'
                  wfHTML += ' <div class="datetime">'
                  wfHTML += '    <span class="this-event-type showtooltip" style="cursor: pointer" data-original-title="Click to view this event type only">'
                  wfHTML += mapping.name
                  wfHTML += '    </span> at '+_formatedDate.time+', '+_formatedDate.date
                  wfHTML += '  </div>'
                  wfHTML += '<div class="camp_type">'
                  wfHTML += '       <span className="showtooltip all-timelineFilter" style="cursor: pointer" data-original-title="Click to view all Campaigns activities">'
                  wfHTML += '     <i className="icon wficon"></i>'
                  wfHTML += '     Workflow</span>'
                  wfHTML += ' </div>'
                  wfHTML += ' </div>'
                  wfHTML += '</div>';
                  $('.act_row_wrapper .act_row_body_wrap').append(wfHTML);
          }
          var AlertCard = function(mapping,activity){
            var displayicon = (mapping.icon) ? mapping.icon : 'mksicon-Mail';
            var _date = moment(commonModule.decodeHTML(activity.logTime), 'M/D/YYYY h:m a');
            var _formatedDate = {date: _date.format("DD MMM YYYY"), time: _date.format("hh:mm A")};
            var _subject = (activity.alertComments) ? activity.alertComments : (activity.subject) ? activity.subject : "";
            var _subjecLabel = (activity.subject) ? "" : "hide";
            var alertHTML = "";
            alertHTML += '<div class="act_row '+mapping.color+'">'
            alertHTML += '<span class="icon '+displayicon+'"></span>'
            alertHTML += '<h5><a>'+commonModule.decodeHTML(activity.botLabel)+'</a></h5>'
            alertHTML += '<div class="info-p">'
            alertHTML += '     <div class="infotxt">'
            alertHTML += '         <strong class="'+_subjecLabel+'">Subject</strong>'
            alertHTML += '         <a>'+commonModule.decodeHTML(_subject,true)+'</a>'
            alertHTML += '      </div>'
            alertHTML += '  </div>'
            alertHTML += ' <div class="btm-bar ">'
            alertHTML += '    <div class="datetime">'
            alertHTML += '          <span class="this-event-type showtooltip" style="cursor: pointer" data-original-title="Click to view this event type only">'
            alertHTML +=   mapping.name
            alertHTML += '            </span> at '+_formatedDate.time+', '+_formatedDate.date;
            alertHTML += '     </div>'
            alertHTML += '     <div class="camp_type">'
            alertHTML += '              <span class="showtooltip all-timelineFilter" style="cursor: pointer" data-original-title="Click to view all Campaigns activities">'
            alertHTML += '             Autobot</span>'
            alertHTML += '      </div>'
            alertHTML += '  </div>'
            alertHTML += ' </div>';
            $('.act_row_wrapper .act_row_body_wrap').append(alertHTML);
          }
          var getServerTime = function(){
            var searchUrl = baseObject.baseUrl
            + '/io/getMetaData/?BMS_REQ_TK='
            + baseObject.users_details[0].bmsToken +'&type=time&ukey='+baseObject.users_details[0].userKey
            + '&isMobileLogin=Y&userId='+baseObject.users_details[0].userId

            commonModule.getDataRequest(searchUrl,function(data){
                var _date  = moment(commonModule.decodeHTML(data[0]),'YYYY-M-D H:m');
                var _formatedDate = {date: _date.format("DD MMM YYYY"), time: _date.format("hh:mm A")};
                $('.timestop.now span').text(_formatedDate.time+', '+_formatedDate.date)
            })
          }
          return {
            init : init,
            getUserTimeLine:getUserTimeLine,
            getServerTime : getServerTime
          }
       })();
       /*----- Suppress Module ----*/
       var compressSubs = (function(){
         var  init = function(){
          var bodyHtml = '<p>Are you sure you want to suppress this account : '+baseObject.email+'?</p>';
          dialogModule.dialogView({showTitle:'Suppress Acount',childrenView : bodyHtml, additionalClass : 'addToSuppressWrapper',container : '.top_managerLists_wrappers',saveCallBack : compressContent,buttonText:'Suppress' })
         }
         var compressContent = function(){
           //https://mks.bridgemailsystem.com/pms/io/subscriber/setData/?BMS_REQ_TK=YpErXBzNUybsRCfCLNDNfOHxLisskQ
          commonModule.showLoadingMask({message:"Suppressing..",container : '.addToSuppressWrapper'});
          var Url = baseObject.baseUrl
                  +'/io/subscriber/setData/?BMS_REQ_TK='
                  + baseObject.users_details[0].bmsToken;
                  
          var dataObj = {
            'type':'suppress'
            ,"subNum": baseObject.subNum
            ,"ukey":baseObject.users_details.userKey
            ,"isMobileLogin":'Y'
            ,"userId":baseObject.users_details[0].userId
          }
          commonModule.saveData(Url,dataObj,function(response){
            commonModule.SuccessAlert({message :'Account has been suppressed.'});
                commonModule.hideLoadingMask();
                dialogModule.hideDialog();
                $('.ms-welcome__main').addClass('mks_suppresContact');
          })
         }
          return {
            init : init
          }
       })();
       /*----- Workflow Module ----*/
       var workFlow = (function(){
        var workflowId = '';
        var getWorkflowLists= function(){
            var lists = [];
            
            var bodyHtml = '<p>Loading sequences...</p>';
                dialogModule.dialogView({showTitle:'Add to Sequence',childrenView : bodyHtml, additionalClass : 'addToSequenceDWrapper',container : '.top_managerLists_wrappers',saveCallBack : saveSubsriberToSequence,buttonText : 'Add' });
            var Url = baseObject.baseUrl
                      +'/io/workflow/getWorkflowData/?BMS_REQ_TK='
                      + baseObject.users_details[0].bmsToken +'&type=get&isManualAddition=Y&isMobileLogin=Y&userId='+baseObject.users_details[0].userId;
                      
                commonModule.getDataRequest(Url,generateWFLists); 
        }
        var init = function(){
          
          // console.log('Any events needs to attached here');
          // $('.icheckinput').iCheck({
          //   radioClass: 'iradio_square',
          //   radioClass: 'iradio_square-blue'
          // });

        }

        var saveSubsriberToSequence = function(){
            console.log('Save Workflow called');
            
            if($('.workflow_wrap_rendering select[name=selector]').val() == "-1"){
              commonModule.ErrorAlert({message:"Please select sequence"});
            }else{
              commonModule.showLoadingMask({message:"Adding subscriber to sequence..",container : '.addToSequenceDWrapper'});
              var Url = baseObject.baseUrl
                      +'/io/workflow/saveWorkflowData/?BMS_REQ_TK='
                      + baseObject.users_details[0].bmsToken +'&type=addtoworkflow';
                      
              var dataObj = {
                  "workflowId" : $('.workflow_wrap_rendering select').find(':selected').attr('data-encode'),
                  "stepOrder"  : "1",
                  "overrideRules"  : document.querySelector('input[name=iCheck]:checked').value,
                  "subscriberId" :baseObject.subNum,
                  "isMobileLogin" : "Y",
                  "userId" : baseObject.users_details[0].userId
              }
              commonModule.saveData(Url,dataObj,function(response){
                commonModule.SuccessAlert({message :response[1]});
                commonModule.hideLoadingMask();
                dialogModule.hideDialog();
              })
              
            }
           
        }
        var generateWFLists = function(data){
          console.log('Generate lists of response');
          var wfOptionList = "<option value='-1'>Select Sequence</option>";
          $.each(data.workflows,function(key,value){
            console.log(value);
            wfOptionList+='<option data-encode="'+value['workflow.encode']+'" value="'+value.name+'">'+value.name+'</option>';
          });

          $('.addToSequenceDWrapper .addBox_body').html('<div class="Rendering workflow_wrap_rendering"><h4>Choose sequence to manually add subscriber </h4><select name="selector" class="first_wf_drop_down">'+wfOptionList+'</select><h4>Override Sequence Rules:</h4><label style="float:left;" class="icheck-labels"><input class="icheckinput pull-left" value="N" type="radio" checked="checked" name="iCheck" style="float:left;width: auto;"> Allow rules to take over after this step</label><label class="icheck-labels"><input class="icheckinput  pull-left" value="Y" style="float:left;width: auto;" type="radio" checked="checked" name="iCheck"> Play sequence to completion with interruption</label></div>');
          init();
        }
        return {
          init : init,
          getWorkflowLists : getWorkflowLists
        };
       })();
       /*----- Subscriber Module ----*/
       var subsList = (function(){
        var getallLists = function(){
          var bodyHtml = '<p>Loading lists...</p>';
          dialogModule.dialogView({
            showTitle:'Add Contact to List',
            childrenView : bodyHtml,
             additionalClass : 'addContactListWrapper',
             container : '.top_managerLists_wrappers',
             saveCallBack : saveSubsriberToList,
            buttonText : 'Add' });
           
             //https://test.bridgemailsystem.com/pms/io/list/getListData/?BMS_REQ_TK=c7jJ1hJuurtB3BmDSvlO1XHDinnjMF&type=all
              var Url = baseObject.baseUrl
                      +'/io/list/getListData/?BMS_REQ_TK='
                      + baseObject.users_details[0].bmsToken +'&type=all&isMobileLogin=Y&userId='+baseObject.users_details[0].userId;
              console.log('Calling subscriber lists');
              commonModule.getDataRequest(Url,generateSubLists); 
                
          }
          var generateSubLists = function(data){
            console.log(data);
            var listLi = "";
              $.each(data.lists[0],function(key,value){
              listLi += '<li class="mngList_li_wrap">';              
              listLi += '<div class="mks_mnglist_wrap">';  
              listLi += '<input type="radio" name="list" value="'+value[0]['listNumber.encode']+'"/>';            
              listLi += '<h4 title="'+value[0].name+'">'+commonModule.decodeHTML(value[0].name)+'</h4>';                        
              listLi += '</div></li>';              
              });

            $('.addContactListWrapper .addBox_body').html('<div><input type="text" placeholder="Search lists" id="searchListInput" /></div><ul class="subsriberList-wrap">'+listLi+'</ul>');
            init();
          }
          var saveSubsriberToList = function(){
            if(!document.querySelector('ul.subsriberList-wrap li input[name=list]:checked')){
              commonModule.ErrorAlert({message : "No list selected."});
              return;
            }
            //https://test.bridgemailsystem.com/pms/io/subscriber/setData/?BMS_REQ_TK=c7jJ1hJuurtB3BmDSvlO1XHDinnjMF&type=addByEmailOnly
          //params : emails	umair@makesbridge.com , listNum	qcWRf30Qb33Ph26Ab17Hf20qcW
          var selectedListNum = document.querySelector('ul.subsriberList-wrap li input[name=list]:checked').value;
          var Url = baseObject.baseUrl
                      +'/io/subscriber/setData/?BMS_REQ_TK='
                      + baseObject.users_details[0].bmsToken +'&type=addByEmailOnly';
              commonModule.showLoadingMask({message:"Adding subscriber to list..",container : '.addContactListWrapper'});        
              var dataObj = {
                "listNum": selectedListNum
                ,"emails":baseObject.email
                ,"ukey":baseObject.users_details[0].userKey
                ,"isMobileLogin":'Y'
                ,"userId":baseObject.users_details[0].userId
              }
              commonModule.saveData(Url,dataObj,function(response){
                commonModule.SuccessAlert({message :'Subscriber added to the list.'});
                debugger;
                commonModule.hideLoadingMask();
                dialogModule.hideDialog();
              })
          }
          var searchFunc = function() {
            var input, filter, ul, li, a, i;
            input = document.getElementById("searchListInput");
            filter = input.value.toLowerCase();
            ul = $("ul.subsriberList-wrap")[0];
            li = ul.getElementsByTagName("li");
            $("ul.subsriberList-wrap li").hide();
            for (i = 0; i < li.length; i++) {
                a = li[i].getElementsByTagName("h4")[0];
                if (a.innerText.toLowerCase().indexOf(filter) > -1) {
                    li[i].style.display = "";
                } 
            }
            highlightSearchText(input.value)
        }
        var highlightSearchText = function(searchTextvalue){
          console.log('Search Text Value', searchTextvalue);
          $.each($('ul.subsriberList-wrap li h4'),function(key,val){
            $(val).removeHighlight().highlight(searchTextvalue);
          })
  
        }
          var init = function(){
            $('ul.subsriberList-wrap li').on('click',function(event){
              $(this).find('input').prop("checked", true);
            });
            $('#searchListInput').unbind('keyup');
            $('#searchListInput').on('keyup',function(event){
              searchFunc()
            })
          } 
          return {
            init : init,
            getallLists : getallLists
          }
       })();
       /*----- Manage Module ----*/
       var manageList = (function(){
          var getallLists = function(){
              var bodyHtml = '<p>Loading lists...</p>';
              dialogModule.dialogView({showTitle:'Manage list subscription',childrenView : bodyHtml, additionalClass : 'manageListWrapper',container : '.top_managerLists_wrappers',saveCallBack : updateSubsriberToList });
               //https://mks.bridgemailsystem.com/pms/io/subscriber/getData/?BMS_REQ_TK=sbTYSYUCVoJv6Gv6hfrE5WfPWcJaCK&type=getListInfo&subNum=kzaqwLc26Ee17Li20Ea21Pc30Yi33Lc26ksdrt&ukey=YI25Xbbb&isMobileLogin=Y&userId=umair
              var Url = baseObject.baseUrl
                      +'/io/subscriber/getData/?BMS_REQ_TK='
                      + baseObject.users_details[0].bmsToken +'&type=getListInfo&subNum='+baseObject.subNum+'&isMobileLogin=Y&userId='+baseObject.users_details[0].userId;

              commonModule.getDataRequest(Url,generateMLists); 
              
          }

          var init = function(){
            console.log('Init function');
          }

          var generateMLists = function(data){
            var listLi = "";
            $.each(data.listInfo[0],function(key,value){
            listLi += '<li class="mngList_li_wrap">';              
            listLi += '<div class="mks_mnglist_wrap">';              
            listLi += '<h4 title="'+value[0].listName+'">'+value[0].listName+'</h4>';              
            listLi += '<select data-listnum="'+value[0].listNumber+'" class="list-action">';

            listLi += (value[0].status == "S") ? '<option selected="selected" value="S">Subscribe</option>': '<option selected="selected" value="S">Subscribe</option>';              
            listLi +=  (value[0].status == "U") ? '<option selected="selected" value="U">Unsubscribe</option>' :'<option value="U">Unsubscribe</option>';              
            listLi += (value[0].status == "R") ? '<option selected="selected" value="R">Remove</option>' : '<option value="R">Remove</option>';              
            listLi += '</select></div></li>';              
            });

            $('.manageListWrapper .addBox_body').html('<ul class="manageList-wrap">'+listLi+'</ul>');
          }
          var updateSubsriberToList = function(){
              var listObj = {};
              $.each($('.manageList-wrap li'),function(key,value){
                listObj['listNum'+key] = $(value).find('select').attr('data-listnum');
                listObj['status'+key] = $(value).find('select').val();
              });
              commonModule.showLoadingMask({message:"Saving Lists...",container : '.addBox_body'})
              var url = baseObject.baseUrl
                      +'/io/subscriber/setData/?BMS_REQ_TK='
                      + baseObject.users_details[0].bmsToken +'&type=editListInfo&subNum='+baseObject.subNum+'&isMobileLogin=Y&userId='+baseObject.users_details[0].userId;

              commonModule.saveData(url,listObj,function(data){
                commonModule.SuccessAlert({message : data.success});
                commonModule.hideLoadingMask();
                dialogModule.hideDialog();
              });
          }
          return {
            init : init,
            getallLists : getallLists
          }
       })();
       /*----- Common Module ----*/

       var commonModule = (function(){
                                var showLoadingMask = function(paramObj){
                                  var loadingHtml = "";
                                  loadingHtml += '<div class="loader-mask '+paramObj.extraClass+'">'
                                  loadingHtml += '<div class="spinner">'
                                  loadingHtml += '<div class="bounce1"></div>'
                                  loadingHtml += '<div class="bounce2"></div>'
                                  loadingHtml += '<div class="bounce3"></div>'
                                  loadingHtml +=  '</div>'
                                  loadingHtml +=   '<p>'+paramObj.message+'</p>'
                                  loadingHtml +=    '</div>';
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
                                              $('.debugDiv').html(JSON.stringify(data))
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
                                            console.log(e);
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

                                                  setTimeout(function(){
                                                    message_box.fadeOut("fast", function () {
                                                        $(this).remove();
                                                    })
                                                  }, 4000);

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
                               var setCookie = function (cname, cvalue, exdays) {
                                  var d = new Date();
                                  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
                                  var expires = "expires="+d.toUTCString();
                                  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
                               }
                                return {
                                  showLoadingMask: showLoadingMask,
                                  hideLoadingMask: hideLoadingMask,
                                  getDataRequest : getDataRequest,
                                  saveData : saveData,
                                  encodeHTML : encodeHTML,
                                  decodeHTML : decodeHTML,
                                  ErrorAlert : ErrorAlert,
                                  SuccessAlert : SuccessAlert,
                                  setCookie : setCookie
                                };
                           })();
       $('#username').val('ahyan');
       } catch(e){
         console.log(e);
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
