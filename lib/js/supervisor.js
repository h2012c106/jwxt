'use strict';

let supervisorNo;

/*******************
 * Verify
 *******************/
$(document).ready(function () {
    myAjax({
        type:'GET',
        url:`${tgtSkt}ssms/admin/myInfo`,
        data:'',
        successCb:function (data) {
            supervisorNo = data;
            $('span#userName').text(` ${supervisorNo}`);
        }
    });
});

/*******************
 * Statics
 *******************/

function assemAttrSelect() {
    let opt1 = '';
    for (let key in supStaticsAttr) {
        opt1 += `<option value="${key}">${key}</option>`;
    }
    opt1 = `<select id="classSelect" class="form-control">${opt1}</select>`;

    let opt2 = '';
    supStaticsAttr['student'].forEach(function (attr) {
        opt2 += `<option value="${attr}">${attr}</option>`;
    });
    opt2 = `<select id="attrSelect" class="form-control">${opt2}</select>`;

    let cfmBtn = '<button type="button" class="btn btn-primary" id="attrConfirm"><i class="fa fa-search fa-fw"></i>Confirm</button>';

    return `<div class="row option-row col-lg-12">
                <div class="col-lg-7"></div>
                <div class="col-lg-3">
                    <div class="row select-row">${opt1}</div>
                    <div class="row select-row">${opt2}</div>
                </div>
                <div class="col-lg-2">${cfmBtn}</div>
            </div>`;
}

function assemCanvas() {
    return '<div class="col-lg-6"><canvas id="countBar"></canvas></div>' +
        '<div class="col-lg-6" id="attrBarContainer"><canvas id="attrBar"></canvas></div>';
}

function assemCountChartData(counts) {
    let xA = ['Student', 'Teacher', 'Supervisor'];
    let yA = [counts.studentCount, counts.teacherCount, counts.supervisorCount];

    return {xA, yA};
}

function assemAttrChartData(counts) {
    counts.sort(function (x, y) {
        return x.key - y.key;
    });

    let xA = counts.map(function (count) {
        return count.key;
    });
    let yA = counts.map(function (count) {
        return count.value;
    });

    return {xA, yA};
}

$('#statics').click(function () {
    console.log('Supervisor -> Statics');

    $('#wrapper-name h1').text('Loading...');
    $('#wrapper-info div.col-lg-12').text('');
    myAjax({
        type: 'GET',
        url:`${tgtSkt}ssms/admin/getPersonCount`,
        data: '',
        successCb: function (counts) {
            $('#wrapper-name h1').text('Statics');
            $('#wrapper-info div.col-lg-12').html(assemAttrSelect() + assemCanvas());

            $('#classSelect').change(function () {
                let attrs = supStaticsAttr[$(this).val()];
                let opt22 = '';
                attrs.forEach(function (attr) {
                    opt22 += `<option value="${attr}">${attr}</option>`;
                });
                $('#attrSelect').html(opt22);
            });

            let assemCountData = assemCountChartData(counts);
            let countBarData = {
                labels: assemCountData.xA,
                datasets: [{
                    label: 'Grade',
                    backgroundColor: '#337ab7',
                    borderColor: '#2e6da4',
                    borderWidth: 1,
                    data: assemCountData.yA
                }]
            };
            new Chart(
                document.getElementById('countBar').getContext('2d'), {
                    type: 'bar',
                    data: countBarData,
                    options: {
                        responsive: true,
                        legend: {
                            display: false
                        },
                        title: {
                            display: false
                        }
                    }
                }
            );

            $('#attrConfirm').click(function () {
                $('#attrBarContainer').html('<canvas id="attrBar"></canvas>');
                let klass = $('#classSelect').val();
                let attr = $('#attrSelect').val();
                if (klass && attr && supStaticsAttr[klass].indexOf(attr) !== -1) {
                    myAjax({
                        type: 'GET',
                        url:`${tgtSkt}ssms/admin/getSD/${klass}/${attr}`,
                        data: '',
                        successCb: function (counts) {
                            let assemAttrData = assemAttrChartData(counts);
                            let attrBarData = {
                                labels: assemAttrData.xA,
                                datasets: [{
                                    label: 'Grade',
                                    backgroundColor: '#337ab7',
                                    borderColor: '#2e6da4',
                                    borderWidth: 1,
                                    data: assemAttrData.yA
                                }]
                            };
                            new Chart(
                                document.getElementById('attrBar').getContext('2d'), {
                                    type: 'bar',
                                    data: attrBarData,
                                    options: {
                                        responsive: true,
                                        legend: {
                                            display: false
                                        },
                                        title: {
                                            display: false
                                        }
                                    }
                                }
                            );
                        }
                    });
                } else {
                    alert('Attr Select Error');
                }
            });
        },
        failCb: function (e) {
            alert(JSON.stringify(e));
        }
    });
});

/*******************
 * Student Information
 *******************/

function assemStuSelect(studentIdList) {
    let opts = '<option value=""></option>';
    studentIdList.forEach(function (studentNo) {
        opts += `<option value="${studentNo}">${studentNo}</option>`;
    });

    opts = `<div class="col-lg-9"><select data-placeholder="Choose a Student" class="col-lg-4" id="studentSelect">${opts}</select></div>`;
    opts += '' +
        '<div class="col-lg-3"><button type="button" class="btn btn-primary" id="studentConfirm"><i class="fa fa-search fa-fw"></i>Confirm</button></div>';

    return `<div class="row ctrl-row">${opts}</div>`;
}

function makeStuModifyBtn() {
    let row = '<div class="col-lg-10"></div>';
    row += '<div class="col-lg-2"><button type="button" class="btn btn-primary" id="modifyStu"><i class="fa fa-gear fa-fw"></i>Modify</button></div>';

    return `<div class="row">${row}</div>`;
}

function refreshStuInfo() {
    console.log('Supervisor -> Student Info');

    $('#wrapper-name h1').text('Loading...');
    $('#wrapper-info div.col-lg-12').text('');

    myAjax({
        type: 'GET',
        url:`${tgtSkt}ssms/admin/getAllStudentNo`,
        data: '',
        successCb: function (studentIdList) {
            $('#wrapper-name h1').text('Student Information');
            $('#wrapper-info div.col-lg-12')
                .html('<div class="row ctrl-row"><div class="col-lg-3"><button type="button" class="btn btn-success" id="createStu"><i class="fa fa-plus fa-fw"></i>Create</button></div><div class="col-lg-9"></div></div>'
                    + assemStuSelect(studentIdList) + '<div class="col-lg-12" id="infoTable"></div>');
            $('#studentSelect').chosen();

            $('#createStu').click(function () {
                console.log('Supervisor -> Student Info -> Create Student');

                BootstrapDialog.show({
                    type: BootstrapDialog.TYPE_PRIMARY,
                    title: 'Create',
                    message: function (diaSelf) {
                        let msg = '';
                        for (let key in stuMirrorSup) {
                            msg += `<label>${stuMirrorSup[key]}</label><input name="${key}" class="form-control" placeholder="Enter ${stuMirrorSup[key]}">`
                        }
                        msg = `<form id="createStu">${msg}</form>`;

                        return msg;
                    },
                    buttons: [{
                        label: `<span class="glyphicon glyphicon-ok"> Submit</span>`,
                        cssClass: 'btn-primary',
                        action: function (diaSelf) {
                            let formData = qsToFd('form#createStu');
                            myAjax({
                                type: 'POST',
                                url:`${tgtSkt}ssms/admin/addStudent`,
                                data: formData,
                                successCb: function (info) {
                                    refreshStuInfo();
                                    diaSelf.close();
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

            $('#studentConfirm').click(function () {
                console.log('Supervisor -> Student Info -> Search Student');

                let studentNo = $('#studentSelect').val();
                $('#infoTable').text('');
                myAjax({
                    type: 'GET',
                    url:`${tgtSkt}ssms/admin/getSI/${studentNo}`,
                    data: '',
                    successCb: function (studentInfo) {
                        $('#infoTable')
                            .html(assemInfo(studentInfo, 'stu', 'sup') + makeStuModifyBtn());

                        $('#modifyStu').click(function () {
                            console.log('Supervisor -> Student Info -> Search Student -> Modify Student');

                            BootstrapDialog.show({
                                type: BootstrapDialog.TYPE_PRIMARY,
                                title: 'Modify',
                                message: function (diaSelf) {
                                    let msg = '';
                                    for (let key in studentInfo) {
                                        if (stuMirrorSup.hasOwnProperty(key)) {
                                            let val = studentInfo[key];
                                            msg += `<label>${stuMirrorSup[key]}</label><input name="${key}" class="form-control" value="${val}" ${key === 'studentNo' ? 'disabled' : ''}>`;
                                        }
                                    }
                                    msg = `<form id="modifyStu">${msg}</form>`;

                                    return msg;
                                },
                                buttons: [{
                                    label: `<span class="glyphicon glyphicon-ok"> Submit</span>`,
                                    cssClass: 'btn-primary',
                                    action: function (diaSelf) {
                                        let formData = qsToFd('form#modifyStu');
                                        myAjax({
                                            type: 'POST',
                                            url:`${tgtSkt}ssms/admin/updateStudent`,
                                            data: formData,
                                            successCb: function (info) {
                                                diaSelf.close();
                                                refreshStuInfo();
                                            },
                                            failCb: function (e) {
                                                alert(JSON.stringify(e));
                                            }
                                        });
                                    }
                                }, {
                                    label: `<span class="glyphicon glyphicon-remove"> Delete</span>`,
                                    cssClass: 'btn-danger',
                                    action: function (diaSelf) {
                                        // ajax delete request
                                        myAjax({
                                            type: 'GET',
                                            url:`${tgtSkt}ssms/admin/deleteStudent/${studentNo}`,
                                            data: '',
                                            successCb: function (info) {
                                                diaSelf.close();
                                                refreshStuInfo();
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
                    },
                    failCb: function (e) {
                        alert(JSON.stringify(e));
                    }
                });
            });
        },
        failCb: function (e) {
            alert(JSON.stringify(e));
        }
    });
}

$('#studentInfo').click(function () {
    refreshStuInfo();
});

/*******************
 * Teacher Information
 *******************/

function assemTeaSelect(teacherIdList) {
    let opts = '<option value=""></option>';
    teacherIdList.forEach(function (teacherNo) {
        opts += `<option value="${teacherNo}">${teacherNo}</option>`;
    });

    opts = `<div class="col-lg-9"><select data-placeholder="Choose a Teacher" class="col-lg-4" id="teacherSelect">${opts}</select></div>`;
    opts += '' +
        '<div class="col-lg-3"><button type="button" class="btn btn-primary" id="teacherConfirm"><i class="fa fa-search fa-fw"></i>Confirm</button></div>';

    return `<div class="row ctrl-row">${opts}</div>`;
}

function makeTeaModifyBtn() {
    let row = '<div class="col-lg-10"></div>';
    row += '<div class="col-lg-2"><button type="button" class="btn btn-primary" id="modifyTea"><i class="fa fa-gear fa-fw"></i>Modify</button></div>';

    return `<div class="row">${row}</div>`;
}

function refreshTeaInfo() {
    console.log('Supervisor -> Teacher Info');

    $('#wrapper-name h1').text('Loading...');
    $('#wrapper-info div.col-lg-12').text('');

    myAjax({
        type: 'GET',
        url:`${tgtSkt}ssms/admin/getAllTeacherNo`,
        data: '',
        successCb: function (teacherIdList) {
            $('#wrapper-name h1').text('Teacher Information');
            $('#wrapper-info div.col-lg-12')
                .html('<div class="row ctrl-row"><div class="col-lg-3"><button type="button" class="btn btn-success" id="createTea"><i class="fa fa-plus fa-fw"></i>Create</button></div><div class="col-lg-9"></div></div>'
                    + assemTeaSelect(teacherIdList) + '<div class="col-lg-12" id="infoTable"></div>');
            $('#teacherSelect').chosen();

            $('#createTea').click(function () {
                console.log('Supervisor -> Teacher Info -> Create Teacher');

                BootstrapDialog.show({
                    type: BootstrapDialog.TYPE_PRIMARY,
                    title: 'Create',
                    message: function (diaSelf) {
                        let msg = '';
                        for (let key in teaMirrorSup) {
                            msg += `<label>${teaMirrorSup[key]}</label><input name="${key}" class="form-control" placeholder="Enter ${teaMirrorSup[key]}">`
                        }
                        msg = `<form id="createTea">${msg}</form>`;

                        return msg;
                    },
                    buttons: [{
                        label: `<span class="glyphicon glyphicon-ok"> Submit</span>`,
                        cssClass: 'btn-primary',
                        action: function (diaSelf) {
                            let formData = qsToFd('form#createTea');
                            myAjax({
                                type: 'POST',
                                url:`${tgtSkt}ssms/admin/addTeacher`,
                                data: formData,
                                successCb: function (info) {
                                    diaSelf.close();
                                    refreshTeaInfo();
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

            $('#teacherConfirm').click(function () {
                console.log('Supervisor -> Teacher Info -> Search Teacher');

                let teacherNo = $('#teacherSelect').val();
                $('#infoTable').text('');
                myAjax({
                    type: 'GET',
                    url:`${tgtSkt}ssms/admin/getTI/${teacherNo}`,
                    data: '',
                    successCb: function (teacherInfo) {
                        $('#infoTable')
                            .html(assemInfo(teacherInfo, 'tea', 'sup') + makeTeaModifyBtn());

                        $('#modifyTea').click(function () {
                            console.log('Supervisor -> Teacher Info -> Search Teacher -> Modify Teacher');

                            BootstrapDialog.show({
                                type: BootstrapDialog.TYPE_PRIMARY,
                                title: 'Modify',
                                message: function (diaSelf) {
                                    let msg = '';
                                    for (let key in teacherInfo) {
                                        if (teaMirrorSup.hasOwnProperty(key)) {
                                            let val = teacherInfo[key];
                                            msg += `<label>${teaMirrorSup[key]}</label><input name="${key}" class="form-control" value="${val}" ${key === 'teacherNo' ? 'disabled' : ''}>`;
                                        }
                                    }
                                    msg = `<form id="modifyTea">${msg}</form>`;

                                    return msg;
                                },
                                buttons: [{
                                    label: `<span class="glyphicon glyphicon-ok"> Submit</span>`,
                                    cssClass: 'btn-primary',
                                    action: function (diaSelf) {
                                        let formData = qsToFd('form#modifyTea');
                                        myAjax({
                                            type: 'POST',
                                            url:`${tgtSkt}ssms/admin/updateTeacher`,
                                            data: formData,
                                            successCb: function (info) {
                                                diaSelf.close();
                                                refreshTeaInfo();
                                            },
                                            failCb: function (e) {
                                                alert(JSON.stringify(e));
                                            }
                                        });
                                    }
                                }, {
                                    label: `<span class="glyphicon glyphicon-remove"> Delete</span>`,
                                    cssClass: 'btn-danger',
                                    action: function (diaSelf) {
                                        // ajax delete request
                                        myAjax({
                                            type: 'GET',
                                            url:`${tgtSkt}ssms/admin/deleteTeacher/${teacherNo}`,
                                            data: '',
                                            successCb: function (info) {
                                                diaSelf.close();
                                                refreshTeaInfo();
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
                    },
                    failCb: function (e) {
                        alert(JSON.stringify(e));
                    }
                });
            });
        },
        failCb: function (e) {
            alert(JSON.stringify(e));
        }
    });
}

$('#teacherInfo').click(function () {
    refreshTeaInfo();
});

/*******************
 * Supervisor Information
 *******************/

function assemSupSelect(supervisorIdList) {
    let opts = '<option value=""></option>';
    supervisorIdList.forEach(function (supervisorNo) {
        opts += `<option value="${supervisorNo}">${supervisorNo}</option>`;
    });

    opts = `<select data-placeholder="Choose a Supervisor" class="col-lg-4" id="supervisorSelect">${opts}</select>`;
    opts += '<div class="col-lg-2"></div>' +
        '<button type="button" class="btn btn-primary col-lg-3" id="supervisorConfirm"><i class="fa fa-search fa-fw"></i>Confirm</button>';

    return opts;
}

function makeSupModifyBtn() {
    let row = '<div class="col-lg-9">';
    row += '<button type="button" class="btn btn-primary col-lg-3" id="modifySup"><i class="fa fa-gear fa-fw"></i>Modify</button>';

    return row;
}

function refreshSupInfo() {
    console.log('Supervisor -> Supervisor Info');

    $('#wrapper-name h1').text('Loading...');
    $('#wrapper-info div.col-lg-12').text('');

    myAjax({
        type: 'GET',
        url: ``,
        data: '',
        successCb: function (supervisorIdList) {
            $('#wrapper-name h1').text('Supervisor Information');
            $('#wrapper-info div.col-lg-12')
                .html('<button type="button" class="btn btn-success col-lg-3" id="createSup"><i class="fa fa-plus fa-fw"></i>Create</button>'
                    + assemSupSelect(supervisorIdList) + '<div class="col-lg-12" id="infoTable"></div>');
            $('#supervisorSelect').chosen();

            $('#createSup').click(function () {
                console.log('Supervisor -> Supervisor Info -> Create Supervisor');

                BootstrapDialog.show({
                    type: BootstrapDialog.TYPE_PRIMARY,
                    title: 'Create',
                    message: function (diaSelf) {
                        let msg = '';
                        for (let key in supMirrorSup) {
                            msg += `<label>${supMirrorSup[key]}</label><input name="${key}" class="form-control" placeholder="Enter ${supMirrorSup[key]}">`
                        }
                        msg = `<form id="createSup">${msg}</form>`;

                        return msg;
                    },
                    buttons: [{
                        label: `<span class="glyphicon glyphicon-ok"> Submit</span>`,
                        cssClass: 'btn-primary',
                        action: function (diaSelf) {
                            let formData = qsToFd('form#createSup');
                            myAjax({
                                type: 'GET',
                                url: ``,
                                data: '',
                                successCb: function (info) {

                                },
                                failCb: function (e) {
                                    alert(JSON.stringify(e));
                                }
                            });
                            diaSelf.close();
                            refreshSupInfo();
                        }
                    }],
                    closable: true
                });
            });

            $('#supervisorConfirm').click(function () {
                console.log('Supervisor -> Supervisor Info -> Search Supervisor');

                let supervisorNo = $('#supervisorSelect').val();
                $('#infoTable').text('');
                myAjax({
                    type: 'POST',
                    url: ``,
                    data: {supervisorNo},
                    successCb: function (supervisorInfo) {
                        $('#infoTable')
                            .html(assemInfo(supervisorInfo, 'sup', 'sup') + makeSupModifyBtn());

                        $('#modifySup').click(function () {
                            console.log('Supervisor -> Supervisor Info -> Search Supervisor -> Modify Supervisor');

                            BootstrapDialog.show({
                                type: BootstrapDialog.TYPE_PRIMARY,
                                title: 'Modify',
                                message: function (diaSelf) {
                                    let msg = '';
                                    for (let key in supervisorInfo) {
                                        if (supMirrorSup.hasOwnProperty(key)) {
                                            let val = supervisorInfo[key];
                                            msg += `<label>${supMirrorSup[key]}</label><input name="${key}" class="form-control" value="${val}" ${key === 'supervisorNo' ? 'disabled' : ''}>`;
                                        }
                                    }
                                    msg = `<form id="modifySup">${msg}</form>`;

                                    return msg;
                                },
                                buttons: [{
                                    label: `<span class="glyphicon glyphicon-ok"> Submit</span>`,
                                    cssClass: 'btn-primary',
                                    action: function (diaSelf) {
                                        let formData = qsToFd('form#modifySup');
                                        myAjax({
                                            type: 'GET',
                                            url: ``,
                                            data: '',
                                            successCb: function (info) {

                                            },
                                            failCb: function (e) {
                                                alert(JSON.stringify(e));
                                            }
                                        });
                                        diaSelf.close();
                                        refreshSupInfo();
                                    }
                                }, {
                                    label: `<span class="glyphicon glyphicon-remove"> Delete</span>`,
                                    cssClass: 'btn-danger',
                                    action: function (diaSelf) {
                                        // ajax delete request
                                        myAjax({
                                            type: 'GET',
                                            url: ``,
                                            data: '',
                                            successCb: function (info) {

                                            },
                                            failCb: function (e) {
                                                alert(JSON.stringify(e));
                                            }
                                        });
                                        diaSelf.close();
                                        refreshSupInfo();
                                    }
                                }],
                                closable: true
                            });
                        });
                    },
                    failCb: function (e) {
                        alert(JSON.stringify(e));
                    }
                });
            });
        },
        failCb: function (e) {
            alert(JSON.stringify(e));
        }
    });
}

$('#supervisorInfo').click(function () {
    refreshSupInfo();
});

/*******************
 * Course Information
 *******************/

function assemCrsSelect(courseIdList) {
    let opts = '<option value=""></option>';
    courseIdList.forEach(function (courseNo) {
        opts += `<option value="${courseNo}">${courseNo}</option>`;
    });

    opts = `<div class="col-lg-9"><select data-placeholder="Choose a Course" class="col-lg-4" id="courseSelect">${opts}</select></div>`;
    opts += '' +
        '<div class="col-lg-3"><button type="button" class="btn btn-primary" id="courseConfirm"><i class="fa fa-search fa-fw"></i>Confirm</button></div>';

    return `<div class="row ctrl-row">${opts}</div>`;
}

function makeCrsModifyBtn() {
    let row = '<div class="col-lg-10"></div>';
    row += '<div class="col-lg-2"><button type="button" class="btn btn-primary" id="modifyCrs"><i class="fa fa-gear fa-fw"></i>Modify</button></div>';

    return `<div class="row">${row}</div>`;
}

function refreshCrsInfo() {
    console.log('Course -> Course Info');

    $('#wrapper-name h1').text('Loading...');
    $('#wrapper-info div.col-lg-12').text('');

    myAjax({
        type: 'GET',
        url:`${tgtSkt}ssms/admin/getAllCourse`,
        data: '',
        successCb: function (courseIdList) {
            $('#wrapper-name h1').text('Course Information');
            $('#wrapper-info div.col-lg-12')
                .html('<div class="row ctrl-row"><div class="col-lg-3"><button type="button" class="btn btn-success" id="createCrs"><i class="fa fa-plus fa-fw"></i>Create</button></div><div class="col-lg-9"></div></div>'
                    + assemCrsSelect(courseIdList) + '<div class="col-lg-12" id="infoTable"></div>');
            $('#courseSelect').chosen();

            $('#createCrs').click(function () {
                console.log('Course -> Course Info -> Create Course');

                BootstrapDialog.show({
                    type: BootstrapDialog.TYPE_PRIMARY,
                    title: 'Create',
                    message: function (diaSelf) {
                        let msg = '';
                        for (let key in crsMirrorSup) {
                            msg += `<label>${crsMirrorSup[key]}</label><input name="${key}" class="form-control" placeholder="Enter ${crsMirrorSup[key]}">`
                        }
                        msg = `<form id="createCrs">${msg}</form>`;

                        return msg;
                    },
                    buttons: [{
                        label: `<span class="glyphicon glyphicon-ok"> Submit</span>`,
                        cssClass: 'btn-primary',
                        action: function (diaSelf) {
                            let formData = qsToFd('form#createCrs');
                            myAjax({
                                type: 'POST',
                                url:`${tgtSkt}ssms/admin/addCourse`,
                                data: formData,
                                successCb: function (info) {
                                    diaSelf.close();
                                    refreshCrsInfo();
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

            $('#courseConfirm').click(function () {
                console.log('Course -> Course Info -> Search Course');

                let courseNo = $('#courseSelect').val();
                $('#infoTable').text('');
                myAjax({
                    type: 'GET',
                    url:`${tgtSkt}ssms/admin/getCI/${courseNo}`,
                    data: '',
                    successCb: function (courseInfo) {
                        $('#infoTable')
                            .html(assemInfo(courseInfo, 'crs', 'sup') + makeCrsModifyBtn());

                        $('#modifyCrs').click(function () {
                            console.log('Course -> Course Info -> Search Course -> Modify Course');

                            BootstrapDialog.show({
                                type: BootstrapDialog.TYPE_PRIMARY,
                                title: 'Modify',
                                message: function (diaSelf) {
                                    let msg = '';
                                    for (let key in courseInfo) {
                                        if (crsMirrorSup.hasOwnProperty(key)) {
                                            let val = courseInfo[key];
                                            msg += `<label>${crsMirrorSup[key]}</label><input name="${key}" class="form-control" value="${val}" ${key === 'courseNo' ? 'disabled' : ''}>`;
                                        }
                                    }
                                    msg = `<form id="modifyCrs">${msg}</form>`;

                                    return msg;
                                },
                                buttons: [{
                                    label: `<span class="glyphicon glyphicon-ok"> Submit</span>`,
                                    cssClass: 'btn-primary',
                                    action: function (diaSelf) {
                                        let formData = qsToFd('form#modifyCrs');
                                        myAjax({
                                            type: 'POST',
                                            url:`${tgtSkt}ssms/admin/updateCourse`,
                                            data: formData,
                                            successCb: function (info) {
                                                diaSelf.close();
                                                refreshCrsInfo();
                                            },
                                            failCb: function (e) {
                                                alert(JSON.stringify(e));
                                            }
                                        });
                                    }
                                }, {
                                    label: `<span class="glyphicon glyphicon-remove"> Delete</span>`,
                                    cssClass: 'btn-danger',
                                    action: function (diaSelf) {
                                        // ajax delete request
                                        myAjax({
                                            type: 'GET',
                                            url:`${tgtSkt}ssms/admin/deleteCourse/${courseNo}`,
                                            data: '',
                                            successCb: function (info) {
                                                diaSelf.close();
                                                refreshCrsInfo();
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
                    },
                    failCb: function (e) {
                        alert(JSON.stringify(e));
                    }
                });
            });
        },
        failCb: function (e) {
            alert(JSON.stringify(e));
        }
    });
}

$('#courseInfo').click(function () {
    refreshCrsInfo();
});
