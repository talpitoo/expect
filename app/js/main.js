'use strict';

$(function() {
  // helpers
  // mobile detection
  function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // trigger things if scrolled into view
  function isScrolledIntoView(element) {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();
    var elem = $(element);
    if (elem.length) {
      var elemTop = elem.offset().top;
      var elemBottom = elemTop + elem.height();
    }
    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
  }

  // async web fonts
  // WebFontConfig = {
  //     google: { families: ['Open+Sans:400,300,700,400italic:latin', 'Alegreya+Sans+SC:300:latin'] }
  // };
  // (function () {
  //     var wf = document.createElement('script');
  //     wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
  //       '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
  //     wf.type = 'text/javascript';
  //     wf.async = 'true';
  //     var s = document.getElementsByTagName('script')[0];
  //     s.parentNode.insertBefore(wf, s);
  // })();

  // Dr. Frank Poole
  $('.animation-placeholder').on('click', function() {
    $(this).addClass('animation-flyoff');
    setTimeout(function() {
      $('.animation-placeholder').removeClass('animation-flyoff').hide();
    }, 1982);
    if (ga.hasOwnProperty('loaded') && ga.loaded === true) {
      ga('send', 'event', 'button', 'click', 'Dr. Frank Poole');
    }
  });

  // portfolio
  var shownSmartphone = false;
  var shownIntermission = false;
  $('.featured').removeClass('dreamers').addClass('blank');
  $(window).scroll(function() {
    var elementSmartphone = $('.portfolio-smartphone');
    var elementIntermission = $('.animation-spin');
    if (isScrolledIntoView(elementSmartphone) && !shownSmartphone) {
      $('.featured').removeClass().addClass('featured dreamers');
      shownSmartphone = true;
    }
    if (isScrolledIntoView(elementIntermission) && !shownIntermission) {
      $('.featured').removeClass().addClass('featured vackor');
      shownIntermission = true;
    }
  });
  $('.nexus5, .portfolio-next').on('click', function() {
    if ($('.featured').hasClass('upwork')) {
      $('.featured').removeClass('blank upwork').addClass('novalite');
    } else if ($('.featured').hasClass('novalite')) {
      $('.featured').removeClass('blank novalite').addClass('tt');
    } else if ($('.featured').hasClass('tt')) {
      $('.featured').removeClass('blank tt').addClass('vackor');
    } else if ($('.featured').hasClass('vackor')) {
      $('.featured').removeClass('blank vackor').addClass('dafed');
    } else if ($('.featured').hasClass('dafed')) {
      $('.featured').removeClass('blank dafed').addClass('dreamers');
    } else {
      $('.featured').removeClass('blank dreamers').addClass('upwork');
    }
    if (ga.hasOwnProperty('loaded') && ga.loaded === true) {
      ga('send', 'event', 'button', 'click', 'devices');
    }
  });

  // parallax header
  if (!isMobile()) {
    $(window).bind('load resize scroll', function() {
      var y = $(window).scrollTop();
      $('.space-odyssey').css({
        'transform': 'translate3d(-50%, ' + parseInt(y / 1.5) + 'px, 0px)'
      });
    });
  }

});

// replace low quality images after the page loads
$(window).load(function() {
  if ($(window).width() >= 768) {
    var $headerImage = $('<img src="img/stanley-kubrick-2001-space-odyssey.jpg?ver=23022016">');
    $headerImage.bind('load', function() {
      $('.space-odyssey').attr('src', $($headerImage).attr('src'));
    });
  }
});
