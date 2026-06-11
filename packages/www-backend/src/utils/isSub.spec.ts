import { isSub } from './isSub';

describe('isSub', () => {
  jest.setTimeout(30000);

  if (process.env.TEST_SKIP_SPEC === 'true') {
    it('skip spec testing', () => {});
    return;
  }

  it('works', async () => {
    expect(isSub('21ab1246-38ef-44e1-82aa-aa3262a43b69')).toEqual(true);
    expect(isSub('d3c4a8e2-e0e1-7080-d84e-e5f7b0122ab1')).toEqual(true);
  });
});
