import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ServiceJwtAuthGuard extends AuthGuard('jwt') {}
