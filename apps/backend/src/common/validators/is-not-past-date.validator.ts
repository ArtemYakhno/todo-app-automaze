import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

function isStartOfTodayUtcOrLater(value: string): boolean {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const now = new Date();
  const startOfTodayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );

  return date.getTime() >= startOfTodayUtc;
}

export function IsNotPastDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isNotPastDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return typeof value === 'string' && isStartOfTodayUtcOrLater(value);
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must not be earlier than today`;
        },
      },
    });
  };
}
