var Common  =   function() {
    this.notificationPage   =   1;
    this.is_scroll_listner_active   =   false;
};

Common.prototype.init   =   function() {
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

            _this.notificationPage   =   1;
        }
        else
        {
            $(this).addClass('active').parent().addClass('active');
            $(this).find('.badge').empty();
            _this.getNotification();
            _this.setNotificationSeenStatus();
        }
    });

    $('body').on('click', function(e) {
        if ( ! $(e.target).hasClass('clickInActive') && $('.btnNotifications').hasClass('active'))
           $('.btnNotifications').trigger('click');
    })
};

Common.prototype.getNotification =   function() {
    var _this   =   this;

    if(_this.busy)
        return;

    _this.busy  =   false;
    $('body').addClass('loading');
    $('#block_notifications').show();
    $('#notification_loader').show();

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
            $('#block_notifications').show();

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
            _this.getNotification();
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
