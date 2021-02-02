import { BehaviorSubject } from 'rxjs';
import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SelectData, SELECT_DATA_TOKEN, SELECT_TOKEN } from '@peacha-core';


@Component({
	selector: 'ivo-footer',
	templateUrl: './footer.component.html',
	styleUrls: ['./footer.component.less'],
})
export class FooterComponent {
	constructor(
		private router: ActivatedRoute,
		@Inject(SELECT_TOKEN) public select_token: BehaviorSubject<boolean>,
		@Inject(SELECT_DATA_TOKEN)
		public select_data_token: BehaviorSubject<SelectData>
	) { }

}
