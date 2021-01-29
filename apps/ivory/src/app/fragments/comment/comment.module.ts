import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentAreaFragment } from './comment-area/comment-area.fragment';
import { CommentEntryComponent } from './comment-entry/comment-entry.component';
import { CommentInputComponent } from './comment-input/comment-input.component';
import { CommentSubentryComponent } from './comment-entry/comment-subentry/comment-subentry.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ReactiveComponentModule, PeachaComponentsModule } from '@peacha-core';

@NgModule({
	declarations: [CommentAreaFragment, CommentEntryComponent, CommentInputComponent, CommentSubentryComponent],
	imports: [CommonModule, ReactiveComponentModule, ReactiveFormsModule, PeachaComponentsModule],
	exports: [CommentAreaFragment],
})
export class CommentModule {}
