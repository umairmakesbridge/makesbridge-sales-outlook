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
       // Obtains the current item.
       $("#error").html("mail box");
       try {
       var item = _mailbox.item;
       var emailsHTML = "";
       var emailCount = 0;

       emailsHTML += "<li>"+item.sender.emailAddress+"</li>";
       emailCount = emailCount + 1;

       var toEmail = item.to;
       for (var i=0;i <toEmail.length;i++){
          emailsHTML += "<li>"+toEmail[i].emailAddress+"</li>";
          emailCount = emailCount + 1;
       }

       var ccEmail = item.cc;
       for (var i=0;i <ccEmail.length;i++){
          emailsHTML += "<li>"+ccEmail[i].emailAddress+"</li>";
          emailCount = emailCount + 1;
       }




       $(".emails ul").html(emailsHTML);
       $(".emailsfound").html(emailCount+" emails found in this message");

       $("#error").html(item.itemType);

       /*----- Global Object ----*/
       var baseObject = {
            baseUrl   : 'https://test.bridgemailsystem.com/pms',
            users_details    : [],
            gmail_email_list : []
       }
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
                                    $('.login-wrap').hide();
                                    $('.ms-welcome__main').show();
                                  }
                                });

                          };

                          var init = function (text) {
                            //loginAjaxCall(text);

                            $('#submitForm').click(function(event){
                              debugger;
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
