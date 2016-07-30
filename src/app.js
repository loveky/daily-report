require('./app.scss')

import $ from 'jquery'; 
import 'bootstrap';
import dataService from './dataService';
import currentDate from './currentDate';
import Clipboard from 'clipboard';

let todayRelease = [];
let todayTask = [];

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

        if (task.taskRelease) {
            todayRelease.push(task)
        }
        else {
            todayTask.push(task);
        }
    }

    for (let release of todayRelease) {
        $todayRelase.append(`<p class="task">${index++}. ${release.taskContent}</p>`)
    }

    index = 1;
    for (let task of todayTask) {
        $todayTask.append(`<p class="task">${index++}. ${task.taskContent} ${task.taskProgress > 0 ? task.taskProgress + '%' : ''}</p>`)
    }
});

// 监听当天已经提交任务的人员列表
dataService.ref(refPathOfToday('repoteres')).on('value', (snapshot) => {

});

// 添加任务
$('.add-task').on('click', () => {
    $($('#new-task-template').html()).insertBefore('.task-operation');
});

// 提交任务
$('.submit-task').on('click', function () {
    const $this = $(this);

    $('.task-input').each(function () {
        const $task = $(this);
        const taskContent = $.trim($task.find('.task-content').val());
        const taskProgress = $task.find('.task-progress input').val();
        const taskRelease = $task.find('.release-task').is(':checked');
        
        if (taskContent.length > 0) {
            dataService.ref(refPathOfToday('tasks')).push({taskContent, taskProgress, taskRelease})
        }
    });
});

const clipboard = new Clipboard('.send-report');
$('.send-report').tooltip({
    container: 'body',
    html: true,
    trigger: 'manual',
    title: '日报内容已复制至剪切板，请<a href="mailto:fe-rd1@jd.com?subject=前端研发一组' + currentDate + '早会记要">打开邮件客户端</a>粘贴后发送～'
})
clipboard.on('success', () => {
    $('.send-report').tooltip('show');
    setTimeout(() => {$('.send-report').tooltip('hide')}, 3000)
});