$(function () {
    // load css async https://github.com/filamentgroup/loadCSS
    var ss = window.document.createElement("link");
    var ref = window.document.getElementsByTagName("noscript")[0];
    ss.rel = "stylesheet";
    ss.href = "css/minify.css?ver=05092014";
    ss.media = "only x";
    ref.parentNode.insertBefore(ss, ref);
    setTimeout(function () {
        ss.media = "all";
    });

    // helpers
    // mobile detection
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // trigger things if scrolled into view
    function isScrolledIntoView(elem) {
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();
        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).height();
        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }

    // async web fonts
    WebFontConfig = {
        google: { families: ['Open+Sans:400,300,700,800,400italic,300italic:latin', 'Alegreya+Sans+SC:300:latin'] }
    };
    (function () {
        var wf = document.createElement('script');
        wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
          '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
        wf.type = 'text/javascript';
        wf.async = 'true';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(wf, s);
    })();

    // Dr. Frank Poole
    $('.animation-placeholder').on('click', function () {
        $(this).addClass('animation-flyoff');
        setTimeout(function () {
            $('.animation-placeholder').removeClass('animation-flyoff').hide();
        }, 1982);
        if (ga.hasOwnProperty('loaded') && ga.loaded === true) {
            ga('send', 'event', 'button', 'click', 'Dr. Frank Poole');
        }
    });

    // portfolio
    var shownSmartphone = false;
    var shownIntermission = false;
    $(window).scroll(function () {
        var elementSmartphone = $('.portfolio-smartphone');
        var elementIntermission = $('.icon-expecticons-poole');
        if (isScrolledIntoView(elementSmartphone) && !shownSmartphone) {
            $('.featured').removeClass().addClass('featured novalite');
            shownSmartphone = true;
        }
        if (isScrolledIntoView(elementIntermission) && !shownIntermission) {
            $('.featured').removeClass().addClass('featured vackor');
            shownIntermission = true;
        }
    });
    $('.nexus5').on('click', function () {
        if ($('.featured').hasClass('tt')) {
            $('.featured').removeClass('blank tt').addClass('vackor');
        } else if ($('.featured').hasClass('vackor')) {
            $('.featured').removeClass('blank vackor').addClass('novalite');
        } else {
            $('.featured').removeClass('blank novalite').addClass('tt');
        }
        if (ga.hasOwnProperty('loaded') && ga.loaded === true) {
            ga('send', 'event', 'button', 'click', 'devices');
        }
    });

    // parallax header
    if (!isMobile()) {
        $(window).bind("load resize scroll", function (e) {
            var y = $(window).scrollTop();
            $("header").filter(function () {
                return $(this).offset().top < (y + $(window).height()) &&
                       $(this).offset().top + $(this).height() > y;
            }).css('background-position', 'center ' + parseInt(y / 1.5) + 'px');
        });
    }

});

// replace low quality images after the page loads
$(window).load(function () {
    if ($(window).width() >= 768) {
        var $headerImage = $('<img src="img/stanley-kubrick-2001-space-odyssey.jpg?ver=05092014">');
        $headerImage.bind('load', function () {
            $('header').css('background-image', 'linear-gradient(to right, rgba(0, 0, 0, 0.5), transparent), url(img/stanley-kubrick-2001-space-odyssey.jpg?ver=05092014)');
        });
    }
});
