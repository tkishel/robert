jQuery(function() {

  var $things_list_item  = $("nav#things ul li");

  $("nav#things ul li.item").slideUp();

  $things_list_item.click(function(){
    var $selected_item = $('nav#things ul li.active');
    var is_header = $selected_item.hasClass('header');
    var is_item = $selected_item.hasClass('item');
    
    if (is_header){
      var $next_header = $selected_item.nextAll('.header');
      var n1 = $things_list_item.index($selected_item) + 1;
      var n2 = $things_list_item.index($next_header);
      if (n2 == -1){
        n2 = $('nav#things ul li').length;
      }
      $('nav#things ul li').slice(n1, n2).slideToggle();
    }
    
    if (is_item){
      var id = $(this).data('id');
      if (id){
        // window.open(id, '_blank');
        window.location = id;
      }
    }
  });

});