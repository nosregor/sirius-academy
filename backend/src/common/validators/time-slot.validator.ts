import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsValidTimeSlotConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (!(value instanceof Date)) {
      return false;
    }

    const date = value;

    // Check minutes are on 15-minute increments
    if (date.getMinutes() % 15 !== 0) {
      return false;
    }

    // Check seconds and milliseconds are zero (clean timestamp)
    if (date.getSeconds() !== 0 || date.getMilliseconds() !== 0) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be on a 15-minute increment (e.g., 14:00, 14:15, 14:30, 14:45) with no seconds or milliseconds`;
  }
}

export function IsValidTimeSlot(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidTimeSlotConstraint,
    });
  };
}

@ValidatorConstraint({ async: false })
export class IsValidLessonDurationConstraint
  implements ValidatorConstraintInterface
{
  validate(value: unknown, args: ValidationArguments): boolean {
    const object = args.object as Record<string, unknown>;
    const startTime = object.startTime;
    const endTime = value;

    if (!(startTime instanceof Date) || !(endTime instanceof Date)) {
      return false;
    }

    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = durationMs / 60000;

    // Duration must be between 15 minutes and 4 hours (240 minutes)
    return durationMinutes >= 15 && durationMinutes <= 240;
  }

  defaultMessage(): string {
    return 'Lesson duration must be between 15 minutes and 4 hours';
  }
}

export function IsValidLessonDuration(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidLessonDurationConstraint,
    });
  };
}

@ValidatorConstraint({ async: false })
export class IsAfterStartTimeConstraint
  implements ValidatorConstraintInterface
{
  validate(value: unknown, args: ValidationArguments): boolean {
    const object = args.object as Record<string, unknown>;
    const startTime = object.startTime;
    const endTime = value;

    if (!(startTime instanceof Date) || !(endTime instanceof Date)) {
      return false;
    }

    return endTime.getTime() > startTime.getTime();
  }

  defaultMessage(): string {
    return 'End time must be after start time';
  }
}

export function IsAfterStartTime(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAfterStartTimeConstraint,
    });
  };
}
