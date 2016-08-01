let time = new Date(); 

export default [time.getFullYear(), '-', (time.getMonth() + 1 < 9 ? '0' : '' ), time.getMonth() + 1, '-', (time.getDate() < 9 ? '0' : '' ), time.getDate()].join('');