import { AggregateRoot } from '@nestjs/cqrs';
import { Role } from '@ecommerce/common';
import { UserRegisteredEvent } from '../events/user-registered.event';

export class User extends AggregateRoot {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public passwordHash: string | null,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly roles: Role[],
    public readonly status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION',
    public readonly mfaEnabled: boolean,
  ) {
    super();
  }

  static register(
    id: string,
    email: string,
    passwordHash: string | null,
    firstName: string,
    lastName: string,
  ): User {
    const user = new User(
      id,
      email,
      passwordHash,
      firstName,
      lastName,
      [Role.CUSTOMER],
      'ACTIVE', // or PENDING_VERIFICATION based on reqs
      false,
    );

    user.apply(new UserRegisteredEvent(id, email, firstName, lastName, [Role.CUSTOMER]));
    return user;
  }
}
