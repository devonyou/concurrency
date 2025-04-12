import http from 'k6/http';
import { check, sleep } from 'k6';
// import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export const options = {
    vus: 1000,
    duration: '5s',
};

export default function () {
    // const url = 'http://localhost/reservation/overbook';
    // const url = 'http://localhost/reservation/pessimistic';
    // const url = 'http://localhost/reservation/optimistic';
    // const url = 'http://localhost/reservation/bullmq';
    // const url = 'http://localhost/reservation/redis';
    const url = 'http://localhost/reservation/rabbitmq';

    const userId = `user-${__VU}-${__ITER}`;

    const payload = JSON.stringify({
        year: 2025,
        month: 2,
        date: 4,
        userId: userId,
    });
    const params = {
        headers: { 'Content-Type': 'application/json' },
    };

    const res = http.post(url, payload, params);

    check(res, {
        '응답 코드가 200인가?': r => r.status === 200 || r.status === 201,
        '응답 시간이 500ms 이하인가?': r => r.timings.duration < 500,
    });

    sleep(1);
}

// export function handleSummary(data) {
//     return {};
// }
