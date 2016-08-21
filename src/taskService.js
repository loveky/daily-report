import dataService from './dataService';
import Promise from 'bluebird';
import snapshotToArray from './snapshotToArray';
import refPathOfToday from './refPathOfToday';

export function onTodayTaskChange(callback) {
    dataService.ref(refPathOfToday('tasks')).on('value', function(snapshot) {
        var reporters = snapshotToArray(snapshot);

        callback.call(null, reporters);
    });
}

export function onNewTaskAdded (callback) {
	dataService.ref(refPathOfToday('tasks')).on('child_added', function (data) {
		callback.call(null, data.val());
	});
}

export function saveTask(task) {
    return Promise.try(() => {
        dataService.ref(refPathOfToday('tasks')).push(task);
    })
}