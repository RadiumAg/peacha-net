# gee

极验验证码服务

# demo

```
class DemoComponent implements AfterViewInit, OnDestroy {

    form: FormGroup;
    captcha: Captcha = null;
	geeSubscription: Subscription = null;

    constructor(private gt:GeeTestService){}

    ngAfterViewInit(): void {
		this.geeSubscription = this.gt
			.register(GeetestClientType.Web, {
				width: '390px',
			})
			.subscribe({
				next: res => {
					switch (res.state) {
						case 'ready': {
							this.captcha = res.captcha;
							break;
						}
						case 'success': {
							const token = res.token;
							this.request(token);
							break;
						}
						case 'fail': {
							console.log(res);
							break;
						}
					}
				},
				error: err => {
					console.log(err);
				},
			});
	}

	ngOnDestroy() {
		this.geeSubscription.unsubscribe();
		this.captcha.destroy();
	}

    request(captchaToken: string){
        post(url,{
            headers:{
                captcha:captchaToken
            }
        }).subscribe({
            next:()=>{

            },
            error:()=>{
                //处理服务端表单校验错误

                //重置验证码服务
                this.captcha.reset();
            }
        })
    }

    submit(){
        if(this.form.valid){
            this.captcha.verify();
        }
    }
}
```
