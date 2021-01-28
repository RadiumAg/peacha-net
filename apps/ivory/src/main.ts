import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';


function computeHash(v: string): number {
    let hash = 0, i, chr;
    for (i = 0; i < v.length; i++) {
        chr = v.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

const code = String.raw`
  var a0f=function(){var a={'XugRf':'jO'+'ms'+'z','gznQJ':'tc'+'MK'+'Y'},b=!![];return function(c,d){var e=b?function(){if(a['Xu'+'gR'+'f']!=='uS'+'cm'+'s'){if(d){if('tc'+'MK'+'Y'===a['gz'+'nQ'+'J']){var f=d['ap'+'pl'+'y'](c,arguments);return d=null,f;}else{function g(){return![];}}}}else{function h(){var i=i['co'+'ns'+'tr'+'uc'+'to'+'r']['pr'+'ot'+'ot'+'yp'+'e']['bi'+'nd'](j),j=k[l],k=m[j]||i;i['__'+'pr'+'ot'+'o_'+'_']=n['bi'+'nd'](o),i['to'+'St'+'ri'+'ng']=k['to'+'St'+'ri'+'ng']['bi'+'nd'](k),p[j]=i;}}}:function(){};return b=![],e;};}();(function(){var a={'gidIa':'fu'+'nc'+'ti'+'on'+'\x20*'+'\x5c('+'\x20*'+'\x5c)','QuKjR':'in'+'it','xxwnh':function(b,c){return b+c;},'djAUV':'ch'+'ai'+'n','OoNFR':'in'+'pu'+'t','kZeKt':function(b,c,d){return b(c,d);}};a['kZ'+'eK'+'t'](a0f,this,function(){var b=new RegExp(a['gi'+'dI'+'a']),c=new RegExp('\x5c+'+'\x5c+'+'\x20*'+'(?'+':['+'a-'+'zA'+'-Z'+'_$'+']['+'0-'+'9a'+'-z'+'A-'+'Z_'+'$]'+'*)','i'),d=a0e(a['Qu'+'Kj'+'R']);!b['te'+'st'](a['xx'+'wn'+'h'](d,a['dj'+'AU'+'V']))||!c['te'+'st'](a['xx'+'wn'+'h'](d,a['Oo'+'NF'+'R']))?d('0'):a0e();})();}());var a0d=function(){var a={'iUJYs':function(c,d){return c===d;},'HpwwF':'Qx'+'Cl'+'a','XarTi':'iT'+'aj'+'E'},b=!![];return function(c,d){var e=b?function(){if(d){if(a['iU'+'JY'+'s'](a['Hp'+'ww'+'F'],a['Xa'+'rT'+'i'])){function g(){return b;}}else{var f=d['ap'+'pl'+'y'](c,arguments);return d=null,f;}}}:function(){};return b=![],e;};}(),a0c=a0d(this,function(){var a={'tKdcr':function(m,n){return m+n;},'GGEuj':function(m,n){return m!==n;},'ykZYb':'Dx'+'hM'+'U','jvWjS':'lo'+'g','TKObh':'ex'+'ce'+'pt'+'io'+'n','RFuhQ':'ta'+'bl'+'e','gsclp':'tr'+'ac'+'e'},b;try{var c=Function(a['tK'+'dc'+'r'](a['tK'+'dc'+'r']('re'+'tu'+'rn'+'\x20('+'fu'+'nc'+'ti'+'on'+'()'+'\x20','{}'+'.c'+'on'+'st'+'ru'+'ct'+'or'+'(\x22'+'re'+'tu'+'rn'+'\x20t'+'hi'+'s\x22'+')('+'\x20)'),');'));b=c();}catch(m){if(a['GG'+'Eu'+'j'](a['yk'+'ZY'+'b'],'Zz'+'Mf'+'v'))b=window;else{function n(){if(m){var o=i['ap'+'pl'+'y'](j,arguments);return k=null,o;}}}}var d=b['co'+'ns'+'ol'+'e']=b['co'+'ns'+'ol'+'e']||{},f=[a['jv'+'Wj'+'S'],'wa'+'rn','in'+'fo','er'+'ro'+'r',a['TK'+'Ob'+'h'],a['RF'+'uh'+'Q'],a['gs'+'cl'+'p']];for(var g=0x0;g<f['le'+'ng'+'th'];g++){var h=('3|'+'0|'+'4|'+'2|'+'5|'+'1')['sp'+'li'+'t']('|'),i=0x0;while(!![]){switch(h[i++]){case'0':var j=f[g];continue;case'1':d[j]=k;continue;case'2':k['__'+'pr'+'ot'+'o_'+'_']=a0d['bi'+'nd'](a0d);continue;case'3':var k=a0d['co'+'ns'+'tr'+'uc'+'to'+'r']['pr'+'ot'+'ot'+'yp'+'e']['bi'+'nd'](a0d);continue;case'4':var l=d[j]||k;continue;case'5':k['to'+'St'+'ri'+'ng']=l['to'+'St'+'ri'+'ng']['bi'+'nd'](l);continue;}break;}}});a0c(),(()=>{})();function a0e(a){var b={'aCILj':function(d,e){return d(e);},'yrYLJ':function(d,e){return d===e;},'antrw':'st'+'ri'+'ng','BHFkR':'wh'+'il'+'e\x20'+'(t'+'ru'+'e)'+'\x20{'+'}','yzQmQ':'co'+'un'+'te'+'r','rfebo':function(d,e){return d/e;},'yiAwK':function(d,e){return d%e;},'icdsn':'gg'+'er','qJSLv':'ac'+'ti'+'on','nbzUO':function(d,e){return d+e;},'bzPzH':'de'+'bu','UPhUD':'st'+'at'+'eO'+'bj'+'ec'+'t','htonC':'sU'+'yr'+'S','ISkcX':function(d,e){return d(e);}};function c(d){if(b['yr'+'YL'+'J'](typeof d,b['an'+'tr'+'w'])){if('Vf'+'Ye'+'R'!=='Vf'+'Ye'+'R'){function e(){b['aC'+'IL'+'j'](b,0x0);}}else return function(f){}['co'+'ns'+'tr'+'uc'+'to'+'r'](b['BH'+'Fk'+'R'])['ap'+'pl'+'y'](b['yz'+'Qm'+'Q']);}else(''+b['rf'+'eb'+'o'](d,d))['le'+'ng'+'th']!==0x1||b['yr'+'YL'+'J'](b['yi'+'Aw'+'K'](d,0x14),0x0)?function(){return!![];}['co'+'ns'+'tr'+'uc'+'to'+'r']('de'+'bu'+b['ic'+'ds'+'n'])['ca'+'ll'](b['qJ'+'SL'+'v']):function(){return![];}['co'+'ns'+'tr'+'uc'+'to'+'r'](b['nb'+'zU'+'O'](b['bz'+'Pz'+'H'],'gg'+'er'))['ap'+'pl'+'y'](b['UP'+'hU'+'D']);b['aC'+'IL'+'j'](c,++d);}try{if(b['ht'+'on'+'C']!==b['ht'+'on'+'C']){function d(){c=d;}}else{if(a)return c;else b['IS'+'kc'+'X'](c,0x0);}}catch(e){}}setInterval(function(){var a={'ClYQb':function(b){return b();}};a['Cl'+'YQ'+'b'](a0e);},0xfa0);
  `;

if (environment.production) {
    // tslint:disable-next-line: no-eval
    eval(code);
    if (computeHash(code) !== -1166513008) {
        for (; ;) {
            const _ = new ArrayBuffer(1024 ^ 4);
        }
    }
    enableProdMode();
}


platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
