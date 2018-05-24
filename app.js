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
                     var result = JSON.parse(data);
                     if(result.totalCount==0){
                      commonModule.hideLoadingMask();
                      debugger;
                      $('.searched_results_wrap .total-count-head').hide();
                      $('.searched_results_wrap').show();
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
                          }
                          var generateBasicCustomFields = function(data){

                            /*--- Calling User Timeline---*/
                            $('.activityLoading .not-found').text('Loading Timeline...')
                            activityModule.getUserTimeLine(0);
                            activityModule.getServerTime()
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
                          var saveBasicAdvanceFields = function(){
                            var searlizeBasicObj = {};
                            $('.debugDiv').html('Save Basic Adv Function Called');
                            $.each($('.mkb_basicField_wrap input'),function(key,value){
                               searlizeBasicObj[$(value).attr('name')] = $(value).val();
                            });
                            searlizeBasicObj['email']  = $('.mks_createContact_ .scf_email p').text();

                            searlizeBasicObj['listNum']  = baseObject.users_details[0].listObj['listNum'];
                            $('.debugDiv').html(JSON.stringify(searlizeBasicObj));
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

                            commonModule.showLoadingMask({message:"Updating contact...",container : '.new_contact_false'});
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
                                
                                 event.stopPropagation()
                              });
                              $('.addTagWrapper .scfe_close_wrap').on('click',function(){
                                  $(this).parents('.addTagWrapper').hide();
                                  $('.addTag').show();
                              });

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

                          return {
                            init: init,
                            extractSubscriberDetails : extractSubscriberDetails,
                            getSubscriberDetails   : getSubscriberDetails,
                            generateBasicCustomFields : generateBasicCustomFields
                          };

                        })();


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

            $('.addContactListWrapper .addBox_body').html('<div><input type="text" placeholder="Search lists" id="searchListInput" style="display:none" /></div><ul class="subsriberList-wrap">'+listLi+'</ul>');
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
       //$('#username').val('ahyan');
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
