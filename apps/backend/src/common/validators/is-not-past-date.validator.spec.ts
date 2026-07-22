import { validate } from 'class-validator';
import { IsNotPastDate } from './is-not-past-date.validator';

class TestDto {
  @IsNotPastDate()
  dueDate!: string;
}

async function validateDueDate(dueDate: string) {
  const dto = new TestDto();
  dto.dueDate = dueDate;
  return validate(dto);
}

describe('IsNotPastDate', () => {
  it('passes for a date later than today', async () => {
    const future = new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 30,
    ).toISOString();

    const errors = await validateDueDate(future);

    expect(errors).toHaveLength(0);
  });

  it('passes for today (start of the UTC day)', async () => {
    const now = new Date();
    const startOfTodayUtc = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    ).toISOString();

    const errors = await validateDueDate(startOfTodayUtc);

    expect(errors).toHaveLength(0);
  });

  it('fails for a date before today', async () => {
    const past = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();

    const errors = await validateDueDate(past);

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isNotPastDate');
  });

  it('fails for a non-date string', async () => {
    const errors = await validateDueDate('not-a-date');

    expect(errors).toHaveLength(1);
  });
});
