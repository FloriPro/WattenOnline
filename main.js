window.addEventListener('load', function () {
  //var name =this.prompt("Name:");
  //console.log(name);
  window_height = $(window).height();
  $('#position').css('min-height', window_height);
});


window.addEventListener('resize', function () {

  window_height = $(window).height();
  $('#position').css('min-height', window_height);
})



//Fade out Messages
function moveAwayEffect(moveAwayTarget) {
  var moveAwayTargetStyleMarginTopI = 0
  moveAwayTarget.style.marginTop = "0px";
  var moveAwayEffect = setInterval(function () {
    var startHeight = moveAwayTarget.getBoundingClientRect().height
    if (moveAwayTargetStyleMarginTopI < 22) {
      moveAwayTarget.style.padding = (20 - moveAwayTargetStyleMarginTopI) + "px";
      moveAwayTarget.style.height = (20 - (moveAwayTargetStyleMarginTopI / (20 / startHeight))) + "px";
      moveAwayTarget.style.fontSize = (20 - moveAwayTargetStyleMarginTopI) + "px";
      moveAwayTarget.getElementsByClassName("closebtn")[0].style.fontSize = (20 - moveAwayTargetStyleMarginTopI) + "px";
      moveAwayTargetStyleMarginTopI += 1;
    } else {
      clearInterval(moveAwayEffect);
      moveAwayTarget.remove();
    }
  }, 8);
}

function addMessage(text) {
  r=Math.random()
  document.getElementById("alerts").innerHTML += '<div class="alert" style="margin-top: 0;" id="alert_id'+r+'"><span class="closebtn" onclick="moveAwayEffect(this.parentElement)">X </span>' + text + '<br></div>'
  setTimeout(moveAwayEffect,5000,document.getElementById('alert_id'+r))
}