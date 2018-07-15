'use strict';

function assemMsg(df0, df1) {
    let msg = `<label>${df0}</label><input name="${df1}" class="form-control" placeholder="Enter ${df0}">`;
    msg += '<br>';
    msg += '<label>Password</label><input name="pwd" class="form-control" placeholder="Enter Password" type="password">';
    msg += '<br>';

    msg = `<form id="login-form">${msg}</form>`;

    return msg;
}

$('#stu').click(function () {
    BootstrapDialog.show({
        type: BootstrapDialog.TYPE_PRIMARY,
        title: 'Login',
        message: assemMsg('Student ID', 'stuId'),
        buttons: [{
            label: `<span class="glyphicon glyphicon-log-in"> Login</span>`,
            cssClass: 'btn-primary',
            action: function () {
                let formData = qsToFd('form#login-form');

                myAjax({
                    type: 'GET',
                    url: `${tgtSkt}ssms/login/${formData.stuId}/${formData.pwd}/student`,
                    data: '',
                    successCb: function (info) {
                        window.location.href = 'student.html';
                    },
                    failCb: function (e) {
                        alert(JSON.stringify(e));
                    }
                });
            }
        }],
        closable: true
    });
});

$('#tea').click(function () {
    BootstrapDialog.show({
        type: BootstrapDialog.TYPE_PRIMARY,
        title: 'Login',
        message: assemMsg('Teacher ID', 'teaId'),
        buttons: [{
            label: `<span class="glyphicon glyphicon-log-in"> Login</span>`,
            cssClass: 'btn-primary',
            action: function () {
                let formData = qsToFd('form#login-form');

                myAjax({
                    type: 'GET',
                    url: `${tgtSkt}ssms/login/${formData.teaId}/${formData.pwd}/teacher`,
                    data: '',
                    successCb: function (info) {
                        window.location.href = 'teacher.html';
                    },
                    failCb: function (e) {
                        alert(JSON.stringify(e));
                    }
                });
            }
        }],
        closable: true
    });
});

$('#sup').click(function () {
    BootstrapDialog.show({
        type: BootstrapDialog.TYPE_PRIMARY,
        title: 'Login',
        message: assemMsg('Supervisor ID', 'supId'),
        buttons: [{
            label: `<span class="glyphicon glyphicon-log-in"> Login</span>`,
            cssClass: 'btn-primary',
            action: function () {
                let formData = qsToFd('form#login-form');

                myAjax({
                    type: 'GET',
                    url: `${tgtSkt}ssms/login/${formData.supId}/${formData.pwd}/admin`,
                    data: '',
                    successCb: function (info) {
                        window.location.href = 'supervisor.html';
                    },
                    failCb: function (e) {
                        alert(JSON.stringify(e));
                    }
                });
            }
        }],
        closable: true
    });
});
