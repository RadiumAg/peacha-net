import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MessagePage } from './message.page';
import { ReceiveReplyPage } from './receive-reply/receive-reply.page';
import { ReceiveLikePage } from './receive-like/receive-like.page';
import { SystemNoticePage } from './system-notice/system-notice.page';
import { SystemInstallPage } from './system-install/system-install.page';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { CustomerServicePage } from './customer-service/customer-service.page';
import { ChatPage } from './chat/chat.page';
import { BlacklistPage } from './blacklist/blacklist.page';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ChatResolve } from './chat/chat.resolve';
import { MessageResolve } from './message.guard';
import { ReactiveComponentModule } from '@peacha-core';
import { PeachaComponentsModule } from '@peacha-core/components';
import { MessageApiService } from './message-api.service';
import { SingleCard } from './single-card/single-card';
import { BulletinPage } from './bulletin/bulletin.page';

@NgModule({
	declarations: [
		MessagePage,
		ChatPage,
		ReceiveReplyPage,
		ReceiveLikePage,
		SystemNoticePage,
		SystemInstallPage,
		CustomerServicePage,
		BlacklistPage,
		SingleCard,
		BulletinPage
	],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		PeachaComponentsModule,
		NzRadioModule,
		FormsModule,
		ScrollingModule,
		RouterModule.forChild([
			{
				path: '',
				component: MessagePage,
				canActivate: [MessageResolve],
				children: [
					{
						path: 'chat',
						component: ChatPage,
						resolve: {
							chat: ChatResolve,
						},
					},
					{
						path: 'reply',
						component: ReceiveReplyPage,
					},
					{
						path: 'likeme',
						component: ReceiveLikePage,
					},
					{
						path: 'system',
						component: SystemNoticePage,
					},
					{
						path: 'install',
						component: SystemInstallPage,
					},
					{
						path: 'customer-service',
						component: CustomerServicePage,
					},
					{
						path: 'blacklist',
						component: BlacklistPage,
					},
					{
						path: 'bulletin',
						component: BulletinPage
					}
				],
			},
		]),
		ReactiveComponentModule,
	],
	providers: [ChatResolve, MessageResolve, MessageApiService],
})
export class MessageModule { }
