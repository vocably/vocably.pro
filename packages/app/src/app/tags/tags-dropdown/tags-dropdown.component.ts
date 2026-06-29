import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { TranslocoModule } from '@jsverse/transloco';
import { TagItem } from '@vocably/model';

@Component({
  selector: 'app-tags-dropdown',
  templateUrl: './tags-dropdown.component.html',
  styleUrls: ['./tags-dropdown.component.scss'],
  imports: [
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    MatDivider,
    MatIcon,
    NgFor,
    NgIf,
    TranslocoModule,
  ],
})
export class TagsDropdownComponent implements OnInit {
  @Input() tags: TagItem[] = [];
  @Input() noTags = false;
  @Input() selectedTags: TagItem[] = [];

  @Output() onSelect = new EventEmitter<TagItem[]>();
  @Output() onNoTags = new EventEmitter<boolean>();

  private selectedIds = new Set<string>();

  ngOnInit() {
    this.selectedTags.forEach((tag) => this.selectedIds.add(tag.id));
  }

  isChecked(tag: TagItem): boolean {
    return this.selectedIds.has(tag.id);
  }

  toggle(tag: TagItem): void {
    if (this.selectedIds.has(tag.id)) {
      this.selectedIds.delete(tag.id);
    } else {
      this.selectedIds.add(tag.id);
    }

    this.onSelect.emit(this.tags.filter((tag) => this.selectedIds.has(tag.id)));
  }

  toggleNoTags(): void {
    this.onNoTags.emit(!this.noTags);
  }
}
