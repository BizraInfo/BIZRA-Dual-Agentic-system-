import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests must be below 500ms
        http_req_failed: ['rate<0.01'],   // Less than 1% failure rate
    },
};

export default function () {
    let res = http.get('http://localhost:8080/health');
    check(res, {
        'status is 200': (r) => r.status === 200,
        'ihsan is verified': (r) => r.json('ihsan_verified') === true,
    });
    sleep(1);
}
