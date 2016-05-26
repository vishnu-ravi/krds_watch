var Notification    =   function() {
    this.socket =   null;
};

Notification.prototype.init =   function(id_user) {
    this.socket  =   io();    
    var userInfo    =   {id_user: id_user};
    this.socket.emit('register', userInfo);
    this.bindEvents();
};

Notification.prototype.bindEvents   =   function() {
    this.socket.on('notification', function(data) {
        Materialize.toast(data.msg, 4000, "rounded");
        var count   =   $('.btnNotifications').find('.badge').html();

        count       =   count == '' ? 1 : Number(count) + 1;

        $('.btnNotifications').find('.badge').html(count);
    });
};

Notification.prototype.sendNotifications    =   function(id_user, owner_id, id_post, method, user) {
    var data    =   {};

    data['post_owner_id']   =   owner_id;
    data['id_user']         =   id_user;
    data['id_post']         =   id_post;
    data['method']          =   method;
    data['user_name']       =   user.name;

    this.socket.emit('comment', data);
};

var notification    =   new Notification();
