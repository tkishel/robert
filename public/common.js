var global_logged_in

jQuery(function() {

  var $header_where          = $("header#application_header h1#header_where");
  var $application_name      = $("nav#application_name h1");

  var $lock_button           = $("header#application_header nav a[href='#toggle_lock']");

  var $login_modal_dialog    = $("#login_modal_dialog");
  var $login_inner_section   = $("#login_modal_dialog section");
  var $login_user_field      = $("#login_modal_dialog section input[type='text']");
  var $login_password_field  = $("#login_modal_dialog section input[type='password']");
  var $login_button          = $("#login_modal_dialog section login_button");

  var $working_dialog        = $("#working_dialog");
  var $working_dialog_status = $("#working_dialog_status");

  var $search_field          = $("nav#things header input[type='search']");
  var $things_list           = $("nav#things ul");
  var $things_list_item      = $("nav#things ul li");
  var $thing_section         = $("section#thing");

  var logged_in  = false;
  var thing_changed  = false;

  $header_where.text($application_name.text());

  $.get("/login", function(res){
    if (res.logged_in == true){
      isLoggedIn();
    }
  });

  $(window).load(function(){
    var loc = window.location.search;
    
    if (loc == "?show_login=true"){
      if (logged_in){
        //alert('You are not logged in.')
      } else {
        $login_modal_dialog.fadeIn('fast');
        $login_user_field.focus();
        $login_password_field;
        }
      }
  });

  $things_list.height( $(window).height() - 44 - 39 );
  $thing_section.height( $(window).height() - 44 - 100 );

  $(window).resize(function(){
    $things_list.height( $(window).height() - 44 - 39 );
    $thing_section.height( $(window).height() - 44 - 100 );
  });

  $search_field.keyup(search_list);
  $search_field.click(search_list);

  function search_list(){
    var query = $search_field.val().toLowerCase();
    var compare = '';
      $things_list_item.each(function(i){
        compare = $("h5", this).text().toLowerCase();
        if (compare.search(query) == -1){
          $(this).hide();
        } else {
          $(this).show();
        }
      });
  }

  $things_list_item.click(function(){
    var selected_item = $("nav#things ul li.active");
    $("nav#things ul li.active").removeClass('active');
    $(this).addClass('active');
  });

  $lock_button.click(function(e){
    e.preventDefault();
    if (logged_in){
      logOut();
    } else {
      $login_modal_dialog.fadeIn('fast');
      $login_user_field.focus();
      $login_password_field;
    }
  });

  $login_button.click(function(e){
    e.preventDefault();
    tryLogIn();
  });

  $login_user_field.keyup(function(e){
    if (e.keyCode == 13){ // pressed ENTER
      tryLogIn();
    }
  });

  $login_password_field.keyup(function(e){
    // e.preventDefault();
    if (e.keyCode == 13){ // pressed ENTER
      tryLogIn();
    }
  });

  $login_modal_dialog.click(function(e){
    if (e.target.className == "overlay"){
      $login_modal_dialog.fadeOut('fast');      
    }
  });

  function tryLogIn(){
    var user = $login_user_field.val();
    var pass = $login_password_field.val();
    $.post("/login", { username: user, password: pass }, function(res){
      if (res.logged_in == true){
        $login_modal_dialog.fadeOut('fast');
        isLoggedIn();
      } else {
        $login_inner_section.animate({left: "-=10px"},70).animate({left: "+=20px"},70).animate({left: "-=10px"},70);
      }
    });
  }
    
  function logOut(){
    $.post("/logout", function(res){
      global_logged_in = false
      logged_in = false;
      $lock_button.removeClass("unlocked");
    });
  }

  function isLoggedIn(){
    global_logged_in = true
    logged_in = true;
    $lock_button.addClass("unlocked");
    $login_password_field.val('');
  }

  function showWorking(){
    $working_dialog_status.text('Working');
    $working_dialog.fadeIn('fast');
  };

  function hideWorking(){
    $working_dialog.fadeOut('fast');
    $working_dialog_status.text('Working');
  };

});