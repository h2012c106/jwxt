'use strict';

let student;

/*******************
 * Verify
 *******************/
$(document).ready(function () {
    myAjax({
        type:'GET',
        url:`${tgtSkt}ssms/stu/myInfo`,
        data:'',
        successCb:function (studentInfo) {
            student = studentInfo.name;
            $('span#userName').text(` ${student}`);
        }
    });
});


/*******************
 * Grade
 *******************/

function assemGradeInfo(grades) {
    // grades = [{
    //     name: 'OS',
    //     grade: 100,
    //     credit: 2
    // }, {
    //     name: 'A',
    //     grade: 10,
    //     credit: 1.7
    // }, {
    //     name: 'B',
    //     grade: 0,
    //     credit: 2
    // }, {
    //     name: 'p',
    //     grade: 100,
    //     credit: 10
    // }];

    let fails = 0;
    let over85 = 0;
    let pass = 0;
    let avgGrade = 0;
    let sumCredit = 0;
    grades.forEach(function (grd) {
        if (grd.grade < 60) {
            ++fails;
        }
        if (grd.grade >= 85) {
            ++over85;
        }
        if (grd.grade >= 60) {
            ++pass;
        }
        avgGrade += grd.grade * grd.credit;
        sumCredit += grd.credit;
    });
    avgGrade /= sumCredit;
    avgGrade = avgGrade.toFixed(2);

    let panel = `<div class="col-lg-3 col-md-6">
                    <div class="panel panel-primary">
                        <div class="panel-heading">
                            <div class="row">
                                <div class="col-xs-3">
                                    <i class="fa fa-star fa-5x"></i>
                                </div>
                                <div class="col-xs-9 text-right">
                                    <div class="huge">${pass}</div>
                                    <div>Passed!</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;

    panel += `<div class="col-lg-3 col-md-6">
                    <div class="panel panel-green">
                        <div class="panel-heading">
                            <div class="row">
                                <div class="col-xs-3">
                                    <i class="fa fa-smile-o fa-5x"></i>
                                </div>
                                <div class="col-xs-9 text-right">
                                    <div class="huge">${over85}</div>
                                    <div>Done Well!</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;

    panel += `<div class="col-lg-3 col-md-6">
                    <div class="panel panel-red">
                        <div class="panel-heading">
                            <div class="row">
                                <div class="col-xs-3">
                                    <i class="fa fa-frown-o fa-5x"></i>
                                </div>
                                <div class="col-xs-9 text-right">
                                    <div class="huge">${fails}</div>
                                    <div>Failed!</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;

    panel += `<div class="col-lg-3 col-md-6">
                    <div class="panel panel-default">
                        <div class="panel-heading">
                            <div class="row">
                                <div class="col-xs-3">
                                    <i class="fa fa-slack fa-5x"></i>
                                </div>
                                <div class="col-xs-9 text-right">
                                    <div class="huge">${avgGrade}</div>
                                    <div>Average</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;

    return panel;
}

function assemGradeTable(grades) {
    // grades = [{
    //     name: 'OS',
    //     grade: 100,
    //     credit: 2
    // }, {
    //     name: 'A',
    //     grade: 10,
    //     credit: 1.7
    // }, {
    //     name: 'B',
    //     grade: 0,
    //     credit: 2
    // }, {
    //     name: 'p',
    //     grade: 100,
    //     credit: 10
    // }];

    let tbody = '';
    for (let i = 0; i < grades.length; ++i) {
        tbody += `<tr>
                    <th>${grades[i].courseName}</th>
                    <th>${grades[i].grade}</th>
                    <th>${grades[i].credit.toFixed(1)}</th>
                  </tr>`;
    }

    return `<div class="col-lg-12">
                    <div class="panel panel-default">
                        <div class="panel-body">
                            <table width="100%" class="table table-striped table-bordered table-hover" id="gradeTable">
                                <thead>
                                <tr>
                                    <th>Course</th>
                                    <th>Grade</th>
                                    <th>Credit</th>
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

$('#grade').click(function () {
    $('#wrapper-name h1').text('Loading...');
    $('#wrapper-info div.col-lg-12').text('');

    myAjax({
        type: 'GET',
        url:`${tgtSkt}ssms/stu/getsc`,
        data: '',
        successCb: function (gradeList) {
            $('#wrapper-info div.col-lg-12').html(assemGradeInfo(gradeList) + assemGradeTable(gradeList)).ready(function () {
                $('#gradeTable').dataTable();
                $('#wrapper-name h1').text('Grade');
            });
        },
        failCb: function (e) {
            alert(JSON.stringify(e));
        }
    });
});

/*******************
 * Statics
 *******************/

function assemBar(grades) {
    // grades = [{
    //     name: 'OS',
    //     grade: 100,
    //     credit: 2
    // }, {
    //     name: 'A',
    //     grade: 10,
    //     credit: 1.7
    // }, {
    //     name: 'B',
    //     grade: 0,
    //     credit: 2
    // }, {
    //     name: 'p',
    //     grade: 100,
    //     credit: 10
    // }];

    let xA = [];
    let yA = [];
    grades.sort(function (x, y) {
        return y.grade - x.grade;
    });
    grades.forEach(function (grd) {
        xA.push(grd.courseName);
        yA.push(grd.grade);
    });

    return {xA, yA};
}

$('#statics').click(function () {
    $('#wrapper-name h1').text('Loading...');
    $('#wrapper-info div.col-lg-12').text('');

    myAjax({
        type: 'GET',
        url:`${tgtSkt}ssms/stu/getsc`,
        data: '',
        successCb: function (gradeList) {
            $('#wrapper-info div.col-lg-12').html('<canvas class="col-lg-12" id="gradeBar"></canvas>');
            let assemData = assemBar(gradeList);
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

            $('#wrapper-name h1').text('Statics');
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
        },
        failCb: function (e) {
            alert(JSON.stringify(e));
        }
    });
});

/*******************
 * Personal Information
 *******************/

$('#personalInfo').click(function () {
    $('#wrapper-name h1').text('Loading...');
    $('#wrapper-info div.col-lg-12').text('');

    myAjax({
        type: 'GET',
        url:`${tgtSkt}ssms/stu/myInfo`,
        data: '',
        successCb: function (studentInfo) {
            $('#wrapper-info div.col-lg-12').html(assemInfo(studentInfo,'stu')).ready(function () {
                $('#wrapper-name h1').text('Personal Information');
            });
        },
        failCb: function (e) {
            alert(JSON.stringify(e));
        }
    });
});
