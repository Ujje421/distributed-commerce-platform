import { Role } from '@ecommerce/common';

export class UserRegisteredEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly roles: Role[],
  ) {}
}
