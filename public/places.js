jQuery(function() {
  var $search_field      = $("nav#things header input[type='search']");

  var $things_list       = $("nav#things ul#places");
  var $things_list_item  = $("nav#things ul li");

  var $thing_section     = $("section#thing");

  // header
  var $thing_name        = $("section#thing section h1");

  var $thing_details     = $("section#thing dl#thing_details");
  // details
  var $thing_description = $("section#thing dl dd#description");

  var $map               = $("section#location");
  var $map_image         = $("section#location img#current_location");

  var $edit_controls     = $(".edit_controls");
  var $location_selector = $(".edit_controls select");
  var $save_button       = $("a[href='#save']");

  var place = {};

  var location = '';
  var location_x = 0;
  var location_y = 0;
  var down_on_map  = false;
  var dragging_map = false;
  var drag_prev_x = 0;
  var drag_prev_y = 0;

  var thing_changed    = false;
  var location_changed = false;

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

    var place = {};
    
    place.name = $thing_name.text();
    place.description = $thing_description.text();

    if (location_changed) {
      var this_location = $location_selector.val();
      if (this_location == 'Other') this_location = '';

      place.location   = this_location;
      place.location_x = location_x;
      place.location_y = location_y;
    }
    
    var id = $("nav#things ul#places li.active").data('id');
    $.ajax({type: 'POST', url: '/place/update/' + id, data: {place: place}, dataType: 'json', success: place_update_callback, error: error_callback});
  });

  $things_list_item.click(function(e){    
    if ( (location_changed || thing_changed) && confirm("Discard your changes?") ){
      // Meh
    } else {
      location_changed = thing_changed = false;
      $save_button.removeClass('active');
    }

    if ( $(this).parent().attr('id') == 'places' ){
      $thing_details.hide();
      // header
      $thing_name.text('');
      // details
      $thing_description.text('');
      var id = $(this).data('id');
      $.ajax({url: '/place/' + id, dataType: 'json', success: place_calback, error: error_callback});
    }
  });

  function place_callback (data, status){
    if (status == 'success'){
      // header
      $thing_name.text(data.uid);
      // details
      $thing_description.text(data.description);
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
        $thing_description.attr('contenteditable','true');
      }
    } else {
      alert('Error: ' + data);
    }
  };

  function place_update_callback (data, status) {
    if (status == 'success'){
      thing_changed = false;
      location_changed = false;
      $save_button.removeClass('active');
      alert('Saved!');
    } else {
      alert('Error: ' + data);
    }
  };

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