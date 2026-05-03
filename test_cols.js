import { DBFFile } from 'dbffile';

async function test() {
  try {
    const dbf = await DBFFile.open('D:\\EPEOR\\FACTURES.DBF', { encoding: 'win1256' });
    console.log(dbf.fields.map(f => f.name).join(', '));
  } catch (err) {
    console.error(err);
  }
}

test();
