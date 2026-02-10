import { Pipe, PipeTransform } from '@angular/core';
import { UserData } from '@vocably/model';

@Pipe({ name: 'subscriptionStatus' })
export class SubscriptionStatusPipe implements PipeTransform {
  transform(userData: UserData, ...args: unknown[]): string {
    if (!userData.status) {
      return 'unsubscribed';
    }

    if (userData.status === 'past_due') {
      return 'awaiting payment';
    }

    if (userData.status === 'deleted') {
      return 'cancelled';
    }

    return userData.status;
  }
}
