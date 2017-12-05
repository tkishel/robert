jQuery(function() {
  var $search_field              = $("nav#things header input[type='search']");

  var $things_list               = $("nav#things ul#people");
  var $things_list_item          = $("nav#things ul li");

  var $thing_section             = $("section#thing");

  // header
  var $thing_avatar              = $("section#thing img#avatar");
  var $thing_name                = $("section#thing section h1");
  var $thing_title               = $("section#thing section h2");

  var $thing_details             = $("section#thing dl#thing_details");
  // details
  var $thing_bribemewith         = $("section#thing dl dd#bribemewith");
  var $thing_dietaryrestrictions = $("section#thing dl dd#dietaryrestrictions");
  var $thing_github              = $("section#thing dl dd#github");
  var $thing_interestingfact     = $("section#thing dl dd#interestingfact");
  var $thing_ircnickname         = $("section#thing dl dd#ircnickname");
  var $thing_languages           = $("section#thing dl dd#languages");
  var $thing_mail                = $("section#thing dl dd#mail");
  var $thing_manager             = $("section#thing dl dd#manager");
  var $thing_mobile              = $("section#thing dl dd#mobile");
  var $thing_newer               = $("section#thing dl dd#newer");
  var $thing_office              = $("section#thing dl dd#office");
  var $thing_orgteam             = $("section#thing dl dd#orgteam");
  var $thing_ou                  = $("section#thing dl dd#ou");
  var $thing_personaltitle       = $("section#thing dl dd#personaltitle");
  var $thing_pseudonym           = $("section#thing dl dd#pseudonym");
  var $thing_reports             = $("section#thing dl dd#reports");
  var $thing_shirtsize           = $("section#thing dl dd#shirtsize");
  var $thing_skills              = $("section#thing dl dd#skills");
  var $thing_twiterhandle        = $("section#thing dl dd#twiterhandle");

  var $map                       = $("section#location");
  var $map_image                 = $("section#location img#current_location");

  var $edit_controls             = $(".edit_controls");
  var $location_selector         = $(".edit_controls select");
  var $file_button               = $("input[type='file']");
  var $save_button               = $("a[href='#save']");

  var location = '';
  var location_x = 0;
  var location_y = 0;
  var down_on_map  = false;
  var dragging_map = false;
  var drag_prev_x = 0;
  var drag_prev_y = 0;

  var thing_changed    = false;
  var location_changed = false;

  Dropzone.autoDiscover = false;
  var photo_dropzone = new Dropzone(document.body, { 
    acceptedFiles: 'image/jpeg,image/png',
    // Enable to use the Save Button for the photo.
    // autoProcessQueue: false,
    clickable: false,
    paramName: 'photo_upload',
    previewsContainer: "img#avatar",
    uploadMultiple: false,
    url: '/person/upload_photo/'
  });

  // Enable to use the Save Button for the photo.
  //  photo_dropzone.on('addedfile', function(file, text) {
  //    //$save_button.addClass('active');
  //  });

  // A successful dropzone upload returns an person object as JSON.
  // Use it to update the photo URL. Use the date as a param to prevent caching.

  photo_dropzone.on('success', function(file, data) {
    d = new Date();
    $thing_avatar.attr('src', '/avatars/' + data.jpegphotofile + '?' + d.getTime());
    var $selected_item = $("nav#things ul#people li.active");
    var $selected_item_images = $selected_item.children('img');
    $selected_item_images.attr('src', '/avatars/' + data.jpegphotofile + '?' + d.getTime());
  });

  $edit_controls.hide();

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
    var this_name = '';
    var this_title = '';
    $things_list_item.each(function(i){
      this_name = $('h3', this).text().toLowerCase();
      this_title = $('h4', this).text().toLowerCase();
      if (this_name.search(query) == -1 && this_title.search(query) == -1){
        $(this).hide();
      } else {
        $(this).show();
      }
    });
  }

  $("#thing").keyup(function(){
    thing_changed = true;
    $save_button.addClass('active');
  });

  $location_selector.change(function(e){
    if($(this).val() == 'Other'){
      $map_image.hide();
      $map.children("#marker").hide();
      return;
    }
    var new_location = e.target.options[e.target.selectedIndex].text;
    if (new_location != location) $map.children("#marker").hide();
    else $map.children("#marker").show();
    $map_image.attr('src', '/images/' + new_location + '.png');
    $map_image.show();
  });

  $map_image.mousedown(function(e){
    e.preventDefault();
    down_on_map = true;
    drag_prev_x = e.pageX;
    drag_prev_y = e.pageY;
  });

  $('body').mousemove(function(e){
    if (down_on_map){
      dragging_map = true;
    }
    if (dragging_map){
      e.preventDefault();
      var mx = e.pageX - drag_prev_x;
      var my = e.pageY - drag_prev_y;
      
      var left = parseInt($map_image.css('left').slice(0, $map_image.css('left').length - 2)) + mx;
      var top = parseInt($map_image.css('top').slice(0, $map_image.css('top').length - 2)) + my;
      $map_image.css('left', left + 'px');
      $map_image.css('top', top + 'px');
      
      var $marker = $("section#location img#marker");
      left = parseInt($marker.css('left').slice(0, $marker.css('left').length - 2)) + mx;
      top = parseInt($marker.css('top').slice(0, $marker.css('top').length - 2)) + my;
      $marker.css('left', left + 'px');
      $marker.css('top', top + 'px');
      
      drag_prev_x = e.pageX;
      drag_prev_y = e.pageY;
    }
  })

  $("body").mouseup(function(e){
    if (dragging_map){
      e.preventDefault();
      dragging_map = false;      
    } else if (down_on_map){
      var container_pos = $map.position();
      var click_pos = { x: e.pageX, y: e.pageY };
      var relative_pos = { x: click_pos.x - container_pos.left - 5, y: click_pos.y - container_pos.top - 45};
      var map_offset = $map_image.position();
      var map_click_pos = { x: relative_pos.x + -map_offset.left, y: relative_pos.y + -map_offset.top };
      location_x = 2500 - map_click_pos.x;
      location_y = map_click_pos.y;
      var location = $location_selector.val();
      if (location == 'Other') location = '';
      animate_map();
      location_changed = true;
      $save_button.addClass('active');
    }
    down_on_map = false;
  })

  function animate_map(){
    var $img = $("section#location img#current_location");
    var $marker = $("section#location img#marker");
    
    var left = -( (2500 - location_x) - 300);
    var top = -( (location_y) - 150);
    $img.animate({left: left, top: top}, 500);
    
    $marker.show();
    $marker.animate({left: 300, top: 150}, 500);

    if (location) {
      $map_image.show();
      $location_selector.val(location);
    } else {
      $location_selector.val('Other');
    }
  }

  $save_button.click(function(e){
    if (! global_logged_in) return;
    e.preventDefault();

    if (! $save_button.hasClass('active')) return;

    var person = {};

    // Enable to use the Save Button for the photo.
    // photo_dropzone.processQueue()
    
    if (location_changed) {
      var this_location = $location_selector.val();
      if (this_location == 'Other') this_location = '';

      person.location   = this_location;
      person.location_x = location_x;
      person.location_y = location_y;

      var uid = $("nav#things ul#people li.active").data('id');
      $.ajax({type: 'POST', url: '/person/update/' + uid, data: {person: person}, dataType: 'json', success: person_update_callback, error: error_callback});
    }  
  });

  $things_list_item.click(function(e){
    if ( (location_changed || thing_changed) && confirm("Discard your changes?") ){
      // Meh
    } else {
      location_changed = thing_changed = false;
      $save_button.removeClass('active');
    }

    if ( $(this).parent().attr('id') == "people" ){
      photo_dropzone.disable();
      $thing_details.hide();
      // header
      $thing_name.text('');
      $thing_name.data('uid', '');
      $thing_title.text('');
      // details
      $thing_bribemewith.text('');
      $thing_dietaryrestrictions.text('');
      $thing_github.text('');
      $thing_interestingfact.text('');
      $thing_ircnickname.text('');
      $thing_languages.text('');
      $thing_mail.text('');
      $thing_manager.text('');
      $thing_mobile.text('');
      $thing_newer.text('');
      $thing_office.text('');
      $thing_orgteam.text('');
      $thing_ou.text('');
      $thing_personaltitle.text('');
      $thing_pseudonym.text('');
      $thing_shirtsize.text('');
      $thing_skills.text('');
      $thing_twiterhandle.text('');
      // 
      var uid = $(this).data('id');
      $.ajax({url: '/person/' + uid, dataType: 'json', success: person_callback, error: error_callback});
    }
  });

  function person_callback (data, status){
    if (status == 'success'){
      photo_dropzone.options.url = '/person/upload_photo/' + data.uid;
      photo_dropzone.enable();
      $thing_avatar.attr('src', 'http://robby-photo-bucket.s3.amazonaws.com/' + data.jpegphotofile);
      $thing_avatar.attr('onerror', "avatar_error(this, 'person');");
      // header
      $thing_name.text(data.cn);
      $thing_name.data('uid', data.uid);
      $thing_title.text(data.title);
      // details
      $thing_bribemewith.text(data.bribemewith);
      $thing_dietaryrestrictions.text(data.dietaryrestrictions);
      $thing_github.text(data.github);
      $thing_interestingfact.text(data.interestingfact);
      $thing_ircnickname.text(data.ircnickname);
      $thing_languages.text(data.languages);
      $thing_mail.text(data.mail);
      $thing_manager.text( calculate_manager(data.manager) );
      $thing_mobile.text(data.mobile);
      $thing_newer.text( calculate_percent_newer() );
      $thing_office.text(data.office);
      $thing_orgteam.text(data.orgteam);
      $thing_ou.text(data.ou);
      $thing_personaltitle.text(data.personaltitle);
      $thing_pseudonym.text(data.pseudonym);
      $thing_reports.text( calculate_direct_reports() )
      $thing_shirtsize.text(data.shirtsize);
      $thing_skills.text(data.skills);
      $thing_twiterhandle.text(data.twiterhandle);
      //
      $thing_section.fadeIn('fast');
      $thing_details.show();
      location = data.location
      if (location) {
        $map_image.attr('src', '/images/' + location + '.png');
        location_x = data.location_x;
        location_y = data.location_y;
        animate_map();
        $map.show();
      } else {
        $map_image.hide();
        $location_selector.val('Other');
      }
      if (global_logged_in) {
        $edit_controls.show();
      }
    } else {
      alert('Error: ' + data);
    }
  };

  function person_update_callback (data, status) {
    if (status == 'success'){
      thing_changed = false;
      location_changed = false;
      $save_button.removeClass('active');
      alert('Saved!');
    } else {
      alert('Error: ' + data);
    }
  };

  //

  function calculate_direct_reports() {
    var this_person = 'uid=' + $("nav#things ul#people li.active").data('id') + ',ou=users,dc=puppetlabs,dc=com';
    var list_person_manager = '';
    var list_person_cn = '';
    var direct_report_list = [];
    $things_list_item.each(function(i){
      list_person_manager = $(this).data('manager_dn')
      if (this_person == list_person_manager) {
        list_person_cn = $('h3', this).text();
        direct_report_list.push(list_person_cn);
      }
    });
    return direct_report_list.join(', ');
  }

  function calculate_manager(this_person_manager_dn) {
    var this_person_manager_uid = this_person_manager_dn.match(/uid\=(.*?)\,/)[1]
    if (! this_person_manager_uid) {
      return this_person_manager_dn;
    }
    var list_person_uid = '';
    var list_person_cn = '';
    $things_list_item.each(function(i){
      list_person_uid = $(this).data('id');
      if (this_person_manager_uid == list_person_uid) {
        list_person_cn = $('h3', this).text();
        return list_person_cn;
      }
    });
    return list_person_cn;
  }

  function calculate_percent_newer() {
    var this_person_startdate = $("nav#things ul#people li.active").data('startdate');
    var count = $things_list_item.length;
    var newer = 0;
    $things_list_item.each(function(i){
      that_person_startdate = $(this).data('startdate');
      if (that_person_startdate > this_person_startdate) {
        newer++;
      }
    });
    var percent = Math.round(newer * 100 / count);
    return percent + '% of Puppet is newer'
  }

  function convert_id_to_href(id) {
    if (! id) {
      return '';
    }
    return '<a href="http://github.com/' + id + '">' + id + '</a>';
  }

  //

  function avatar_error(image, type) {
    image.onerror = '';
    image.src = "/images/" + type + ".png";
    return true;
  }

  function error_callback(jqXHR, textStatus, errorThrown) {
    alert (jqXHR.responseText);
  };

  // The jQuery.handleError was removed after jQuery v 1.5.

  jQuery.extend({
    handleError: function(s, xhr, status, e) {
      if (s.error)
        s.error(xhr, status, e);
      else if(xhr.responseText)
        console.log(xhr.responseText);
    }
  });

});