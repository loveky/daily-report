require('./app.scss')
require('./index.html');

import $ from 'jquery';
import 'bootstrap';
import dataService from './dataService';
import currentDate from './currentDate';
import Clipboard from 'clipboard';
import Promise from 'bluebird';

let todayRelease = [];
let todayTask = [];
let currentUser;
let todayUsers;

$('.today').text(currentDate);

function refPathOfToday(path) {
    return 'reports/' + currentDate.replace(/-/g, '') + '/' + path;
}

// 监听当天任务列表变化
dataService.ref(refPathOfToday('tasks')).on('value', (snapshot) => {
    todayRelease = [];
    todayTask = [];
    const $todayRelase = $('.today-release');
    const $todayTask = $('.today-task');
    let task, release, index = 1;
    const snapshotData = snapshot.val();

    $todayRelase.find('p').remove();
    $todayTask.find('p').remove();

    for (let key of Object.keys(snapshotData)) {
        task = snapshotData[key];
        task.key = key;

        if (task.taskRelease) {
            todayRelease.push(task)
        } else {
            todayTask.push(task);
        }
    }

    for (let release of todayRelease) {
        $todayRelase.append(`<p data-key="${release.key}" class="task">${index++}. ${release.taskContent}<span class="delete">x</span></p>`)
    }

    index = 1;
    for (let task of todayTask) {
        $todayTask.append(`<p data-key="${task.key}" class="task">${index++}. ${task.taskContent} ${task.taskProgress > 0 ? task.taskProgress + '%' : ''}<span class="delete">x</span></p>`)
    }
});

// 监听当天已经提交任务的人员列表
dataService.ref(refPathOfToday('repoteres')).on('value', (snapshot) => {

});

Promise.all([
    dataService.ref('users').once('value'),
    dataService.ref(refPathOfToday('repoteres')).on('value')
]).then((allUsersSnapshot, repoteresSnapshot) => {
    const allUsers = getData(allUsersSnapshot.val());
    const repoteres = getData(repoteresSnapshot.val());

    
})

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

// 提交任务
$('.submit-task').on('click', function() {
    const $this = $(this);
    const submittingTasks = [];

    $('.task-input').each(function() {
        const $task = $(this);
        const taskContent = $.trim($task.find('.task-content').val());
        const taskProgress = $task.find('.task-progress input').val();
        const taskRelease = $task.find('.release-task').is(':checked');

        if (taskContent.length > 0) {
            submittingTasks.push(dataService.ref(refPathOfToday('tasks')).push({ taskContent, taskProgress, taskRelease }));
        }
    });

    Promise.all(submittingTasks).then(hideEditContainer);
});

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

    currentUser = $('#myModal .label-success').data('id');
    $('#myModal').modal('hide');

});

// 加载当天活动用户列表
dataService.ref('users').once('value').then(snapshot => {
    let key, user;
    const users = snapshot.val();

    for (key of Object.keys(users)) {
        user = users[key];

        if (!user.enable) {
            continue;
        }

        $('#myModal .modal-body').append(`<span data-id="${user.id}" class="user label label-default">${user.name}</span>`)
    }
});

$('body').on('click', '.modal-body .user', function() {
    $(this).addClass('label-success').siblings().removeClass('label-success').addClass('label-default');
    $('#userSelected').prop('disabled', false);
});

function getData(firebaseData = {}) {
    let key, value;
    const result = [];

    for (key of Object.keys(firebaseData)) {
        result.push(firebaseData[key]);
    }

    return result;
}