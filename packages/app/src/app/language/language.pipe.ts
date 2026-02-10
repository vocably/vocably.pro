import { Pipe, PipeTransform } from '@angular/core';
import { getFullLanguageName } from '@vocably/model';

@Pipe({ name: 'language' })
export class LanguagePipe implements PipeTransform {
  transform(code: string): string {
    return getFullLanguageName(code);
  }
}
