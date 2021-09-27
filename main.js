window.addEventListener('load', function() {
  //var name =this.prompt("Name:");
  //console.log(name);
  window_height = $(window).height();
  $('#position').css('min-height', window_height);
});


window.addEventListener('resize', function() {

  window_height = $(window).height();
  $('#position').css('min-height', window_height);
})