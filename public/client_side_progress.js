jQuery(function() {
  var $working_dialog    = $('#working_dialog');
    var $working_dialog_status  = $("#working_dialog_status");

  jQuery.get_with_progress = function get_with_progress(url) {  
    var source = new EventSource(url);

    source.addEventListener('open', function(e) {
      console.log(e.data);
    }, false);

    source.addEventListener('p_open', function(e) {
      $working_dialog.fadeIn('fast');
      $working_dialog_status.text(e.data);
      console.log(e.data);
    }, false);

    source.addEventListener('message', function(e) {
      $working_dialog_status.text(e.data);
      console.log(e.data);
    }, false);

    source.addEventListener('p_close', function(e) {
      source.close();
      $working_dialog_status.text(e.data);
      console.log(e.data);
      $working_dialog.fadeOut('fast');
    }, false);

    source.addEventListener('p_close_go', function(e) {
      source.close();
      $working_dialog_status.text('Redirecting to ' + e.data);
      console.log('Redirecting to ' + e.data);
      $working_dialog.fadeOut('fast');
      window.location = e.data;
    }, false);

    source.addEventListener('p_error', function(e) {
      source.close();
      $working_dialog_status.text('Error ' + e.data);
      console.log('Error ' + e.data);
      alert('Error ' + e.data)
      $working_dialog.fadeOut('fast');
    }, false);

    source.addEventListener('error', function(e) {
      if (e.readyState != EventSource.CLOSED) { source.close(); }
      $working_dialog_status.text('Network Error ' + e.data);
      console.log('Network Error ' + e.data);
      alert('Network Error ' + e.data);
      $working_dialog.fadeOut('fast');
    }, false);
  }
  
});