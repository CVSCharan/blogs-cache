const Redis = jest.fn().mockImplementation(() => ({
  on: jest.fn(),
  quit: jest.fn().mockResolvedValue('OK'),
  status: 'ready',
  get: jest.fn(),
  set: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  keys: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
  ttl: jest.fn(),
}));

export default Redis;
