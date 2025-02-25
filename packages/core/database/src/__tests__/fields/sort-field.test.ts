import { Database } from '../../database';
import { mockDatabase } from '../';
import { SortField } from '../../fields';

describe('string field', () => {
  let db: Database;

  beforeEach(async () => {
    db = mockDatabase();
    await db.clean({ drop: true });
    db.registerFieldTypes({
      sort: SortField,
    });
  });

  afterEach(async () => {
    await db.close();
  });

  it('should init sorted value with scopeKey', async () => {
    const Test = db.collection({
      name: 'tests',
      fields: [
        {
          type: 'string',
          name: 'name',
        },
        {
          type: 'string',
          name: 'group',
        },
      ],
    });

    await db.sync();
    await Test.repository.create({
      values: [
        {
          group: 'a',
          name: 'r1',
        },
        {
          group: 'b',
          name: 'r2',
        },
        {
          group: 'a',
          name: 'r3',
        },
        {
          group: 'b',
          name: 'r4',
        },
      ],
    });

    Test.setField('sort', { type: 'sort', scopeKey: 'group' });

    await db.sync();

    const records = await Test.repository.find({});
    const r3 = records.find((r) => r.get('name') === 'r3');
    expect(r3.get('sort')).toBe(2);
  });

  it('should init sorted value by createdAt when primaryKey not exists', async () => {
    const Test = db.collection({
      autoGenId: false,
      name: 'tests',
    });

    await db.sync();
    await Test.repository.create({
      values: [{}, {}, {}],
    });

    // add sort field
    Test.setField('sort', { type: 'sort' });

    let err;
    try {
      await db.sync();
    } catch (e) {
      err = e;
    }
    expect(err).toBeFalsy();
  });

  it('sort', async () => {
    const Test = db.collection({
      name: 'tests',
      fields: [{ type: 'sort', name: 'sort' }],
    });
    await db.sync();

    const test1 = await Test.model.create<any>();
    expect(test1.sort).toBe(1);
    const test2 = await Test.model.create<any>();
    expect(test2.sort).toBe(2);
    const test3 = await Test.model.create<any>();
    expect(test3.sort).toBe(3);
  });

  it('should init sort value on data already exits', async () => {
    const Test = db.collection({
      name: 'tests',
      fields: [
        {
          type: 'string',
          name: 'name',
        },
      ],
    });

    await db.sync();

    await db.getRepository('tests').create({
      values: {
        name: 't1',
      },
    });
    await db.getRepository('tests').create({
      values: {
        name: 't2',
      },
    });
    await db.getRepository('tests').create({
      values: {
        name: 't3',
      },
    });

    const field = Test.addField('sort', { type: 'sort' });

    await field.sync({});

    const items = await db.getRepository('tests').find({
      order: ['id'],
    });
    expect(items.map((item) => item.get('sort'))).toEqual([1, 2, 3]);
  });

  test.skip('simultaneously create ', async () => {
    const Test = db.collection({
      name: 'tests',
      fields: [{ type: 'sort', name: 'sort' }],
    });

    await db.sync();

    const promise = [];
    for (let i = 0; i < 3; i++) {
      promise.push(Test.model.create());
    }

    await Promise.all(promise);
    const tests = await Test.model.findAll();
    const sortValues = tests.map((t) => t.get('sort')).sort();
    expect(sortValues).toEqual([1, 2, 3]);
  });

  it('skip if sort value not empty', async () => {
    const Test = db.collection({
      name: 'tests',
      fields: [{ type: 'sort', name: 'sort' }],
    });
    await db.sync();
    const test1 = await Test.model.create<any>({ sort: 3 });
    expect(test1.sort).toBe(3);
    const test2 = await Test.model.create<any>();
    expect(test2.sort).toBe(4);
    const test3 = await Test.model.create<any>();
    expect(test3.sort).toBe(5);
  });

  it('scopeKey', async () => {
    const Test = db.collection({
      name: 'tests',
      fields: [
        { type: 'sort', name: 'sort', scopeKey: 'status' },
        { type: 'string', name: 'status' },
      ],
    });
    await db.sync();

    const t1 = await Test.model.create({ status: 'publish' });
    const t2 = await Test.model.create({ status: 'publish' });
    const t3 = await Test.model.create({ status: 'draft' });
    const t4 = await Test.model.create({ status: 'draft' });

    expect(t1.get('sort')).toBe(1);
    expect(t2.get('sort')).toBe(2);
    expect(t3.get('sort')).toBe(1);
    expect(t4.get('sort')).toBe(2);

    t1.set('status', 'draft');
    await t1.save();

    await t1.reload();
    expect(t1.get('sort')).toBe(3);
  });
});
