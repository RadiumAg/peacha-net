import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreatorBlockComponent } from './creator-block/creator-block.component';
import { RelatedWorkComponent } from './related-work/related-work.component';
import { WorkActionsComponent } from './work-actions/work-actions.component';
import { TagsComponent } from './tags/tags.component';
import { GoodInfoComponent } from './good-info/good-info.component';
import { ReactiveComponentModule } from '../../core/reactive';
import { PeachaComponentsModule } from '../peacha-components.module';
import { WorkLikeModule } from '../../features/work-like/work-like.module';
import { FollowModule } from '../../features/follow/follow.module';

@NgModule({
	declarations: [CreatorBlockComponent, RelatedWorkComponent, WorkActionsComponent, TagsComponent, GoodInfoComponent],
	imports: [CommonModule, FollowModule, WorkLikeModule, ReactiveComponentModule, PeachaComponentsModule],
	exports: [CreatorBlockComponent, RelatedWorkComponent, WorkActionsComponent, TagsComponent, GoodInfoComponent],
})
export class WorkRelatedModule {}
