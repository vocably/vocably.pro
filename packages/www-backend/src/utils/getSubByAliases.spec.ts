import { getSubByAliases } from './getSubByAliases';

describe('getSubByAliases', () => {
  jest.setTimeout(30000);

  if (process.env.TEST_SKIP_SPEC === 'true') {
    it('skip spec testing', () => {});
    return;
  }

  it('works', async () => {
    const result = await getSubByAliases([
      '21ab1246-38ef-44e1-82aa-aa3262a43b69',
    ]);

    if (result.success === false) {
      console.log(result);
      expect(true).toBeFalsy();
      return;
    }

    expect(result.success).toBe(true);
    expect(result.value).toEqual('21ab1246-38ef-44e1-82aa-aa3262a43b69');
  });
});
