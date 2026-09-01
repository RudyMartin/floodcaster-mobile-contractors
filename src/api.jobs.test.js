import { getJob, getJobBuildings } from './api';

beforeAll(() => { localStorage.setItem('floodcaster_api_key', 'test-key'); });
afterAll(() => { localStorage.removeItem('floodcaster_api_key'); });

test('getJob and getJobBuildings are exported functions', () => {
  expect(typeof getJob).toBe('function');
  expect(typeof getJobBuildings).toBe('function');
});

test('getJobBuildings targets the buildings path with a limit', async () => {
  const spy = vi.spyOn(global, 'fetch').mockResolvedValue({
    ok: true, status: 200,
    headers: { get: () => null },
    json: async () => ({ data: [], meta_query: { total: 0 } }),
  });
  await getJobBuildings('job-abc', 500);
  expect(spy).toHaveBeenCalledWith(
    expect.stringContaining('/jobs/job-abc/buildings?limit=500'),
    expect.objectContaining({ headers: expect.objectContaining({ 'X-API-Key': expect.anything() }) })
  );
  spy.mockRestore();
});
