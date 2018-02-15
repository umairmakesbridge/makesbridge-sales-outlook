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
      var _mailbox = Office.context.mailbox;
      var _settings = Office.context.roamingSettings;
       // Obtains the current item.
       $("#error").html("mail box");
       try {
       var item = _mailbox.item;
       var emailsHTML = "";
       var emailCount = 0;

       emailsHTML += `<div class="contact_found ripple">
                       <div class="cf_silhouette">
                         <div class="cf_silhouette_text c_txt_s"><p>`+item.sender.emailAddress.charAt(0)+`</p>
                         </div>
                     </div>
                     <div class="cf_email_wrap">
                       <div class="cf_email">
                         <p>`+item.sender.emailAddress+`</p>
                       </div>
                     </div>`;
       emailCount = emailCount + 1;

       var toEmail = item.to;
       for (var i=0;i <toEmail.length;i++){
          emailsHTML +=`<div class="contact_found ripple">
                          <div class="cf_silhouette">
                            <div class="cf_silhouette_text c_txt_s"><p>`+toEmail[i].emailAddress.charAt(0)+`</p>
                            </div>
                        </div>
                        <div class="cf_email_wrap">
                          <div class="cf_email">
                            <p>`+toEmail[i].emailAddress+`</p>
                          </div>
                        </div>`;
          emailCount = emailCount + 1;
       }

       var ccEmail = item.cc;
       for (var i=0;i <ccEmail.length;i++){
          emailsHTML += `<div class="contact_found ripple">
                          <div class="cf_silhouette">
                            <div class="cf_silhouette_text c_txt_s"><p>`+ccEmail[i].emailAddress.charAt(0)+`</p>
                            </div>
                        </div>
                        <div class="cf_email_wrap">
                          <div class="cf_email">
                            <p>`+ccEmail[i].emailAddress+`</p>
                          </div>
                        </div>`;
          emailCount = emailCount + 1;
       }




       $(".emails_lists_from_body").html(emailsHTML);
       $(".email_found_in_message .total-count").html(emailCount);



       $("#error").html(item.itemType);

       /*----- Global Object ----*/
       var baseObject = {
            baseUrl   : 'https://test.bridgemailsystem.com/pms',
            users_details    : [],
            gmail_email_list : []
       }
       /*-----------Common Event Attach-------------*/
       var attachedEvents = (function(){
         var attachedSearchMks = function(params){
           $('.mksSearchEmail').keypress(function(event){
              if(event.which == 13){

                if($('.toggletags').text().toLowerCase()=="tags"){
                  var searchUrl = baseObject.baseUrl+'/io/subscriber/getData/?BMS_REQ_TK='
                                  + baseObject.users_details[0].bmsToken +'&type=getSAMSubscriberList&offset=0&searchTag='
                                  +event.currentTarget.value+'&orderBy=lastActivityDate&ukey='+baseObject.users_details[0].userKey
                                  +'&isMobileLogin=Y&userId='+baseObject.users_details[0].userId;
                }else{
                  var searchUrl = baseObject.baseUrl+'/io/subscriber/getData/?BMS_REQ_TK='
                                  + baseObject.users_details[0].bmsToken +'&type=getSAMSubscriberList&offset=0&searchValue='
                                  +event.currentTarget.value+'&orderBy=lastActivityDate&ukey='+baseObject.users_details[0].userKey
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
                          $('.searched_results_wrap .total-count-head .total-text').html(`Contacts found containing text '`+event.currentTarget.value+`'`);
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
           });
         }

         var switchContactsTags = function(){
           $('.toggletags').on("click",function(){
                $('.toggletags').removeClass('active');
                $(this).addClass('active');
                $('.mksSearchEmail').val('');
                $('.searched_results_wrap').hide();
           });
         }
         return {
           attachedSearchMks : attachedSearchMks,
           switchContactsTags : switchContactsTags
         };
       })()
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

                                return {
                                  showLoadingMask: showLoadingMask,
                                  hideLoadingMask: hideLoadingMask
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
                                    $('.mksph_cardbox').append(data);
                                    commonModule.hideLoadingMask();
                                    _settings.set("cookie", Date());
                                    $('.login-wrap').hide();
                                    $('.ms-welcome__main').show();
                                    baseObject.users_details.push(data);
                                    //localStorage.setItem('pmks_userpass', this.state.username+'__'+this.state.password);
                                    attachedEvents.attachedSearchMks();
                                    attachedEvents.switchContactsTags();
                                  }
                                });

                          };

                          var init = function (text) {
                            //loginAjaxCall(text);

                            $('#submitForm').click(function(event){
                              commonModule.showLoadingMask({message:"Logging user...",container : '.mksph_login_wrap'});
                              var username = $('#username').val();
                              var password = $('#password').val();
                              loginAjaxCall({url:baseObject.baseUrl,username:username,password:password});
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
