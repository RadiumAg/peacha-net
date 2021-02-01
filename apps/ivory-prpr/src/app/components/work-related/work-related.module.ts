import { ComponentsModule } from 'src/app/components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreatorBlockComponent } from './creator-block/creator-block.component';
import { RelatedWorkComponent } from './related-work/related-work.component';
import { WorkActionsComponent } from './work-actions/work-actions.component';
import { FollowModule } from 'src/app/features/follow/follow.module';
import { ReactiveComponentModule } from 'src/app/core/reactive';
import { WorkLikeModule } from 'src/app/features/work-like/work-like.module';
import { TagsComponent } from './tags/tags.component';
import { GoodInfoComponent } from './good-info/good-info.component';



@NgModule({
  declarations: [CreatorBlockComponent, RelatedWorkComponent, WorkActionsComponent, TagsComponent, GoodInfoComponent],
  imports: [
    CommonModule,
    FollowModule,
    WorkLikeModule,
    ReactiveComponentModule,
    ComponentsModule
  ],
  exports:[
    CreatorBlockComponent, RelatedWorkComponent, WorkActionsComponent,TagsComponent,GoodInfoComponent
  ]
})
export class WorkRelatedModule { }
