import { ActivatedRoute } from '@angular/router';
import { Component, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SelectData, SELECT_DATA_TOKEN } from '@peacha-core';

@Component({
	selector: 'ivo-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.less'],
})
export class HeaderComponent {
	title: string[];
	constructor(
		private router: ActivatedRoute,
		@Inject(SELECT_DATA_TOKEN)
		public select_data_token: BehaviorSubject<SelectData>
	) {
		this.router.data.subscribe((x: { header_title: string[] }) => {
			this.title = x.header_title;
		});
	}

}
