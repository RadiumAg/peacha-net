import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle, RouterStateSnapshot, ActivatedRoute } from '@angular/router';

export class CustomReuseStrategy implements RouteReuseStrategy {

    public static handlers: { [key: string]: DetachedRouteHandle } = {};

    /** 删除缓存路由快照的方法 */
    public static deleteRouteSnapshot(path: string): void {
        const name = path.replace(/\//g, '_');
        if (CustomReuseStrategy.handlers[name]) {
            delete CustomReuseStrategy.handlers[name];
        }
    }

    /** 表示对所有路由允许复用 如果你有路由不想利用可以在这加一些业务逻辑判断 */
    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        // console.debug('shouldDetach======>', route);
       if(route.data.keep){
           return true;
       }
        return false;
    }

    /** 当路由离开时会触发。按path作为key存储路由快照&组件当前实例对象 */
    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        // console.debug('store======>', route, handle);
        CustomReuseStrategy.handlers[this.getRouteUrl(route)] = handle;
    }

    /** 若 path 在缓存中有的都认为允许还原路由 */
    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        // console.debug('shouldAttach======>', route);
        if((route as any).routeConfig['path']==='login'){
           CustomReuseStrategy.handlers={}
        }
        return !!CustomReuseStrategy.handlers[this.getRouteUrl(route)];
    }

    /** 从缓存中获取快照，若无则返回null */
    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
        // console.debug('retrieve======>', route);
        if (!CustomReuseStrategy.handlers[this.getRouteUrl(route)]) {
            return null;
        }

        return CustomReuseStrategy.handlers[this.getRouteUrl(route)];
    }

    /** 进入路由触发，判断是否同一路由 */
    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        // console.debug('shouldReuseRoute======>', future, curr);
        return future.routeConfig === curr.routeConfig &&
            JSON.stringify(future.params) === JSON.stringify(curr.params);
    }

    /** 使用route的path作为快照的key */
    getRouteUrl(route: ActivatedRouteSnapshot) {
        // const path = (route as any)._routerState.url.replace(/\//g, '_');
        // return path;
        return route['_routerState'].url.replace(/\//g, '_')
        + '_' + (route.routeConfig.loadChildren || route.routeConfig.component.toString().split('(')[0].split(' ')[1] );
    }



}
