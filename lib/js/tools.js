'use strict';

let tgtSkt='http://10.206.37.204:8081/';

let stuMirror = {
    studentNo: 'Student ID',
    name: 'Name',
    sex: 'Sex',
    dept: 'Department',
    classNo: 'Class'
};
let teaMirror = {
    teacherNo: 'Teacher ID',
    name: 'Name',
    dept: 'Department',
    salary: 'Salary'
};
let supMirror = {};
let crsMirror = {
    courseNo: 'Course ID',
    name: 'Name',
    classHour: 'Class Hour',
    credit: 'Credit',
    semester: 'Semester'
};

let stuMirrorSup = {
    studentNo: 'Student ID',
    name: 'Name',
    sex: 'Sex',
    dept: 'Department',
    classNo: 'Class',
    password: 'Password',
};
let teaMirrorSup = {
    teacherNo: 'Teacher ID',
    name: 'Name',
    dept: 'Department',
    salary: 'Salary',
    password: 'Password',
};
let supMirrorSup = {};
let crsMirrorSup = {
    courseNo: 'Course ID',
    name: 'Name',
    classHour: 'Class Hour',
    credit: 'Credit',
    semester: 'Semester'
};

let supStaticsAttr={
  student:['sex', 'dept','class_no'],
  teacher:['dept'],
  course:['class_hour','credit','semester']
};

// Replace the $.ajax()
function myAjax(param) {
    $.ajax({
        type: param.type,
        url: param.url,
        data: param.type === 'POST' ? {data: JSON.stringify(param.data)} : param.data,
        // dataType:'json',
        contentType: param.type === 'POST' ? 'application/x-www-form-urlencoded; charset=UTF-8' : undefined,
        // contentType: 'application/json; charset=UTF-8',
        success: function (data) {
            console.log(data);
            if (data.success) {
                param.successCb(data.data);
            } else {
                alert(data.error);
                // param.failCb();
            }
        },
        error: function (xhr, e) {
            alert(JSON.stringify(e));
            console.log(xhr.status);
            window.location.href = '404.html';
            if (xhr.status !== '200') {
                // window.location.href = '404.html';
            }
            // param.failCb();
        },
        xhrFields: {withCredentials: true}
    });
}

// function myAjax(param) {
//     return param.successCb('fake ajax');
// }

// Used with bootstrapDialog
function qsToFd(selector) {
    $(selector).children().each(function () {
        $(this).removeAttr('disabled')
    });
    let queryString = $(selector).serialize();
    let formData = {};
    queryString.split('&').forEach(function (qs) {
        let tmpQs = qs.split('=');
        formData[tmpQs[0]] = tmpQs[1];
    });

    return formData;
}


function assemInfo(info, infoType,user) {
    let tableInfo = '';
    let tmpMirror;
    if(user!=='sup'){
        switch (infoType) {
            case 'stu':
                tmpMirror = stuMirror;
                break;
            case 'tea':
                tmpMirror = teaMirror;
                break;
            case 'sup':
                tmpMirror = supMirror;
                break;
            case 'crs':
                tmpMirror = crsMirror;
                break;
        }
    }else{
        switch (infoType) {
            case 'stu':
                tmpMirror = stuMirrorSup;
                break;
            case 'tea':
                tmpMirror = teaMirrorSup;
                break;
            case 'sup':
                tmpMirror = supMirrorSup;
                break;
            case 'crs':
                tmpMirror = crsMirrorSup;
                break;
        }
    }
    for (let key in info) {
        if (tmpMirror.hasOwnProperty(key)) {
            tableInfo += `<tr>
                        <td>${tmpMirror[key]}</td>
                        <td>${info[key]}</td>
                    </tr>`;
        }
    }

    tableInfo = `<div class="panel-body">
                    <div class="table-responsive">
                        <table class="table table-striped table-bordered table-hover">
                            <tbody>
                            ${tableInfo}
                            </tbody>
                        </table>
                    </div>
                </div>`;

    return tableInfo;
}

function unique(array) {
    let res = [];
    let sortedArray = array.concat().sort();
    let seen;
    for (let i = 0, len = sortedArray.length; i < len; ++i) {
        if (!i || seen !== sortedArray[i]) {
            res.push(sortedArray[i])
        }
        seen = sortedArray[i];
    }
    return res;
}

/*******************
 * Logout
 *******************/

$('#logout').click(function () {
    myAjax({
        type: 'GET',
        url: `${tgtSkt}ssms/signOut`,
        data: '',
        successCb: function (info) {
            window.location.href = 'login.html';
        },
        failCb: function (e) {
            alert(JSON.stringify(e));
        }
    });
});
