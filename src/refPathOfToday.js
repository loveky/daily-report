import currentDate from './currentDate';

export default function refPathOfToday(path) {
    return 'reports/' + currentDate.replace(/-/g, '') + '/' + path;
}