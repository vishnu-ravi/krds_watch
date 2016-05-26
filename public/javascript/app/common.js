var Common  =   function() {
    this.notificationPage   =   1;
    this.is_scroll_listner_active   =   false;
    this.is_mobile  =   false;
};
var animationTimeout;

Common.prototype.init   =   function() {
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) )
        this.is_mobile  =   true;

    this.bindEvents();
};

Common.prototype.bindEvents =   function() {
    var _this   =   this;

    $('.btnNotifications').on('click', function (e) {
        e.preventDefault();

        if($(this).hasClass('active'))
        {
            $(this).removeClass('active').parent().removeClass('active');
            $('#notification_container').empty().scrollTop(0);
            $('#block_notifications').hide();
            if(_this.is_scroll_listner_active) {
                _this.is_scroll_listner_active   =   false;
                $('#notification_container').off('scroll');
            }

            if(typeof animationTimeout !== undefined)
                clearTimeout(animationTimeout);

            _this.notificationPage   =   1;
            $('#main').show().removeClass('animate').addClass('moveBack');
        }
        else
        {
            $(this).addClass('active').parent().addClass('active');
            $(this).find('.badge').empty();
            $('#main').removeClass('moveBack').addClass('animate');
            _this.getNotification(true);
            _this.setNotificationSeenStatus();
        }
    });

    $('#btn_notificaiton_back').on('click', function(e) {
        e.preventDefault();

        $('.btnNotifications').removeClass('active').parent().removeClass('active');
        $('#notification_container').empty().scrollTop(0);
        $('#block_notifications').hide();
        if(_this.is_scroll_listner_active) {
            _this.is_scroll_listner_active   =   false;
            $('#notification_container').off('scroll');
        }

        _this.notificationPage   =   1;

        if(typeof animationTimeout !== undefined)
            clearTimeout(animationTimeout);

        $('#main').show().removeClass('animate').addClass('moveBack');
    });

    if( ! this.is_mobile) {
        $('body').on('click', function(e) {
            if ( ! $(e.target).hasClass('clickInActive') && $('.btnNotifications').hasClass('active'))
               $('.btnNotifications').trigger('click');
        });
    }

};

Common.prototype.getNotification =   function(is_animate) {
    var _this   =   this;

    if(_this.busy)
        return;

    _this.busy  =   false;
    $('body').addClass('loading');
    $('#block_notifications').show();
    $('#notification_loader').show();

    if($('#btn_notificaiton_back').is(':visible') && is_animate) {
        $('html, body').scrollTop(0);
        var height  =   $(window).height();
        $('#notification_container').css({height: height});
        if(typeof animationTimeout !== undefined)
            clearTimeout(animationTimeout);

        anmiationTimeout    =   setTimeout(function() {
            if($('#main').hasClass('animate'))
                $('#main').hide();
        }, 1100);
    }

    $.ajax({
        cache: false,
        type: 'GET',
        url: '/notifications',
        dataType: 'json',
        data: {
            page: _this.notificationPage
        },
        error: function(jXhr) {
            if(jXhr.status == 400 || jXhr.status == 500 || jXhr.status == 403)
                console.log(jXhr.msg);
        },
        success: function(data) {
            $('#notification_container').append(data.html);

            if(_this.notificationPage === 1)
                Materialize.showStaggeredList('#notification_container');
            else
                $('#notification_container li').css({opacity: 1});

            if(data.is_next_page && ! _this.is_scroll_listner_active)
                _this.listenScroll();
            else {
                _this.is_scroll_listner_active   =   false;
                $('#notification_container').off('scroll');
            }
        },
        complete: function(){
            _this.busy    =   false;
            $('body').removeClass('loading');
            $('#notification_loader').hide();
        }
    });
}

Common.prototype.listenScroll   =   function() {
    var _this   =   this;
    _this.is_scroll_listner_active   =   true;

    $('#notification_container').on('scroll', function(e){
        if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
            _this.notificationPage  += 1;
            _this.getNotification(false);
        }
    });
}

Common.prototype.setNotificationSeenStatus   =   function() {
    $.ajax({
        cache: false,
        type: 'PUT',
        url: '/user/notification',
        dataType: 'json',
        error: function(jXhr) {
            if(jXhr.status == 400 || jXhr.status == 500 || jXhr.status == 403)
                console.log(jXhr.msg);
        },
        success: function(data) {
            console.log(data);
        }
    });
};

var common  =   new Common();

$(document).ready(function() {
    common.init();
});
