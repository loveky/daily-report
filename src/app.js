require('./app.scss')

import $ from 'jquery'; 
import 'bootstrap';
import dataService from './dataService';
import currentDate from './currentDate';

let todayRelease = [];
let todayTask = [];

$('.today').text(currentDate.replace(/(\d\d\d\d)(\d\d)(\d\d)/, '$1-$2-$3'));

// 监听当天任务列表变化
dataService.ref(`reports/${currentDate}/tasks`).on('value', (snapshot) => {
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
        $todayTask.append(`<p class="task">${index++}. ${task.taskContent} ${task.taskProgress}%</p>`)
    }
});

// 监听当天已经提交任务的人员列表
dataService.ref(`reports/${currentDate}/reporters`).on('value', (snapshot) => {

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
            dataService.ref(`reports/${currentDate}/tasks`).push({taskContent, taskProgress, taskRelease})
        }
    });
});