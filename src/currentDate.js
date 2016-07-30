let time = new Date();

export default [time.getFullYear(), (time.getMonth() < 9 ? '0' : '' ), time.getMonth(), (time.getDate() < 9 ? '0' : '' ), time.getDate()].join('');