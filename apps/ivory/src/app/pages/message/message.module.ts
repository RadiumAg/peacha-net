import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MessagePage } from './message.page';
import { ReceiveReplyPage } from './receive-reply/receive-reply.page';
import { ReceiveLikePage } from './receive-like/receive-like.page';
import { SystemNoticePage } from './system-notice/system-notice.page';
import { SystemInstallPage } from './system-install/system-install.page';
import { Subreply } from './receive-reply/subreply/subreply';
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

@NgModule({
	declarations: [
		MessagePage,
		ChatPage,
		ReceiveReplyPage,
		ReceiveLikePage,
		SystemNoticePage,
		SystemInstallPage,
		Subreply,
		CustomerServicePage,
		BlacklistPage,
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
				],
			},
		]),
		ReactiveComponentModule,
	],
	providers: [ChatResolve, MessageResolve],
})
export class MessageModule { }
