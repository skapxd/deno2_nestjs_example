import { randomUUID } from 'node:crypto';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import EventSource from 'eventsource';
import request from 'supertest';

import { mainConfig } from '#/src/utils/main-config.no-spec';

import { SseModule } from './sse.module';

describe('SseController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SseModule],
    }).compile();

    app = module.createNestApplication();

    mainConfig(app);

    await app.init();

    await app.listen(0);
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  it.skip('should recibe event', async () => {
    const uuid = randomUUID();
    const url = await app.getUrl();
    // @ts-expect-error: ERR
    const eventSource = new EventSource(url + '/sse/' + uuid);

    const messagePromise = new Promise((resolve, reject) => {
      eventSource.addEventListener('counter', ({ data }) => {
        resolve(data);
      });

      eventSource.onerror = (err) => {
        reject(err);
      };
    });

    await request(app.getHttpServer())
      .post('/sse')
      .query({ counter: 1, id: uuid });

    const resp = await messagePromise;

    expect(resp).toMatchSnapshot();
  });

  it('should render html', async () => {
    const resp = await request(app.getHttpServer()).get('/sse?id=uuid');

    expect(resp.text).toMatchSnapshot();
  });
});
