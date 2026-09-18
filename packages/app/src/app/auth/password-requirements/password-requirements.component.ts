import { NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { checkPassword, PasswordCheck } from '@vocably/sulna';

const rules: { key: keyof PasswordCheck; label: string }[] = [
  { key: 'minLength', label: 'auth.password_rules.min_length' },
  { key: 'lowercase', label: 'auth.password_rules.lowercase' },
  { key: 'uppercase', label: 'auth.password_rules.uppercase' },
  { key: 'digit', label: 'auth.password_rules.digit' },
  { key: 'symbol', label: 'auth.password_rules.symbol' },
];

@Component({
  selector: 'app-password-requirements',
  templateUrl: './password-requirements.component.html',
  styleUrls: ['./password-requirements.component.scss'],
  imports: [NgFor, TranslocoModule],
})
export class PasswordRequirementsComponent {
  @Input() password = '';

  get rules() {
    const check = checkPassword(this.password);
    return rules.map((rule) => ({ ...rule, met: check[rule.key] }));
  }
}
