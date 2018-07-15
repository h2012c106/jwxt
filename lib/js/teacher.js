'use strict';

let teacher;
let teacherCourse;

/*******************
 * Verify
 *******************/

$(document).ready(function () {
    myAjax({
        type: 'GET',
        url: `${tgtSkt}ssms/tea/myInfo`,
        data: '',
        successCb: function (teacherInfo) {
            teacher = teacherInfo.name;
            $('span#userName').text(` ${teacher}`);
        },
        failCb: function (e) {
            alert(JSON.stringify(e));
        }
    });
    myAjax({
        type: 'GET',
        url: `${tgtSkt}ssms/tea/myCourse`,
        data: '',
        successCb: function (myCourse) {
            teacherCourse = myCourse.map(function (crs) {
                return crs.courseNo;
            });
        },
        failCb: function (e) {
            alert(JSON.stringify(e));
        }
    });
});


/*******************
 * Grade
 *******************/

function makeCreateDeleteBtn() {
    return `<div class="col-lg-12 btn-container">
                <button type="button" class="btn btn-success">
                    <input type="file" class="btn file-input">
                    <i class="fa fa-folder-open fa-fw"></i>Batch
                </button>
            </div>`;
}

function assemGradeTable(grades) {
    // grades = [{
    //     name: 'hhx',
    //     studentNo: '2015211378',
    //     course: 'os',
    //     courseNo: '01',
    //     grade: 100
    // }, {
    //     name: 'hhx',
    //     studentNo: '2015211378',
    //     course: 'ab',
    //     courseNo: '0A',
    //     grade: 60
    // }, {
    //     name: 'xhh',
    //     studentNo: '123456',
    //     course: 'os',
    //     courseNo: '01',
    //     grade: 37
    // }, {
    //     name: 'xhh',
    //     studentNo: '123456',
    //     course: 'ab',
    //     courseNo: '0A',
    //     grade: null
    // }];

    let tbody = '';
    grades.forEach(function (grd) {
        tbody += `<tr id="gradeRow" data-studentNo="${grd.studentNo}" data-courseNo="${grd.courseNo}" data-name="${grd.name}" data-course="${grd.courseName}" data-grade="${grd.grade ? grd.grade : ''}">
                    <th>${grd.courseName}</th>
                    <th>${grd.name}</th>
                    <th>${grd.studentNo}</th>
                    <th>${grd.grade ? grd.grade : ''}</th>
                    <th><i class="fa fa-gear fa-fw" style="cursor: pointer" id="modify"></i></th>
                  </tr>`;
    });

    return `<div class="col-lg-12">
                    <div class="panel panel-default">
                        <div class="panel-body">
                            <table width="100%" class="table table-striped table-bordered table-hover" id="gradeTable">
                                <thead>
                                <tr>
                                    <th>Course</th>
                                    <th>Name</th>
                                    <th>ID</th>
                                    <th>Grade</th>
                                    <th>Modify</th>
                                </tr>
                                </thead>
                                <tbody id="gradeInfo">
                                    ${tbody}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>`;
}

function translateFile(file, cb) {
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function () {
        let res = [];
        let lines = reader.result.replace(/\r/g, '').split('\n');
        for (let i = 0; i < lines.length; ++i) {
            let line = lines[i];
            line = line.split('\t');
            if (line.length !== 3) {
                console.log(line);
                return cb({success: false, error: 'Format Error'});
            } else {
                res.push({
                    courseNo: line[0],
                    studentNo: line[1],
                    grade: Number(line[2])
                });
            }
        }
        return cb({success: true, res});
    };
}

function makeTableFromMap(res) {
    let tbody = '';
    res.forEach(function (re) {
        tbody += `<tr>
                    <td>${re.courseNo}</td>
                    <td>${re.studentNo}</td>
                    <td>${re.grade}</td>
                </tr>`;
    });
    return `<div class="panel-body">
                    <div class="table-responsive">
                        <table class="table table-striped table-bordered table-hover">
                            <thead>
                                <tr>
                                    <th>Course ID</th>
                                    <th>Student ID</th>
                                    <th>Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tbody}
                            </tbody>
                        </table>
                    </div>
                </div>`;
}

function deleteFile(file) {
    $(file).val('');
}

function refreshGrade() {
    console.log('Teacher -> Grade');

    $('#wrapper-name h1').text('Loading...');
    $('#wrapper-info div.col-lg-12').text('');

    myAjax({
        type: 'GET',
        url: `${tgtSkt}ssms/tea/myStus`,
        data: '',
        successCb: function (gradeList) {
            $('#wrapper-info div.col-lg-12').html(makeCreateDeleteBtn() + assemGradeTable(gradeList)).ready(function () {
                $('#gradeTable').dataTable({
                    columnDefs: [{
                        orderable: false,
                        targets: 4
                    }]
                });
                $('#wrapper-name h1').text('Grade');

                $('.file-input').on('change', function () {
                    console.log('Teacher -> Grade -> File input');

                    let self = this;
                    let file = $(this).prop('files')[0];
                    translateFile(file, function (param) {
                        if (param.success) {
                            BootstrapDialog.show({
                                type: BootstrapDialog.TYPE_PRIMARY,
                                title: 'Check files',
                                nl2br: false,
                                message: makeTableFromMap(param.res),
                                buttons: [{
                                    label: `<span class="glyphicon glyphicon-ok"> Submit</span>`,
                                    cssClass: 'btn-primary',
                                    action: function (diaSelf) {
                                        // file method
                                        myAjax({
                                            type: 'POST',
                                            url: `${tgtSkt}ssms/tea/entering`,
                                            data: param.res,
                                            successCb: function (failList) {
                                                if (failList.length !== 0) {
                                                    let msg = `Partially succeed, ${failList.map(function (item) {
                                                        return `${item.studentNo}-${item.courseNo}`;
                                                    }).join('/')} failed`;
                                                    alert(msg);
                                                }
                                            },
                                            failCb: function (e) {
                                                alert(JSON.stringify(e));
                                            }
                                        });
                                        deleteFile(self);
                                        diaSelf.close();
                                    }
                                }, {
                                    label: `<span class="glyphicon glyphicon-remove"> Abort</span>`,
                                    cssClass: 'btn-danger',
                                    action: function (diaSelf) {
                                        deleteFile(self);
                                        diaSelf.close();
                                    }
                                }],
                                closable: false
                            });
                        } else {
                            deleteFile(self);
                            alert(param.error);
                        }
                    });
                });

                $('i#modify').click(function () {
                    console.log('Teacher -> Grade -> Modify Grade');

                    let name = $(this).parents('#gradeRow').data('name');
                    let studentNo = $(this).parents('#gradeRow').data('studentNo');
                    let course = $(this).parents('#gradeRow').data('course');
                    let courseNo = $(this).parents('#gradeRow').data('courseNo');
                    let grade = $(this).parents('#gradeRow').data('grade');

                    BootstrapDialog.show({
                        type: BootstrapDialog.TYPE_PRIMARY,
                        title: 'Modify',
                        message: `<form id="modify">
                    <label>Course</label><input class="form-control" value="${course}" disabled>
                    <label>Student</label><input class="form-control" value="${name}" disabled>
                    <label>Grade</label><input name="grade" class="form-control" type="number" value="${grade}" min="0" max="100" step="0.5">
                </form>`,
                        buttons: [{
                            label: `<span class="glyphicon glyphicon-ok"> Submit</span>`,
                            cssClass: 'btn-primary',
                            action: function (diaSelf) {
                                let newGrade = qsToFd('form#modify').grade;
                                // single input
                                myAjax({
                                    type: 'POST',
                                    url: `${tgtSkt}ssms/tea/entering`,
                                    data: newGrade,
                                    successCb: function (info) {
                                        if (failList.length !== 0) {
                                            let msg = `Fail`;
                                            alert(msg);
                                        }
                                    },
                                    failCb: function (e) {
                                        alert(JSON.stringify(e));
                                    }
                                });
                                diaSelf.close();
                                refreshGrade();
                            }
                        }],
                        closable: true
                    });
                });
            });
        },
        failCb: function (e) {
            alert(JSON.stringify(e));
        }
    });
}

$('#grade').click(function () {
    refreshGrade();
});

/*******************
 * Statics
 *******************/

function extractList(gradeList) {
    let courses = {};
    gradeList.forEach(function (grd) {
        if (!courses.hasOwnProperty(grd.courseNo)) {
            courses[grd.courseNo] = grd.courseName;
        }
    });

    let res = [];
    for (let courseNo in courses) {
        res.push({courseNo, course: courses[courseNo]});
    }

    return res;
}

function assemGradeSelect(gradeList) {
    let courseSelect = '';
    let courseList = extractList(gradeList);
    courseList.forEach(function (crs) {
        courseSelect += `<option value="${crs.courseNo}">${crs.course}</option>`;
    });
    courseSelect = `<div class="col-lg-3"><select class="form-control" id="courseSelect">${courseSelect}</select></div>`;

    let stepSelect = `<div class="col-lg-3"><input class="form-control" type="number" placeholder="Step" min="0" max="100" step="5" id="stepSelect"></div>`;

    let searchBtn = '<div class="col-lg-3"><button type="button" class="btn btn-primary" id="makeChart"><i class="fa fa-search fa-fw"></i>Confirm</button></div>';

    return `<div class="option-row row">${courseSelect}${stepSelect}<div class="col-lg-3"></div>${searchBtn}</div>`;
}

function assemChart(gradeList, crs, step) {
    function tranStep(step) {
        let res = [{
            mini: Number.NEGATIVE_INFINITY,
            maxi: 0
        }];
        let left = 0;
        let right;
        while (true) {
            right = left + step;
            if (right >= 100) {
                res.push({
                    mini: left,
                    maxi: Number.POSITIVE_INFINITY
                });
                break;
            } else {
                res.push({
                    mini: left,
                    maxi: right
                });
            }
            left = right;
        }
        return res;
    }

    function makeXA(stepList) {
        let xA = [];
        stepList.forEach(function (step) {
            if (step.maxi > 100) {
                xA.push(`(${step.mini}, +∞)`);
            } else if (step.mini < 0) {
                xA.push(`(-∞, ${step.maxi}]`);
            } else {
                xA.push(`(${step.mini}, ${step.maxi}]`);
            }
        });

        return xA;
    }

    function findPos(left, right, stepList, tgt) {
        let mid = Math.round((left + right) / 2);
        if (tgt <= stepList[mid].mini) {
            return findPos(left, mid, stepList, tgt);
        } else if (tgt > stepList[mid].maxi) {
            return findPos(mid, right, stepList, tgt);
        } else {
            return mid;
        }
    }

    function makeYA(gradeList, crs, stepList) {
        let [...tmpGradeList] = gradeList;
        tmpGradeList.filter(function (grd) {
            return grd.courseNo === crs;
        });

        let yA = [];
        for (let i = 0; i < stepList.length; ++i) {
            yA.push(0);
        }

        tmpGradeList.forEach(function (grd) {
            let pos = findPos(0, stepList.length, stepList, grd.grade);
            ++yA[pos];
        });

        return yA;
    }

    function makeColor(stepList) {
        let color = [];
        stepList.forEach(function () {
            color.push('#' + (Math.random() * 0xffffff << 0).toString(16));
        });

        return color;
    }

    let stepList = tranStep(step);
    let xA = makeXA(stepList);
    let yA = makeYA(gradeList, crs, stepList);
    let color = makeColor(stepList);

    console.log({xA, yA, color});

    return {xA, yA, color};
}

$('#statics').click(function () {
    console.log('Teacher -> Statics');

    $('#wrapper-name h1').text('Loading...');
    $('#wrapper-info div.col-lg-12').text('');
    myAjax({
        type: 'GET',
        url: `${tgtSkt}ssms/tea/myStus`,
        data: '',
        successCb: function (gradeList) {
            $('#wrapper-name h1').text('Statics');
            $('#wrapper-info div.col-lg-12').html(assemGradeSelect(gradeList)
                + '<div id="gradeBarContainer" class="col-lg-6"></div>'
                + '<div id="gradePieContainer" class="col-lg-6"></div>');

            $('#makeChart').click(function () {
                console.log('Teacher -> Statics -> Make chart');
                $('div#gradeBarContainer').html('<canvas id="gradeBar"></canvas>');
                $('div#gradePieContainer').html('<canvas id="gradePie"></canvas>');

                let crs = $('#courseSelect').val();
                let step = $('#stepSelect').val();
                step = Number(step);
                if (!step || step <= 0 || step > 100) {
                    alert('Step Error')
                } else {
                    let assemData = assemChart(gradeList, crs, step);

                    /////////////// Make bar
                    let barData = {
                        labels: assemData.xA,
                        datasets: [{
                            label: 'Grade',
                            backgroundColor: '#337ab7',
                            borderColor: '#2e6da4',
                            borderWidth: 1,
                            data: assemData.yA
                        }]
                    };
                    new Chart(
                        document.getElementById('gradeBar').getContext('2d'), {
                            type: 'bar',
                            data: barData,
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

                    /////////////// Make pie
                    let pieData = {
                        labels: assemData.xA,
                        datasets: [{
                            label: 'Grade',
                            data: assemData.yA,
                            backgroundColor: assemData.color
                        }]
                    };
                    new Chart(
                        document.getElementById('gradePie').getContext('2d'), {
                            type: 'pie',
                            data: pieData,
                            options: {
                                responsive: true,
                                legend: {
                                    display: false
                                },
                                title: {
                                    display: false
                                },
                                animation: {
                                    animateScale: true,
                                    animateRotate: true
                                }
                            }
                        }
                    );
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

function makeModifyBtn() {
    let row = '<div class="col-lg-10"></div>';
    row += '<div class="col-lg-2"><button type="button" class="btn btn-danger" id="deleteStu"><i class="fa fa-remove fa-fw"></i>Delete</button></div>';

    return `<div class="row">${row}</div>`;
}

function refreshStuInfo() {
    console.log('Teacher -> Student Info');

    $('#wrapper-name h1').text('Loading...');
    $('#wrapper-info div.col-lg-12').text('');

    myAjax({
        type: 'GET',
        url: `${tgtSkt}ssms/tea/myStus`,
        data: '',
        successCb: function (studentIdList) {
            $('#wrapper-name h1').text('Student Information');
            // studentIdList actually is the gradeList
            studentIdList = studentIdList.map(function (item) {
                return item.studentNo;
            });
            studentIdList = unique(studentIdList);

            $('#wrapper-info div.col-lg-12')
                .html('<div class="row ctrl-row"><div class="col-lg-3"><button type="button" class="btn btn-success" id="createStu"><i class="fa fa-plus fa-fw"></i>Create</button></div><div class="col-lg-9"></div></div>'
                    + assemStuSelect(studentIdList) + '<div class="col-lg-12" id="infoTable"></div>');
            $('#studentSelect').chosen();

            $('#createStu').click(function () {
                console.log('Teacher -> Student Info -> Create Student');

                BootstrapDialog.show({
                    type: BootstrapDialog.TYPE_PRIMARY,
                    title: 'Create',
                    message: function (diaSelf) {
                        let msg = '<label>Student ID</label><input name="studentNo" class="form-control" placeholder="Enter Student ID">';

                        let select = '';
                        teacherCourse.forEach(function (crs) {
                            select += `<option value="${crs}">${crs}</option>`;
                        });
                        msg += `<label>Course</label><select name="courseNo" class="form-control">${select}</select>`;

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
                                url: `${tgtSkt}ssms/tea/addOneSC`,
                                data: formData,
                                successCb: function (info) {

                                },
                                failCb: function (e) {
                                    alert(JSON.stringify(e));
                                }
                            });
                            diaSelf.close();
                            refreshStuInfo();
                        }
                    }],
                    closable: true
                });
            });

            $('#studentConfirm').click(function () {
                console.log('Teacher -> Student Info -> Search Student');

                let studentNo = $('#studentSelect').val();
                $('#infoTable').text('');
                myAjax({
                    type: 'GET',
                    url: `${tgtSkt}ssms/tea/getOneSI/${studentNo}`,
                    data: '',
                    successCb: function (studentInfo) {
                        $('#infoTable')
                            .html(assemInfo(studentInfo, 'stu') + makeModifyBtn());

                        $('#deleteStu').click(function () {
                            console.log('Teacher -> Student Info -> Search Student -> Delete Student');

                            BootstrapDialog.show({
                                type: BootstrapDialog.TYPE_PRIMARY,
                                title: 'Delete',
                                message: function (diaSelf) {
                                    let msg = `<label>Student ID</label><input name="studentNo" class="form-control" value="${studentInfo.studentNo}" disabled>`;

                                    let select = '';
                                    teacherCourse.forEach(function (crs) {
                                        select += `<option value="${crs}">${crs}</option>`;
                                    });
                                    msg += `<label>Course</label><select name="courseNo" class="form-control">${select}</select>`;

                                    msg = `<form id="createStu">${msg}</form>`;

                                    return msg;
                                },
                                buttons: [{
                                    label: `<span class="glyphicon glyphicon-remove"> Submit</span>`,
                                    cssClass: 'btn-danger',
                                    action: function (diaSelf) {
                                        let formData = qsToFd('form#createStu');
                                        myAjax({
                                            type: 'POST',
                                            url: `${tgtSkt}ssms/tea/deleteOneSC/${formData.studentNo}/${formData.courseNo}`,
                                            data: formData,
                                            successCb: function (info) {

                                            },
                                            failCb: function (e) {
                                                alert(JSON.stringify(e));
                                            }
                                        });
                                        diaSelf.close();
                                        refreshStuInfo();
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

function assemTeaSelect(TeacherIdList) {
    let opts = '<option value=""></option>';
    TeacherIdList.forEach(function (teaId) {
        opts += `<option value="${teaId}">${teaId}</option>`;
    });

    opts = `<div class="col-lg-9"><select data-placeholder="Choose a Teacher" class="col-lg-4" id="teacherSelect">${opts}</select></div>`;
    opts += '' +
        '<div class="col-lg-3"><button type="button" class="btn btn-primary" id="teacherConfirm"><i class="fa fa-search fa-fw"></i>Confirm</button></div>';

    return `<div class="row ctrl-row">${opts}</div>`;
}

function refreshTeaInfo() {
    console.log('Teacher -> Teacher Info');

    $('#wrapper-name h1').text('Loading...');
    $('#wrapper-info div.col-lg-12').text('');

    myAjax({
        type: 'GET',
        url: `${tgtSkt}ssms/tea/allTeacherNo`,
        data: '',
        successCb: function (teacherIdList) {
            $('#wrapper-name h1').text('Teacher Information');
            $('#wrapper-info div.col-lg-12')
                .html(assemTeaSelect(teacherIdList) + '<div class="col-lg-12" id="infoTable"></div>');
            $('#teacherSelect').chosen();

            $('#teacherConfirm').click(function () {
                console.log('Teacher -> Teacher Info -> Search Teacher');

                let teacherNo = $('#teacherSelect').val();
                $('#infoTable').text('');
                myAjax({
                    type: 'GET',
                    url: `${tgtSkt}ssms/tea/getOneTI/${teacherNo}`,
                    data: '',
                    successCb: function (teacherInfo) {
                        $('#infoTable')
                            .html(assemInfo(teacherInfo, 'tea'));
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
 * Course Information
 *******************/

function assemCrsSelect(CourseIdList) {
    let opts = '<option value=""></option>';
    CourseIdList.forEach(function (courseNo) {
        opts += `<option value="${courseNo}">${courseNo}</option>`;
    });

    opts = `<div class="col-lg-9"><select data-placeholder="Choose a Course" class="col-lg-4" id="courseSelect">${opts}</select></div>`;
    opts += '' +
        '<div class="col-lg-3"><button type="button" class="btn btn-primary" id="courseConfirm"><i class="fa fa-search fa-fw"></i>Confirm</button></div>';

    return `<div class="row ctrl-row">${opts}</div>`;
}

function searchCourse(courseNo, courseList) {
    for (let i = 0; i < courseList.length; ++i) {
        if (courseList[i].courseNo === courseNo) {
            return courseList[i];
        }
    }
}

function refreshCrsInfo() {
    console.log('Teacher -> Course Info');

    $('#wrapper-name h1').text('Loading...');
    $('#wrapper-info div.col-lg-12').text('');

    myAjax({
        type: 'GET',
        url: `${tgtSkt}ssms/tea/myCourse`,
        data: '',
        successCb: function (courseList) {
            $('#wrapper-name h1').text('Course Information');
            let courseIdList = courseList.map(function (crs) {
                return crs.courseNo;
            });

            $('#wrapper-info div.col-lg-12')
                .html(assemCrsSelect(courseIdList) + '<div class="col-lg-12" id="infoTable"></div>');
            $('#courseSelect').chosen();

            $('#courseConfirm').click(function () {
                console.log('Teacher -> Course Info -> Search Course');

                let courseNo = $('#courseSelect').val();
                let courseInfo = searchCourse(courseNo, courseList);
                $('#infoTable')
                    .html(assemInfo(courseInfo, 'crs'));
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
