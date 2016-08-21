require('./app.scss')
require('./index.html');

import $ from 'jquery';
import 'bootstrap';
import Clipboard from 'clipboard';
import Promise from 'bluebird';

import dataService from './dataService';
import currentDate from './currentDate';
import snapshotToArray from './snapshotToArray';
import refPathOfToday from './refPathOfToday';
import * as reporterService from './reporterService';
import * as taskService from './taskService';

let todayRelease = [];
let todayTask = [];
let currentReporter;
let allActiveReportersCache;

$('.today').text(currentDate);

// 监听当天任务列表变化
taskService.onTodayTaskChange(function(tasks) {
    todayRelease = [];
    todayTask = [];
    const $todayRelase = $('.today-release');
    const $todayTask = $('.today-task');
    let task, release, index = 1;

    $todayRelase.find('p').remove();
    $todayTask.find('p').remove();

    for (let task of tasks) {
        if (task.taskRelease) {
            todayRelease.push(task)
        } else {
            todayTask.push(task);
        }
    }

    for (let release of todayRelease) {
        $todayRelase.append(`<p data-key="${release.__id}" data-id="${release.reporterID}" class="task">${index++}. ${release.taskContent}<span class="delete">x</span></p>`)
    }

    index = 1;
    for (let task of todayTask) {
        $todayTask.append(`<p data-key="${task.__id}" data-id="${task.reporterID}" class="task">${index++}. ${task.taskContent} ${task.taskProgress > 0 ? task.taskProgress + '%' : ''}<span class="delete">x</span></p>`)
    }
});

// 监听当天已经提交任务的人员列表
Promise.all([
    reporterService.getAllActiveReporters(),
    reporterService.getTodayReporters()
]).then(([allActiveReporters, reporters]) => {
    allActiveReportersCache = allActiveReporters;
    updateWaittingReporters(reporters);

    reporterService.onTodayReporterChange(updateWaittingReporters);
})

function updateWaittingReporters(reporters) {
    const waitingreporters = allActiveReportersCache.filter(reporter => reporters.indexOf(reporter.id) < 0).map(reporter => reporter.name);
    if (waitingreporters.length > 0) {
        $('.waiting-reporters').removeClass('hide').find('span').remove();
        waitingreporters.forEach(function(reporter) {
            $('.waiting-reporters').append(`<span class="reporter label label-default">${reporter}</span>`)
        })
    } else {
        $('.waiting-reporters').addClass('hide');
    }

    if (reporters.length > 0) {
        var html = '<p>已提交用户：</p>';

        for (let reporterID of reporters) {
            let reporter = allActiveReportersCache.filter(reporter => reporter.id == reporterID)[0];

            if (!reporter){
                continue;
            }

            html += `<span data-id="${reporter.id}" class="reporter label label-success">${reporter.name}</span>`
        }

        $('.submitted-reporters').html(html);
    }
}

// 高亮选中用户的任务
$('.submitted-reporters').on('click', '.reporter', function () {
    const $this = $(this);
    const reporterID = $this.data('id');

    if ($this.hasClass('label-success')) {
        $this.removeClass('label-success').addClass('label-info').siblings('.reporter').removeClass('label-info').addClass('label-success');
        $('.task').removeClass('highlight').filter(function () {
            return $(this).data('id') == reporterID;
        }).addClass('highlight');
    }
    else {
        $this.removeClass('label-info').addClass('label-success');
        $('.task').removeClass('highlight');
    }
});

// 添加任务
$('.add-task').on('click', () => {
    $($('#new-task-template').html()).insertBefore('.task-operation');
});

// 删除任务
$('#report-container').on('click', '.delete', function() {
    const $task = $(this).closest('.task');

    dataService.ref(refPathOfToday('tasks') + '/' + $task.data('key')).remove().then(() => {
        $task.remove();
    })
});

// 提交任务(点击提交按钮)
$('.submit-task').on('click', submitTask);

// 提交任务(ctrl+enter)
$('#edit-container').on('keydown', 'input', function ($event) {
    if ($event.ctrlKey && $event.keyCode == 13) {
        submitTask();
    }
});

$('.submit-task').tooltip({
    title: 'Ctrl+Enter可以一键提交哟'
})

function submitTask() {
    const submittingTasks = [];

    $('.task-input').each(function() {
        const $task = $(this);
        const taskContent = $.trim($task.find('.task-content').val());
        const taskProgress = $task.find('.task-progress input').val();
        const taskRelease = $task.find('.release-task').is(':checked');

        if (taskContent.length > 0) {
            submittingTasks.push(taskService.saveTask({ taskContent, taskProgress, taskRelease, reporterID: currentReporter}));
        }
    });

    const allSubmitted = Promise.all(submittingTasks);
    allSubmitted.then(hideEditContainer);
    allSubmitted.then(() => {
        dataService.ref(refPathOfToday('reporteres')).push(currentReporter);
    })
}

// 发送会议纪要：复制内容到剪切板，弹tooltip
const clipboard = new Clipboard('.send-report');
$('.send-report').tooltip({
    container: 'body',
    html: true,
    trigger: 'manual',
    title: '日报内容已复制至剪切板，请<a href="mailto:?subject=前端研发一组' + currentDate + '早会记要">打开邮件客户端</a>粘贴后发送～'
})
clipboard.on('success', () => {
    $('.send-report').tooltip('show');
    setTimeout(() => { $('.send-report').tooltip('hide') }, 3000)
});

// 收起右侧区域，展示区域居中
function hideEditContainer() {
    $('#edit-container').slideUp(500, () => {
        $('<div class="col-md-3"></div>').insertBefore('#report-container');
        $('.submitted-reporters').css('left','+=150')
    });
}

// 自动弹出选人弹框
$('#myModal').modal({
    show: true,
    backdrop: 'static',
    keyboard: false
});

$('body').on('click', '#viewOnly', () => {
    $('#myModal').modal('hide');
    hideEditContainer();
});

$('body').on('click', '#userSelected', function(e) {
    e.preventDefault();

    if ($(this).is(':disabled')) {
        return;
    }

    currentReporter = $('#myModal .label-success').data('id');
    $('#myModal').modal('hide');
});

// 加载当天活动用户列表
reporterService.getAllActiveReporters().then(allReporters => {
    for (let reporter of allReporters) {
        $('#myModal .modal-body').append(`<span data-id="${reporter.id}" class="reporter label label-default">${reporter.name}</span>`)
    }
});

$('body').on('click', '.modal-body .reporter', function() {
    $(this).addClass('label-success').siblings().removeClass('label-success').addClass('label-default');
    $('#userSelected').prop('disabled', false);
});