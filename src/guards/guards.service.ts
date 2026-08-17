import { Injectable,CanActivate,ExecutionContext } from '@nestjs/common';

@Injectable()
export class GuardsService  implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
    return true;
  }

}
