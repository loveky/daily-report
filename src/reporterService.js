import dataService from './dataService';
import Promise from 'bluebird';
import snapshotToArray from './snapshotToArray';
import refPathOfToday from './refPathOfToday';

export function getAllActiveReporters() {
    return Promise.try(() => {
        return dataService.ref('users').once('value')
    }).then((snapshot) => {
        return snapshotToArray(snapshot);
    }).then((allReporters) => {
        return allReporters.filter((reporter) => reporter.enable);
    });
}

export function getTodayReporters() {
    return Promise.try(() => {
        return dataService.ref(refPathOfToday('reporteres')).once('value');
    }).then((snapshot) => {
        return snapshotToArray(snapshot);
    });
}

export function onTodayReporterChange(callback) {
    dataService.ref(refPathOfToday('reporteres')).on('value', function(snapshot) {
        var reporters = snapshotToArray(snapshot);

        callback.call(null, reporters);
    });
}